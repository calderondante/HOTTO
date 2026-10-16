import { notFound } from "next/navigation";
import { adminContext, adminOptions, adminWork } from "@/lib/admin/data";
import { WorkEditor } from "@/components/admin/work-editor";
import { uuidPattern } from "@/lib/admin/validation";
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await adminContext();
  if (ctx.status !== "ready") return null;
  const { id } = await params;
  if (!uuidPattern.test(id)) notFound();
  const data = await adminWork(id);
  if (!data) notFound();
  const options = await adminOptions("", {
    authorIds: data.authorIds,
    sourceIds: [data.work.source_id],
    licenseIds: [
      data.work.license_id,
      ...data.permissions.map((p) => p.license_id),
    ],
  });
  if (!options) notFound();
  return (
    <>
      <div className="admin-page-intro">
        <p className="eyebrow">FICHA DOCUMENTAL</p>
        <h1>{data.work.title}</h1>
        <p>
          Completá los datos y verificá los documentos antes de hacerlos
          públicos.
        </p>
      </div>
      <WorkEditor data={data} options={options} />
    </>
  );
}
