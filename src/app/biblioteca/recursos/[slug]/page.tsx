import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resources } from "@/lib/library/data";
import { loadDetail } from "@/lib/library/backend";
import { ResourceDetail } from "@/components/library/resource-detail";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = true;
export function generateStaticParams() {
  return resources
    .filter((r) => r.kind !== "book" && r.kind !== "jurisprudence")
    .map((r) => ({ slug: r.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = (await loadDetail((await params).slug))?.resource;
  return {
    title: r?.title ?? "Recurso no encontrado",
    description: r?.description,
  };
}
export default async function Page({ params }: Props) {
  const r = (await loadDetail((await params).slug))?.resource;
  if (!r || !(r.kind !== "book" && r.kind !== "jurisprudence")) notFound();
  const detail = await loadDetail((await params).slug);
  return <ResourceDetail resource={r} related={detail?.related} />;
}
