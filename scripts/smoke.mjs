import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdirSync, openSync, closeSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { subjects, resources, files } from "../src/lib/library/data.ts";
import { resourceHref } from "../src/lib/library/repository.ts";

mkdirSync(".cache", { recursive: true });
const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise((resolve, reject) =>
  probe.close((error) => (error ? reject(error) : resolve())),
);
const log = openSync(".cache/smoke-server.log", "w", 0o600);
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    detached: process.platform !== "win32",
    stdio: ["ignore", log, log],
    env: {
      ...process.env,
      HOTTO_BUILD_DIR: ".next-production",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
);
closeSync(log);
let spawnError;
server.on("error", (error) => {
  spawnError = error;
});
const base = `http://127.0.0.1:${port}`;
const read = async (path) => {
  const res = await fetch(`${base}${path}`, {
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(res.status, 200, path);
  return res.text();
};
try {
  let ready = false;
  for (const deadline = Date.now() + 60000; Date.now() < deadline; ) {
    if (spawnError || server.exitCode !== null)
      throw new Error("Next no arrancó; ver .cache/smoke-server.log", {
        cause: spawnError,
      });
    try {
      ready = (await fetch(base, { signal: AbortSignal.timeout(2000) })).ok;
    } catch {
      /* our server is still starting */
    }
    if (ready) break;
    await delay(250);
  }
  assert(ready, "No respondió dentro del plazo");
  const paths = [
    "/",
    "/biblioteca",
    "/biblioteca/materias",
    "/biblioteca/jurisprudencia",
    ...subjects.map((s) => `/biblioteca/materias/${s.slug}`),
    ...resources.map(resourceHref),
  ];
  let root;
  for (const path of paths) {
    const html = await read(path);
    assert.match(html, /<html[^>]+lang="es-AR"/);
    assert.match(html, /<h1[ >]/, path);
    assert.match(html, /<title>[^<]*HOTTO[^<]*<\/title>/, path);
    assert.match(html, /name="description" content="[^"]+"/, path);
    assert.match(html, /noindex, nofollow/, path);
    assert.doesNotMatch(
      html,
      /NEXT_PUBLIC_SUPABASE|service_role|Hydration failed/,
      path,
    );
    if (path === "/") root = html;
  }
  const all = await read("/biblioteca");
  assert.equal((all.match(/class="resource-card"/g) || []).length, 13);
  const filtered = await read(
    "/biblioteca?q=constitucion&materia=2304&tipo=book&disponibles=1",
  );
  assert.equal((filtered.match(/class="resource-card"/g) || []).length, 1);
  assert.match(filtered, /Ver ficha: Constitución y ciudadanía/);
  const none = await read("/biblioteca?q=zzzmissingzzz");
  assert.match(none, /No encontramos recursos/);
  assert.equal((none.match(/class="resource-card"/g) || []).length, 0);
  const subjectsHtml = await read("/biblioteca/materias");
  assert.equal((subjectsHtml.match(/class="subject-card/g) || []).length, 34);
  for (const path of [
    "/missing",
    "/biblioteca/libros/missing",
    "/biblioteca/materias/missing",
    "/biblioteca/jurisprudencia/missing",
    "/biblioteca/recursos/missing",
  ])
    assert.equal((await fetch(`${base}${path}`)).status, 404, path);
  for (const file of files) {
    const res = await fetch(`${base}${file.path}`);
    assert.equal(res.status, 200, file.path);
    assert.match(res.headers.get("content-type"), /application\/pdf/);
    const body = Buffer.from(await res.arrayBuffer());
    assert.equal(body.subarray(0, 8).toString(), "%PDF-1.4");
  }
  const cssPath = root.match(/href="([^" ]+\.css(?:\?[^" ]*)?)"/)?.[1];
  assert(cssPath);
  const css = await fetch(new URL(cssPath.replaceAll("&amp;", "&"), base));
  assert.equal(css.status, 200);
  const styles = await css.text();
  assert.match(styles, /--brand-violet/);
  assert.match(styles, /prefers-reduced-motion/);
  console.log(
    `Smoke producción: ${paths.length} páginas, 34 materias, 13 fichas, filtros SSR, búsquedas vacías, 5 rutas 404, 2 PDF reales, SEO y CSS verificados.`,
  );
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
