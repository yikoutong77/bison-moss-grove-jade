import type { ClientMsg, ServerMsg } from "./protocol";

const CLIENT_KEY = "tavern-client-id";
const NAME_KEY = "tavern-player-name";
const ROOM_KEY = "tavern-room-code";

export function getClientId() {
  try {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = `c-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  } catch {
    return `c-${Date.now()}`;
  }
}

export function getSavedName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

export function getLastRoom() {
  try {
    return sessionStorage.getItem(ROOM_KEY) || localStorage.getItem(ROOM_KEY) || "";
  } catch {
    return "";
  }
}

export function rememberRoom(code: string) {
  try {
    sessionStorage.setItem(ROOM_KEY, code);
    localStorage.setItem(ROOM_KEY, code);
  } catch {
    /* ignore */
  }
}

export function forgetRoom() {
  try {
    sessionStorage.removeItem(ROOM_KEY);
    localStorage.removeItem(ROOM_KEY);
  } catch {
    /* ignore */
  }
}

export function wsCandidates() {
  const env = import.meta.env.VITE_WS_URL as string | undefined;
  if (env) return [env];
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  const { host, hostname, port } = location;
  const list = [`${proto}//${host}/ws`];
  if (port !== "8787") {
    list.push(`${proto}//${hostname}:8787`);
    list.push(`${proto}//${hostname}:8787/ws`);
  }
  return [...new Set(list)];
}

type Handler = (msg: ServerMsg) => void;

let socket: WebSocket | null = null;
const handlers = new Set<Handler>();
let helloName = "旅人";
let stayOnline = false;
let resume = false;
let retryTimer: number | null = null;
let pingTimer: number | null = null;
let retry = 0;
let watchersOn = false;

export function onServer(handler: Handler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

function emit(msg: ServerMsg) {
  for (const h of handlers) h(msg);
}

export function send(msg: ClientMsg) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify(msg));
  return true;
}

function stopPing() {
  if (pingTimer) {
    window.clearInterval(pingTimer);
    pingTimer = null;
  }
}

function startPing() {
  stopPing();
  pingTimer = window.setInterval(() => {
    send({ t: "ping" });
  }, 12_000);
}

function clearRetry() {
  if (retryTimer) {
    window.clearTimeout(retryTimer);
    retryTimer = null;
  }
}

export function disconnect() {
  stayOnline = false;
  resume = false;
  retry = 0;
  clearRetry();
  stopPing();
  socket?.close();
  socket = null;
}

function openSocket(url: string, timeoutMs: number) {
  return new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = window.setTimeout(() => {
      ws.close();
      reject(new Error(`连接超时 ${url}`));
    }, timeoutMs);
    ws.onopen = () => {
      window.clearTimeout(timer);
      resolve(ws);
    };
    ws.onerror = () => {
      window.clearTimeout(timer);
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      reject(new Error(`无法连接 ${url}`));
    };
  });
}

function scheduleReconnect() {
  if (!stayOnline) return;
  clearRetry();
  const delay = Math.min(8_000, 500 * 2 ** Math.min(retry, 4));
  retry += 1;
  retryTimer = window.setTimeout(() => {
    connect(helloName).catch(() => scheduleReconnect());
  }, delay);
}

function bindWatchers() {
  if (watchersOn) return;
  watchersOn = true;
  const kick = () => {
    if (!stayOnline) return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      send({ t: "ping" });
      return;
    }
    retry = 0;
    connect(helloName).catch(() => scheduleReconnect());
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") kick();
  });
  window.addEventListener("online", kick);
  window.addEventListener("pageshow", kick);
}

export async function connect(name: string): Promise<void> {
  helloName = name.trim() || "旅人";
  saveName(helloName);
  stayOnline = true;
  bindWatchers();
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    send({ t: "hello", name: helloName, clientId: getClientId() });
    const code = getLastRoom();
    if (resume && code) send({ t: "join", code });
    return;
  }
  const urls = wsCandidates();
  let lastErr: Error | null = null;
  for (const url of urls) {
    try {
      const ws = await openSocket(url, 4000);
      socket = ws;
      retry = 0;
      startPing();
      ws.onmessage = (ev) => {
        try {
          emit(JSON.parse(String(ev.data)) as ServerMsg);
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        stopPing();
        if (socket === ws) socket = null;
        if (!stayOnline) return;
        resume = true;
        emit({ t: "toast", message: "连接中断，正在重连…" });
        scheduleReconnect();
      };
      send({ t: "hello", name: helloName, clientId: getClientId() });
      const code = getLastRoom();
      if (resume && code) {
        send({ t: "join", code });
        resume = false;
      }
      return;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }
  emit({ t: "error", message: "无法连接房间服务，请检查 8787 或 /ws 反代" });
  if (stayOnline) scheduleReconnect();
  throw lastErr ?? new Error("无法连接房间服务");
}

export function isOnline() {
  return socket?.readyState === WebSocket.OPEN;
}
