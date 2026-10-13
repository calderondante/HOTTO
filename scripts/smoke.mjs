import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdirSync, openSync, closeSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

mkdirSync(".cache", { recursive: true });
const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
const log = openSync(".cache/smoke-server.log", "w", 0o600);
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start",
  "--hostname", "127.0.0.1", "--port", String(port)], {
  detached: process.platform !== "win32",
  stdio: ["ignore", log, log],
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
});
closeSync(log);
let spawnError;
server.on("error", error => { spawnError = error; });
try {
  let response;
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (spawnError || server.exitCode !== null) {
      throw new Error("Next.js no arrancó; revisar .cache/smoke-server.log.", { cause: spawnError });
    }
    try {
      response = await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) break;
    } catch { /* Wait for our server to complete startup. */ }
    await delay(250);
  }
  assert(response?.ok, "El servidor no respondió HTTP 200 dentro del plazo.");
  const html = await response.text();
  assert.match(html, /<html[^>]+lang="es-AR"/);
  assert.match(html, /<h1[^>]*>HOTTO<\/h1>/);
  assert.match(html, /Proyecto en preparación/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  const cssPath = html.match(/href="([^" ]+\.css(?:\?[^" ]*)?)"/)?.[1];
  assert(cssPath, "El HTML no referencia la hoja de estilos compilada.");
  const css = await fetch(new URL(cssPath.replaceAll("&amp;", "&"), `http://127.0.0.1:${port}`));
  assert.equal(css.status, 200, "La hoja de estilos no se sirve correctamente.");
  const styles = await css.text();
  assert.match(styles, /--brand-violet/);
  assert.match(styles, /min-height:100svh/);
  const missing = await fetch(`http://127.0.0.1:${port}/__bootstrap_missing__`);
  assert.equal(missing.status, 404);
  console.log("Smoke producción: HTML HOTTO, español, noindex, CSS Tailwind/shadcn y 404 verificados.");
} finally {
  if (server.exitCode === null && server.pid) {
    if (process.platform === "win32") server.kill("SIGTERM");
    else process.kill(-server.pid, "SIGTERM");
    await Promise.race([once(server, "exit"), delay(5000)]);
    if (server.exitCode === null) {
      if (process.platform === "win32") server.kill("SIGKILL");
      else process.kill(-server.pid, "SIGKILL");
    }
  }
}
