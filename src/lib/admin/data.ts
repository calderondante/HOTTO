import "server-only";
import { cache } from "react";
import { requireAdmin, AdminError } from "./auth";
export const adminContext = cache(async () => {
  try {
    return { status: "ready" as const, ...(await requireAdmin()) };
  } catch (e) {
    return {
      status: "blocked" as const,
      code: e instanceof AdminError ? e.status : 503,
      message:
        e instanceof AdminError
          ? e.message
          : "No pudimos verificar el acceso. Reintentá cuando Supabase esté disponible.",
    };
  }
});
export async function adminOptions(
  q = "",
  selected: {
    authorIds?: string[];
    sourceIds?: string[];
    licenseIds?: string[];
  } = {},
) {
  const ctx = await adminContext();
  if (ctx.status !== "ready") return null;
  const needle = `%${q.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
  const results = await Promise.all([
    ctx.client.from("subjects").select("*").order("code"),
    ctx.client
      .from("authors")
      .select("*")
      .ilike("name", needle)
      .order("name")
      .limit(50),
    ctx.client
      .from("sources")
      .select("*")
      .ilike("label", needle)
      .order("label")
      .limit(50),
    ctx.client
      .from("licenses")
      .select("*")
      .ilike("name", needle)
      .order("name")
      .limit(50),
  ]);
  for (const r of results)
    if (r.error)
      throw new Error("No pudimos cargar las opciones del catálogo.");
  const authors = results[1].data!,
    sources = results[2].data!,
    licenses = results[3].data!;
  if (selected.authorIds?.length) {
    const r = await ctx.client
      .from("authors")
      .select("*")
      .in("id", selected.authorIds);
    if (r.error) throw r.error;
    authors.push(...r.data.filter((a) => !authors.some((o) => o.id === a.id)));
  }
  if (selected.sourceIds?.length) {
    const r = await ctx.client
      .from("sources")
      .select("*")
      .in("id", selected.sourceIds);
    if (r.error) throw r.error;
    sources.push(...r.data.filter((a) => !sources.some((o) => o.id === a.id)));
  }
  if (selected.licenseIds?.length) {
    const r = await ctx.client
      .from("licenses")
      .select("*")
      .in("id", selected.licenseIds);
    if (r.error) throw r.error;
    licenses.push(
      ...r.data.filter((a) => !licenses.some((o) => o.id === a.id)),
    );
  }
  return { subjects: results[0].data!, authors, sources, licenses };
}
export type AdminOptions = NonNullable<
  Awaited<ReturnType<typeof adminOptions>>
>;
export async function adminWork(id: string) {
  const ctx = await adminContext();
  if (ctx.status !== "ready") return null;
  const c = ctx.client;
  const work = await c.from("works").select("*").eq("id", id).maybeSingle();
  if (work.error) throw new Error("No pudimos cargar la obra.");
  if (!work.data) return null;
  const result = await Promise.all([
    c.from("editions").select("*").eq("work_id", id),
    c.from("documents").select("*").eq("work_id", id).order("created_at"),
    c.from("work_authors").select("*").eq("work_id", id),
    c.from("work_subjects").select("*").eq("work_id", id),
    c.from("jurisprudence").select("*").eq("work_id", id),
    c.from("legislation").select("*").eq("work_id", id),
  ]);
  for (const r of result)
    if (r.error)
      throw new Error("No pudimos cargar las relaciones de la obra.");
  const documentIds = result[1].data!.map((d) => d.id);
  const related = documentIds.length
    ? await Promise.all([
        c.from("files").select("*").in("document_id", documentIds),
        c
          .from("document_permissions")
          .select("*")
          .in("document_id", documentIds),
      ])
    : null;
  if (related?.some((r) => r.error))
    throw new Error("No pudimos cargar archivos y permisos.");
  return {
    work: work.data,
    editions: result[0].data!,
    documents: result[1].data!,
    authorIds: result[2].data!.map((r) => r.author_id),
    subjectIds: result[3].data!.map((r) => r.subject_id),
    jurisprudence: result[4].data![0] ?? null,
    legislation: result[5].data![0] ?? null,
    files: related?.[0].data ?? [],
    permissions: related?.[1].data ?? [],
  };
}
export type AdminWork = NonNullable<Awaited<ReturnType<typeof adminWork>>>;
