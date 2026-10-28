import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const inventory = JSON.parse(readFileSync(new URL("../data/research/constitutional-cases.json", import.meta.url), "utf8"));
const seen = new Set();
const drafts = [];
for (const item of inventory.cases) {
  if (!item.verification || !item.title || !item.court || !item.date || !item.docket || !item.official_url) continue;
  const normalized = new URL(item.official_url).href;
  assert(!seen.has(normalized), `Documento duplicado: ${item.id}`); seen.add(normalized);
  assert(item.subject_codes.every((code) => ["2304", "2314"].includes(code)));
  drafts.push({ reference_key: item.id, subject_codes: item.subject_codes, editorial_status: "draft", work: { slug: item.id.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, ""), kind: "jurisprudence", title: item.title, description: `Referencia bibliográfica de la sentencia ${item.title}. Consulta del texto en su fuente oficial. Sin análisis editorial propio.${item.notes ? ` ${item.notes}` : ""}` }, source: { label: "Sentencia judicial oficial", urls: item.official_url, editorial_status: "draft", verification: "official", note: JSON.stringify({ verification: item.verification, reading_sources: item.reading_sources }) }, jurisprudence: { court: item.court, docket: item.docket, decision_date: item.date, jurisdiction: "Argentina", topic: item.topics.join(" · "), official_url: item.official_url, official_link_checked: false, seo_level: "A", analysis_state: "none" }, document: { label: "Sentencia oficial externa", access_mode: "external", external_url: item.official_url }, permission: { state: "pending", allow_public: false }, license: { name: "Referencia externa — revisión pendiente", distribution_allowed: false, evidence: "Solo referencia y enlace externo. No se afirma autorización de redistribución de archivos; pendiente revisión administrativa." } });
}
mkdirSync(".cache", { recursive: true });
writeFileSync(".cache/constitutional-draft-import.json", JSON.stringify({ version: 1, mode: "draft-only", requires_admin_session: true, drafts }, null, 2));
console.log(`${drafts.length} paquetes bibliográficos preparados en .cache/constitutional-draft-import.json. Ninguna escritura remota. Resolver UUID de materias por código, revisar fuentes/licencia y usar las APIs administrativas con sesión legítima; no ejecutar como SQL privilegiado.`);
