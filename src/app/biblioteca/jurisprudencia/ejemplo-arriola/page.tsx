import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs, SubjectLink } from "@/components/library/presentation";

const officialPdf = "https://www.cij.gov.ar/archivo-cij/adj/pdfs/ADJ-0.331433001251232084.pdf";
const officialArticle = "https://www.cij.gov.ar/nota-2156-La-Corte-Suprema-declar--inconstitucional-la-penalizaci-n-del-consumo-personal-de-marihuana.html";

export const metadata: Metadata = {
  title: "Arriola · Ficha de ejemplo",
  description: "Ficha de ejemplo del fallo Arriola, con acceso al PDF oficial de la Corte Suprema de Justicia de la Nación.",
  robots: { index: false, follow: false },
};

export default function ArriolaExample() {
  return <main id="contenido" className="case-detail-page">
    <div className="shell">
      <Breadcrumbs items={[{ href: "/biblioteca", label: "Biblioteca" }, { href: "/biblioteca/jurisprudencia", label: "Jurisprudencia" }, { label: "Arriola" }]} />
      <div className="case-detail-header">
        <p className="eyebrow">CORTE SUPREMA DE JUSTICIA DE LA NACIÓN · ARGENTINA</p>
        <h1>Arriola, Sebastián y otros s/ causa n.º 9080</h1>
        <p>Tenencia de estupefacientes para consumo personal y principio de reserva.</p>
        <p className="case-preliminary">Vista de ejemplo · fallo real, aún no publicado en el catálogo administrado de HOTTO.</p>
        <a className="case-official-link" href={officialPdf}>Abrir PDF oficial de la Corte <ArrowUpRight size={18} aria-hidden="true" /></a>
        <p className="case-pdf-hint">Sentencia completa alojada por el Centro de Información Judicial de la Corte Suprema · 91 páginas. El fallo comienza en la página 5 del archivo.</p>
      </div>
      <div className="case-detail-body">
        <aside className="case-facts" aria-label="Datos del fallo">
          <dl>
            <div><dt>Tribunal</dt><dd>Corte Suprema de Justicia de la Nación</dd></div>
            <div><dt>Jurisdicción</dt><dd>Argentina · federal</dd></div>
            <div><dt>Expediente</dt><dd>A. 891. XLIV · causa n.º 9080</dd></div>
            <div><dt>Cita</dt><dd>Fallos 332:1963</dd></div>
            <div><dt>Fecha</dt><dd>25 de agosto de 2009</dd></div>
            <div><dt>Fuente</dt><dd>Centro de Información Judicial (CSJN)</dd></div>
          </dl>
          <div className="subject-tags"><SubjectLink id="2304" /></div>
        </aside>
        <article className="case-analysis">
          <section><h2>Pregunta jurídica</h2><p>¿Puede castigarse penalmente la tenencia de estupefacientes para consumo personal cuando la conducta privada de una persona adulta no afecta a terceros?</p></section>
          <section><h2>Decisión</h2><p>La Corte declaró inconstitucional la aplicación del artículo 14, segundo párrafo, de la ley 23.737 a los hechos del caso, por afectar el ámbito de privacidad protegido por el artículo 19 de la Constitución Nacional.</p></section>
          <section><h2>Alcance</h2><p>La decisión se refiere a conductas privadas sin peligro o daño concreto para terceros. No estableció una despenalización general ni amparó el tráfico de estupefacientes.</p></section>
          <p className="case-source-note">Resumen de orientación para esta vista de ejemplo. Para estudiar o citar la decisión, consultá el PDF de la Corte y verificá el texto íntegro.</p>
          <a className="text-link" href={officialArticle}>Leer la reseña oficial del Centro de Información Judicial <ArrowUpRight size={14} aria-hidden="true" /></a>
          <p><Link className="text-link" href="/biblioteca/jurisprudencia">Volver a jurisprudencia</Link></p>
        </article>
      </div>
    </div>
  </main>;
}
