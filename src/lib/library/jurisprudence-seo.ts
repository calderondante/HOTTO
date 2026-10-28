export function publicSiteOrigin(value = process.env.HOTTO_SITE_ORIGIN): string | null {
  try {
    const u = new URL(value ?? "");
    return u.protocol === "https:" && !u.username && !u.password && u.pathname === "/" && !u.search && !u.hash &&
      !u.hostname.endsWith(".supabase.co") && u.hostname !== "localhost"
      ? u.origin : null;
  } catch { return null; }
}
export function caseSeoPolicy(
  slug: string,
  caseData: { demo: boolean; level?: string; state?: string; approvedAt?: string | null },
  origin = publicSiteOrigin(),
) {
  const index = !caseData.demo && caseData.level === "C" && caseData.state === "approved" &&
    Boolean(caseData.approvedAt) && Boolean(origin);
  return { index, canonical: index ? `${origin}/biblioteca/jurisprudencia/${slug}` : null };
}
