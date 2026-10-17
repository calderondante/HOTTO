import type { MetadataRoute } from "next";
import { publicClient } from "@/lib/supabase/server";
import { libraryMode } from "@/lib/supabase/config";
import { publicSiteOrigin } from "@/lib/library/jurisprudence-seo";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = publicSiteOrigin();
  if (!origin || libraryMode() !== "supabase") return [];
  const entries: MetadataRoute.Sitemap = [{ url: `${origin}/biblioteca/jurisprudencia`, changeFrequency: "weekly", priority: 0.7 }];
  const client = publicClient();
  for (let offset = 0; offset < 100000; offset += 500) {
    const { data: cases, error } = await client.from("jurisprudence")
      .select("work_id,approved_at")
      .eq("seo_level", "C").eq("analysis_state", "approved")
      .not("approved_at", "is", null).order("work_id").range(offset, offset + 499);
    if (error) throw Error("No se pudo generar el sitemap judicial.");
    if (!cases.length) break;
    const { data: works, error: workError } = await client.from("works")
      .select("id,slug,updated_at")
      .in("id", cases.map((item) => item.work_id));
    if (workError) throw Error("No se pudo verificar la visibilidad del sitemap.");
    const byId = new Map(works.map((work) => [work.id, work]));
    for (const item of cases) {
      const work = byId.get(item.work_id);
      if (work) entries.push({ url: `${origin}/biblioteca/jurisprudencia/${work.slug}`, lastModified: work.updated_at, changeFrequency: "monthly", priority: 0.8 });
    }
    if (cases.length < 500) break;
  }
  return entries;
}
