#!/usr/bin/env node
/**
 * Produce a BaoTa-ready static site in `.output/public` (and `dist/`).
 * TanStack Start's nitro "static" preset prerenders index.html, then may
 * fail on an unused nitro SSR environment — we treat a valid index.html
 * as success and rewrite the stylesheet href to the client CSS chunk.
 */
import { spawn } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, ".output", "public");
const distDir = join(root, "dist");
const binPath = join(root, "node_modules", ".bin");

function runViteBuild() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/with-app-env.mjs", "vite", "build"], {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        STATIC_EXPORT: "1",
        PATH: `${binPath}${process.env.PATH ? `:${process.env.PATH}` : ""}`,
      },
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

const code = await runViteBuild();
const indexPath = join(publicDir, "index.html");
if (!existsSync(indexPath)) {
  console.error("[build:static] missing .output/public/index.html");
  process.exit(code || 1);
}

const assetsDir = join(publicDir, "assets");
const cssFiles = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((name) => name.endsWith(".css"))
  : [];
if (cssFiles.length === 0) {
  console.error("[build:static] no CSS in .output/public/assets");
  process.exit(1);
}
const cssHref = `/assets/${cssFiles[0]}`;
const html = readFileSync(indexPath, "utf8").replace(/\/assets\/styles-[^"]+\.css/g, cssHref);
writeFileSync(indexPath, html);
copyFileSync(indexPath, join(publicDir, "404.html"));

const strayZip = join(publicDir, "tavern-battlegrounds.zip");
if (existsSync(strayZip)) rmSync(strayZip);

if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(publicDir, distDir, { recursive: true });

console.log(`[build:static] ready — upload dist/ (or .output/public) as the site root`);
process.exit(0);
