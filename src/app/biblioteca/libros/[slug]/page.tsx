import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resources } from "@/lib/library/data";
import { getResource } from "@/lib/library/repository";
import { ResourceDetail } from "@/components/library/resource-detail";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return resources
    .filter((r) => r.kind === "book")
    .map((r) => ({ slug: r.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getResource((await params).slug);
  return {
    title: r?.title ?? "Recurso no encontrado",
    description: r?.description,
  };
}
export default async function Page({ params }: Props) {
  const r = getResource((await params).slug);
  if (!r || !(r.kind === "book")) notFound();
  return <ResourceDetail resource={r} />;
}
