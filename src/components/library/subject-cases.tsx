import Link from "next/link";
import { searchCases } from "@/lib/library/jurisprudence";
export async function SubjectCases({ code }: { code: string }) {
  if (!["2304", "2314"].includes(code)) return null;
  let result;
  try { result = await searchCases({ q: "", subject: code, court: "", year: null, jurisdiction: "", page: 1 }); }
  catch { return <section><h2>Fallos por tema</h2><p>No pudimos consultar los fallos de esta materia. Reintentá más tarde.</p></section>; }
  const groups = Map.groupBy(result.items, (item) => item.topic || "Otros temas");
  return <section className="subject-case-topics">
    <h2>Fallos por tema</h2>
    <p>Elegí un tema y consultá la sentencia en su fuente oficial.</p>
    {!result.total && <p>Todavía no hay fallos publicados para esta materia.</p>}
    {[...groups].map(([topic, cases]) => <details key={topic}><summary>{topic} · {cases.length}</summary><ul>{cases.map((item) => <li key={item.id}><a href={item.officialUrl} target="_blank" rel="noopener noreferrer">{item.title} · sentencia oficial (otra pestaña)</a>{item.seoLevel !== "A" && <> · <Link href={`/biblioteca/jurisprudencia/${item.slug}`}>Análisis</Link></>}</li>)}</ul></details>)}
    {result.total > 30 && <Link href={`/biblioteca/jurisprudencia?materia=${code}`}>Ver todos los fallos de la materia</Link>}
  </section>;
}
