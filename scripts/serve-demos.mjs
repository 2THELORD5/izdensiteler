#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { networkInterfaces } from "node:os";

const ROOT = resolve(import.meta.dirname, "..");
const DESKTOP = resolve(ROOT, "..");

const STATICS = [
  { name: "burger", port: 5210, dir: join(DESKTOP, "hamburger") },
  { name: "insaat", port: 5211, dir: join(DESKTOP, "inşaat") },
  { name: "galeri", port: 5212, dir: join(DESKTOP, "galeri") },
  {
    name: "signal",
    port: 5213,
    dir: join(ROOT, "public", "demos", "signal"),
  },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function resolveFile(dir, urlPath) {
  let filePath = join(dir, normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
  if (urlPath.endsWith("/") || !extname(filePath)) {
    const asIndex = join(filePath, "index.html");
    if (existsSync(asIndex)) return asIndex;
    if (!extname(filePath) && existsSync(`${filePath}.html`)) return `${filePath}.html`;
    if (urlPath === "/" && existsSync(join(dir, "index.html"))) return join(dir, "index.html");
  }
  return filePath;
}

function sendFile(req, res, filePath) {
  const stat = statSync(filePath);
  const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
  const size = stat.size;
  const range = req.headers.range;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.setHeader("Access-Control-Expose-Headers", "Accept-Ranges, Content-Range, Content-Length");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Security-Policy", "frame-ancestors *");
  res.setHeader("Cache-Control", "public, max-age=3600");

  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (!m) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` });
      res.end();
      return;
    }
    let start = m[1] ? parseInt(m[1], 10) : 0;
    let end = m[2] ? parseInt(m[2], 10) : size - 1;
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` });
      res.end();
      return;
    }
    end = Math.min(end, size - 1);
    const chunk = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": chunk,
      "Content-Type": type,
    });
    createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": size,
  });
  createReadStream(filePath).pipe(res);
}

function serveStatic(dir, port, name) {
  if (!existsSync(dir)) {
    console.warn(`[skip] ${name}: missing ${dir}`);
    return null;
  }

  const server = createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
        "Access-Control-Allow-Headers": "Range",
        "Access-Control-Max-Age": "86400",
      });
      res.end();
      return;
    }

    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const filePath = resolveFile(dir, urlPath);
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    sendFile(req, res, filePath);
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`[ok] ${name} → http://127.0.0.1:${port}`);
  });
  return server;
}

function spawnNext(name, cwd) {
  if (!existsSync(join(cwd, "package.json"))) {
    console.warn(`[skip] ${name}: no package.json`);
    return null;
  }
  const child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev"],
    { cwd, stdio: "inherit", env: { ...process.env } }
  );
  child.on("exit", (code) => console.warn(`[exit] ${name} code=${code}`));
  console.log(`[boot] ${name}`);
  return child;
}

for (const s of STATICS) serveStatic(s.dir, s.port, s.name);
spawnNext("kumrucu", join(DESKTOP, "kumrucu"));
spawnNext("junesun", join(DESKTOP, "junesun"));

const portal = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "dev"],
  { cwd: ROOT, stdio: "inherit" }
);

console.log("\nİzden Siteler → http://127.0.0.1:5300\n");
const lan = Object.values(networkInterfaces())
  .flat()
  .find((n) => n && n.family === "IPv4" && !n.internal);
if (lan) console.log(`LAN: http://${lan.address}:5300\n`);

function shutdown() {
  try {
    portal.kill("SIGTERM");
  } catch {}
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
