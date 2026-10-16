import Link from "next/link";
import { notFound } from "next/navigation";
import { publicClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { uuidPattern } from "@/lib/admin/validation";
import { Breadcrumbs } from "@/components/library/presentation";
export default async function Reader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!uuidPattern.test(id) || !supabaseConfig()) notFound();
  const result = await publicClient()
    .from("files")
    .select("id,pages")
    .eq("id", id)
    .maybeSingle();
  if (result.error) throw Error("No pudimos verificar los permisos del PDF.");
  if (!result.data) notFound();
  return (
    <main id="contenido" className="shell page-content">
      <Breadcrumbs
        items={[
          { href: "/biblioteca", label: "Biblioteca" },
          { label: "Lector PDF" },
        ]}
      />
      <h1>Lectura del documento</h1>
      <p>
        El acceso se comprueba antes de cada solicitud.{" "}
        {result.data.pages && `${result.data.pages} páginas.`}
      </p>
      <div className="button-row">
        <Link
          className="text-link"
          href={`/api/library/files/${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir en otra pestaña
        </Link>
        <Link
          className="text-link"
          href={`/api/library/files/${id}?descargar=1`}
        >
          Descargar PDF
        </Link>
      </div>
      <iframe
        className="pdf-reader"
        title="Lector del documento jurídico PDF"
        src={`/api/library/files/${id}`}
      />
      <p>Si tu navegador no muestra el lector, usá “Abrir en otra pestaña”.</p>
    </main>
  );
}
