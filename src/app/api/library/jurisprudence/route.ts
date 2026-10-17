import { parseCaseQuery, searchCases } from "@/lib/library/jurisprudence";
export async function GET(request: Request) {
  try {
    const result = await searchCases(parseCaseQuery(Object.fromEntries(new URL(request.url).searchParams)));
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "No pudimos consultar la jurisprudencia." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
