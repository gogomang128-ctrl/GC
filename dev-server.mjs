// سيرفر محلي بدون أي مكتبات خارجية (Node.js فقط)
// التشغيل:  node dev-server.mjs        ثم افتح http://localhost:8080/
// ملاحظة: لا تفتح index.html مباشرة بـ file:// لأن تسجيل دخول Google
// يفشل مع auth/unauthorized-domain في هذه الحالة.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
// ملفات الموقع كلها داخل public/ بما يطابق إعداد Firebase Hosting
const root = path.join(scriptDir, "public");
const port = Number(process.env.PORT) || Number(process.argv[2]) || 8080;

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4"
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  if (pathname.endsWith("/")) pathname += "index.html";

  const target = path.join(root, path.normalize(pathname).replace(/^[/\\]+/, ""));
  if (!target.startsWith(root)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end('<h1 dir="rtl" style="font-family:sans-serif">404 - الملف غير موجود</h1>');
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(target).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(target).pipe(res);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log("GCCC game store - local server");
  console.log(`  root:     ${root}`);
  console.log(`  local:   http://localhost:${port}/`);
  console.log(`  local:   http://127.0.0.1:${port}/`);
  for (const ip of Object.values(os.networkInterfaces()).flat()) {
    if (ip && ip.family === "IPv4" && !ip.internal) console.log(`  network: http://${ip}:${port}/`);
  }
});
