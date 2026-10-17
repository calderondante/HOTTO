import type { CaseQuery, CaseResult, CaseSearch } from "./jurisprudence";

// A read-only preview of the search UI. It never enters the public database or RPC.
export const marburyExample: CaseResult = {
  id: "marbury-preview",
  slug: "marbury-v-madison-preview",
  title: "Marbury v. Madison",
  court: "Corte Suprema de los Estados Unidos",
  chamber: "",
  docket: "",
  judicialId: "5 U.S. (1 Cranch) 137",
  date: "1803-02-24",
  topic: "Control judicial de constitucionalidad",
  jurisdiction: "Estados Unidos",
  officialUrl:
    "https://tile.loc.gov/storage-services/service/ll/usrep/usrep005/usrep005137/usrep005137.pdf",
  seoLevel: "A",
  subjectCodes: ["2304"],
};

const normalized = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function searchMarburyExample(query: CaseQuery): CaseSearch {
  const item = marburyExample;
  const haystack = normalized(
    [item.title, item.court, item.judicialId, item.topic, item.jurisdiction].join(" "),
  );
  const matches =
    (!query.q || haystack.includes(normalized(query.q))) &&
    (!query.subject || item.subjectCodes.includes(query.subject)) &&
    (!query.court || item.court === query.court) &&
    (!query.year || new Date(item.date).getUTCFullYear() === query.year) &&
    (!query.jurisdiction || item.jurisdiction === query.jurisdiction);
  return {
    items: matches ? [item] : [],
    total: matches ? 1 : 0,
    courts: [item.court],
    jurisdictions: [item.jurisdiction],
  };
}
