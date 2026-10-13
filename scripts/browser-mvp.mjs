import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  mkdtempSync,
  existsSync,
} from "node:fs";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { subjects, resources, files } from "../src/lib/library/data.ts";
import { resourceHref } from "../src/lib/library/repository.ts";

const base = process.env.HOTTO_TEST_URL || "http://127.0.0.1:3001";
assert(
  ["127.0.0.1", "localhost"].includes(new URL(base).hostname),
  "Only test the local HOTTO instance.",
);
const browser = (...args) => {
  const result = spawnSync("bash", ["scripts/browser.sh", ...args], {
    encoding: "utf8",
    env: process.env,
    timeout: 60000,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
};
browser("open", `${base}/biblioteca`);
const cdpUrl = JSON.parse(browser("get", "cdp-url", "--json")).data.cdpUrl;
const address = new URL(cdpUrl);
const targets = await (await fetch(`http://${address.host}/json/list`)).json();
const target = targets.find((t) => t.type === "page" && t.url.startsWith(base));
assert(target, "The named browser session has no HOTTO tab.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let serial = 0;
const pending = new Map();
const errors = [];
const report = [];
let documents = 0;
socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.method === "Page.frameNavigated" && !msg.params.frame.parentId) documents++;
  if (msg.id) {
    const promise = pending.get(msg.id);
    if (promise) {
      pending.delete(msg.id);
      if (msg.error) promise.reject(new Error(JSON.stringify(msg.error)));
      else promise.resolve(msg.result);
    }
  }
  if (msg.method === "Runtime.exceptionThrown")
    errors.push(msg.params.exceptionDetails.text);
});
const command = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const result = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails)
    throw new Error(
      result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text,
    );
  return result.result.value;
};
const wait = async (expression, previousDocument = null) => {
  for (const end = Date.now() + 30000; Date.now() < end; ) {
    if ((previousDocument === null || documents > previousDocument) && await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(`Timed out: ${expression}`);
};
const go = async (path) => {
  const before = documents;
  await command("Page.navigate", { url: `${base}${path}` });
  await wait(
    'document.readyState === "complete" && Boolean(document.querySelector("main h1"))',
    before,
  );
};
const click = async (selector) => {
  const point = await evaluate(
    `(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error("Missing click target");e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`,
  );
  await command("Input.dispatchMouseEvent", {
    type: "mousePressed",
    button: "left",
    clickCount: 1,
    ...point,
  });
  await command("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    button: "left",
    clickCount: 1,
    ...point,
  });
};
const key = async (key, code, numeric) => {
  // Use the browser's native key mapping for activation/focus keys (including
  // the character event required by Chrome for Enter on a disclosure).
  if (["Enter", "Tab", "Escape"].includes(key)) {
    browser("press", key);
    return;
  }
  await command("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    windowsVirtualKeyCode: numeric,
  });
  await command("Input.dispatchKeyEvent", {
    type: "keyUp",
    key,
    code,
    windowsVirtualKeyCode: numeric,
  });
};
const fill = async (selector, value) => {
  await evaluate(
    `document.querySelector(${JSON.stringify(selector)}).focus();document.querySelector(${JSON.stringify(selector)}).select()`,
  );
  await command("Input.insertText", { text: value });
};
const select = async (selector, value) => {
  const index = await evaluate(
    `(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.focus();return [...e.options].findIndex(o=>o.value===${JSON.stringify(value)});})()`,
  );
  assert(index >= 0);
  await key("Home", "Home", 36);
  for (let i = 0; i < index; i++) await key("ArrowDown", "ArrowDown", 40);
  assert.equal(
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).value`),
    value,
  );
};
const count = () =>
  evaluate('document.querySelectorAll(".resource-card").length');
const button = async (text) => {
  const selector = await evaluate(
    `(()=>{const e=[...document.querySelectorAll("button[data-slot=button]")].find(e=>e.textContent.trim()===${JSON.stringify(text)});if(!e)throw Error("Missing button");e.dataset.browserTarget="true";return '[data-browser-target="true"]';})()`,
  );
  await click(selector);
  await evaluate(
    'document.querySelector("[data-browser-target]")?.removeAttribute("data-browser-target")',
  );
};
const audit = (label) => {
  const result = JSON.parse(browser("a11y", "--json"));
  writeFileSync(`.cache/a11y-${label}.json`, JSON.stringify(result, null, 2));
  assert(result.success);
  assert.equal(result.data.counts.violations, 0, `${label}: axe violations`);
  return { page: label, ...result.data.counts };
};
const viewport = (width, height = 900, mobile = false) =>
  command("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    mobile,
    deviceScaleFactor: 1,
  });
mkdirSync(".cache/browser", { recursive: true });
try {
  await command("Runtime.enable");
  await command("Page.enable");
  await viewport(1280);
  await go("/");
  await click('.home-hero a[href="/biblioteca"]');
  await wait(
    'location.pathname==="/biblioteca" && document.querySelectorAll(".resource-card").length===13',
  );
  await fill("#resource-search", "CONSTITUCION CIUDADANIA");
  await wait('document.querySelectorAll(".resource-card").length===1');
  assert.match(
    await evaluate('document.querySelector(".resource-card h3").textContent'),
    /Constitución/,
  );
  assert.equal(
    await evaluate('new URLSearchParams(location.search).get("q")'),
    "CONSTITUCION CIUDADANIA",
  );
  await button("Limpiar filtros");
  assert.equal(await count(), 13);
  await fill("#resource-search", "TALLER");
  await wait('document.querySelectorAll(".resource-card").length<13');
  assert.match(
    await evaluate('document.querySelector(".resource-card h3").textContent'),
    /Constitución/,
  );
  await fill("#resource-search", "garantias");
  await wait(
    '[...document.querySelectorAll(".resource-card h3")].some(e=>e.textContent.includes("Igualdad"))',
  );
  await fill("#resource-search", "zzzinexistentezzz");
  await wait('document.querySelector(".empty-state")!==null');
  await button("Restablecer búsqueda");
  assert.equal(await count(), 13);
  await select("#subject-filter", "2304");
  await select("#kind-filter", "book");
  await click('input[type="checkbox"]');
  await wait('document.querySelectorAll(".resource-card").length===1');
  const beforeSubmit = documents;
  await click('button[type="submit"]');
  await wait(
    'document.readyState==="complete" && document.querySelectorAll(".resource-card").length===1',
    beforeSubmit,
  );
  const beforeReload = documents;
  await command("Page.reload");
  await wait(
    'document.readyState==="complete" && document.querySelector("input[type=checkbox]")?.checked && document.querySelectorAll(".resource-card").length===1',
    beforeReload,
  );
  assert.equal(await count(), 1);
  await button("Limpiar filtros");
  assert.equal(await evaluate("location.search"), "");
  report.push({
    test: "Title, author, keywords, combined filters, empty recovery, URL and reload",
    result: "pass",
  });
  console.log("Browser search/filter/URL/reload checks passed.");
  // Follow every catalog card and subject card with actual pointer events.
  for (const r of resources) {
    await go("/biblioteca");
    await click(`.resource-main[href="${resourceHref(r)}"]`);
    await wait(
      `location.pathname===${JSON.stringify(resourceHref(r))} && document.querySelector("main h1")?.textContent===${JSON.stringify(r.title)}`,
    );
    if (r.kind === "book" && !r.fileId)
      assert.equal(
        await evaluate('document.querySelectorAll("a[download]").length'),
        0,
      );
  }
  for (const s of subjects) {
    await go("/biblioteca/materias");
    await click(`.subject-card[href="/biblioteca/materias/${s.slug}"]`);
    await wait(
      `document.querySelector("main h1")?.textContent===${JSON.stringify(s.name)}`,
    );
  }
  report.push({
    test: "13 resource cards and all 34 subject cards open their own detail",
    result: "pass",
  });
  console.log("Browser: all 47 resource and subject card navigations passed.");
  await go("/biblioteca/materias");
  await fill("#subject-search", "civil y comercial");
  await wait('document.querySelectorAll(".subject-card").length===5');
  await select("#year-filter", "5");
  await wait('document.querySelectorAll(".subject-card").length===0');
  await button("Ver todas las materias");
  assert.equal(
    await evaluate('document.querySelectorAll(".subject-card").length'),
    34,
  );
  await go("/biblioteca/libros/primeras-preguntas-del-derecho");
  const downloads = mkdtempSync(resolve(".cache/browser/download-"));
  await command("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloads,
  });
  await click("a[download]");
  const filename = resolve(downloads, "primeras-preguntas-demo.pdf");
  for (
    const end = Date.now() + 10000;
    !existsSync(filename) && Date.now() < end;

  )
    await delay(100);
  assert(existsSync(filename), "Download click did not produce a PDF");
  assert.deepEqual(
    readFileSync(filename),
    readFileSync(`public${files[0].path}`),
  );
  report.push({
    test: "Subject search/year/empty reset, reference-only actions, actual PDF download",
    result: "pass",
  });
  console.log("Browser subject controls and real PDF download passed.");
  const audits = [];
  for (const [label, path] of [
    ["home", "/"],
    ["library", "/biblioteca"],
    ["subjects", "/biblioteca/materias"],
    ["subject-pilot", "/biblioteca/materias/introduccion-al-derecho"],
    ["book", "/biblioteca/libros/primeras-preguntas-del-derecho"],
    ["reference", "/biblioteca/libros/teoria-y-fuentes-del-derecho"],
    ["case", "/biblioteca/jurisprudencia/igualdad-y-acceso-a-derechos"],
  ]) {
    await go(path);
    audits.push(audit(label));
    console.log(`Axe ${label}: 0 violations`);
  }
  const layouts = [];
  for (const width of [640, 375, 320]) {
    await viewport(width, 900, width < 640);
    for (const path of [
      "/",
      "/biblioteca",
      "/biblioteca/materias",
      "/biblioteca/materias/derecho-civil-y-comercial-ii-obligaciones-civiles-y-comerciales",
      "/biblioteca/libros/primeras-preguntas-del-derecho",
      "/biblioteca/jurisprudencia",
    ]) {
      await go(path);
      const metrics = await evaluate(
        "({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})",
      );
      assert(
        metrics.scrollWidth <= metrics.width,
        `${width}: overflow on ${path}`,
      );
      layouts.push({ path, ...metrics });
    }
  }
  await viewport(375, 812, true);
  await go("/biblioteca");
  await evaluate('document.querySelector(".mobile-menu summary").focus()');
  await key("Enter", "Enter", 13);
  assert(await evaluate('document.querySelector(".mobile-menu").open'));
  await key("Tab", "Tab", 9);
  assert.equal(await evaluate("document.activeElement.textContent"), "Inicio");
  await key("Escape", "Escape", 27);
  assert.equal(
    await evaluate('document.querySelector(".mobile-menu").open'),
    false,
  );
  assert.equal(await evaluate("document.activeElement.tagName"), "SUMMARY");
  await evaluate('document.querySelector(".skip-link").focus()');
  await key("Enter", "Enter", 13);
  assert.equal(await evaluate("location.hash"), "#contenido");
  assert(
    await evaluate(
      '[...document.querySelectorAll("input[type=search],select")].every(e=>parseFloat(getComputedStyle(e).fontSize)>=16)',
    ),
  );
  await command("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector("button[data-slot=button]")).transitionDuration',
    ),
    "0s",
  );
  audits.push(audit("mobile-library"));
  assert.equal(errors.length, 0, errors.join("; "));
  writeFileSync(
    ".cache/browser-mvp-report.json",
    JSON.stringify(
      {
        report,
        audits,
        layouts,
        runtimeErrors: errors,
        reducedMotion: "pass",
        keyboard: "pass",
        physicalDevice: false,
      },
      null,
      2,
    ),
  );
  console.log(
    "Browser: searches, filters, 47 card navigations, download, 7 desktop + 1 mobile axe audits, 18 responsive layouts, keyboard and reduced motion passed.",
  );
} finally {
  socket.close();
}
