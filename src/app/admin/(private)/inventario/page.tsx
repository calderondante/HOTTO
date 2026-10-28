import { constitutionalInventory as inventory } from "@/lib/library/constitutional-inventory";
export default function InventoryPage() {
  const verified = inventory.cases.filter((item) => item.verification);
  return <section>
    <p className="eyebrow">PREPARACIÓN BIBLIOGRÁFICA · CONSTITUCIONAL I Y II</p>
    <h1>Inventario para revisión</h1>
    <p>{inventory.cases.length} referencias únicas; {verified.length} con fuente judicial cotejada. Todos los registros de este inventario están pendientes de incorporación y revisión. Este listado no publica obras.</p>
    <p>Materias genéricas, sin comisiones ni docentes. Los materiales compartidos no acreditan un programa vigente; no se asignaron unidades oficiales.</p>
    <a className="text-link" href="/api/admin/constitutional-inventory" download>Descargar inventario JSON</a>
    <div className="case-results">{[...inventory.cases].sort((a, b) => Number(Boolean(b.verification)) - Number(Boolean(a.verification))).map((item) => <article className="case-result inventory-result" key={item.id}>
      <div><h2>{item.title ?? item.name_as_listed}</h2>
        <p>Constitucional {item.subject_codes.map((code) => code === "2304" ? "I" : "II").join(" y ")} · {item.topics.join(" · ") || "Tema por revisar"}</p>
        <p>{item.verification ? "Fuente cotejada · revisión editorial pendiente" : "Identificación / fuente pendiente"}</p>
        {item.date && <p>{item.date} · {item.docket}</p>}
        {item.official_url && <p><a href={item.official_url} target="_blank" rel="noopener noreferrer">Consultar fuente oficial</a></p>}
        {item.notes && <p>{item.notes}</p>}
        <details><summary>Procedencia bibliográfica</summary><ul>{item.reading_sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>{source.date ? ` · ${source.date}` : " · sin versión académica confirmada"}</li>)}</ul></details>
      </div>
    </article>)}</div>
  </section>;
}
