import { HEROES, heroArt } from "./heroes";
import { MINIONS, artUrl } from "./minions";

export interface LoadProgress {
  loaded: number;
  total: number;
  failed: number;
  bytes: number;
  bytesTotal: number;
  current: string;
  elapsedMs: number;
}

export function collectAssetUrls(): string[] {
  const urls = new Set<string>(["/tavern-bg.jpg"]);
  for (const h of HEROES) urls.add(heroArt(h.art));
  for (const m of MINIONS) urls.add(artUrl(m.art));
  return [...urls];
}

function fileName(url: string) {
  return url.split("/").pop() ?? url;
}

async function loadOne(
  url: string,
  onBytes: (delta: number, totalHint: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(url, { signal, cache: "force-cache" });
  if (!res.ok) throw new Error(String(res.status));
  const hint = Number(res.headers.get("content-length")) || 0;
  if (!res.body) {
    const blob = await res.blob();
    onBytes(blob.size, blob.size);
    await decodeBlob(blob);
    return;
  }
  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    onBytes(value.byteLength, hint);
  }
  const blob = new Blob(chunks);
  if (!hint) onBytes(0, received);
  await decodeBlob(blob);
}

async function decodeBlob(blob: Blob) {
  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(blob);
    bmp.close();
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    const href = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(href);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(href);
      reject(new Error("decode"));
    };
    img.src = href;
  });
}

export function preloadAssets(
  onProgress: (p: LoadProgress) => void,
  signal?: AbortSignal,
): Promise<LoadProgress> {
  const urls = collectAssetUrls();
  const started = performance.now();
  const state: LoadProgress = {
    loaded: 0,
    total: urls.length,
    failed: 0,
    bytes: 0,
    bytesTotal: 0,
    current: fileName(urls[0] ?? ""),
    elapsedMs: 0,
  };
  const emit = () => {
    state.elapsedMs = performance.now() - started;
    onProgress({ ...state });
  };
  emit();

  const limit = 6;
  let cursor = 0;

  const worker = async () => {
    while (cursor < urls.length) {
      if (signal?.aborted) return;
      const i = cursor++;
      const url = urls[i]!;
      state.current = fileName(url);
      emit();
      try {
        let sized = false;
        await loadOne(
          url,
          (delta, hint) => {
            state.bytes += delta;
            if (!sized && hint > 0) {
              state.bytesTotal += hint;
              sized = true;
            }
            emit();
          },
          signal,
        );
      } catch {
        state.failed += 1;
      }
      state.loaded += 1;
      emit();
    }
  };

  return Promise.all(Array.from({ length: Math.min(limit, urls.length) }, () => worker())).then(() => {
    state.current = state.failed ? `${state.failed} 张未加载` : "就绪";
    state.elapsedMs = performance.now() - started;
    onProgress({ ...state });
    return state;
  });
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}
