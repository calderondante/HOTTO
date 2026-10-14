import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  subjects,
  resources,
  authors,
  sources,
  licenses,
  editions,
  files,
} from "../src/lib/library/data.ts";
import {
  parseLibraryQuery,
  filterCatalog,
  normalizeSearch,
  parseSubjectQuery,
} from "../src/lib/library/query.ts";
import {
  getCatalog,
  relatedResources,
  fileFor,
  resourceHref,
} from "../src/lib/library/repository.ts";
const all = getCatalog();
const empty = {
  q: "",
  subject: "",
  kind: "all" as const,
  availableOnly: false,
};

test("parámetros académicos inválidos vuelven a valores seguros", () => {
  assert.equal(parseLibraryQuery({ materia: "no-existe" }).subject, "");
  assert.deepEqual(parseSubjectQuery({ q: ["a", "b"], anio: "99" }), {
    q: "",
    year: "",
  });
  assert.deepEqual(parseSubjectQuery({ q: "2340", anio: "1" }), {
    q: "2340",
    year: "1",
  });
});

test("un archivo no se habilita para otra obra, edición o licencia", () => {
  const book = resources.find((r) => r.id === "book-intro");
  assert(book);
  assert.equal(fileFor({ ...book, id: "another-work" }), undefined);
  assert.equal(
    fileFor({ ...book, editionId: "edition-constitution" }),
    undefined,
  );
  assert.equal(fileFor({ ...book, licenseId: "reference-only" }), undefined);
});

test("34 materias únicas; idiomas y computación excluidos; pilotos canónicos", () => {
  assert.equal(subjects.length, 34);
  assert.equal(new Set(subjects.map((s) => s.code)).size, 34);
  assert.equal(new Set(subjects.map((s) => s.slug)).size, 34);
  assert(subjects.every((s) => !/^Inglés|^Computación/.test(s.name)));
  assert(subjects.every((s) => s.verification === "secondary-crosschecked"));
  assert.deepEqual(
    subjects
      .filter((s) => s.pilot)
      .map((s) => s.code)
      .sort(),
    ["2304", "2340"],
  );
  assert.equal(
    subjects.find((s) => s.code === "2340")?.name,
    "Introducción al Estudio del Derecho",
  );
  assert.equal(
    subjects.find((s) => s.code === "2340")?.slug,
    "introduccion-al-derecho",
  );
});
test("búsqueda ignora acentos y mayúsculas, encuentra título, autor y palabras clave", () => {
  assert.equal(normalizeSearch("  CONSTITUCIÓN  "), "constitucion");
  assert(
    filterCatalog(all, { ...empty, q: "constitucion ciudadania" }).some(
      (r) => r.id === "book-constitution",
    ),
  );
  assert(
    filterCatalog(all, { ...empty, q: "TALLER" }).some(
      (r) => r.id === "book-constitution",
    ),
  );
  assert(
    filterCatalog(all, { ...empty, q: "garantias" }).some(
      (r) => r.id === "case-equality",
    ),
  );
  assert.equal(
    filterCatalog(all, { ...empty, q: "esta palabra no existe" }).length,
    0,
  );
});
test("filtros combinados restringen materia, tipo y disponibilidad", () => {
  const filtered = filterCatalog(all, {
    ...empty,
    subject: "2304",
    kind: "book",
    availableOnly: true,
  });
  assert.deepEqual(
    filtered.map((r) => r.id),
    ["book-constitution"],
  );
  assert.equal(
    filterCatalog(all, { ...empty, subject: "2340", kind: "jurisprudence" })
      .length,
    1,
  );
  assert.equal(filterCatalog(all, { ...empty, subject: "2341" }).length, 0);
  assert.equal(filterCatalog(all, empty).length, 13);
});
test("consulta URL rechaza tipos no válidos, limita texto y no interpreta duplicados", () => {
  assert.deepEqual(
    parseLibraryQuery({ q: ["a", "b"], tipo: "fake", disponibles: "true" }),
    empty,
  );
  assert.equal(
    parseLibraryQuery({ q: "a".repeat(200), disponibles: "1" }).q.length,
    160,
  );
  assert.equal(parseLibraryQuery({ disponibles: "1" }).availableOnly, true);
});
test("relaciones válidas, obras compartidas y fichas de cada tipo", () => {
  assert.equal(new Set(resources.map((r) => r.slug)).size, resources.length);
  for (const r of resources) {
    assert(sources.some((s) => s.id === r.sourceId));
    assert(licenses.some((l) => l.id === r.licenseId));
    assert(r.authorIds.every((id) => authors.some((a) => a.id === id)));
    assert(r.subjectIds.every((id) => subjects.some((s) => s.id === id)));
    assert(r.demo);
    assert.equal(r.editorialStatus, "published");
    assert(
      resourceHref(r).startsWith(
        `/biblioteca/${r.kind === "book" ? "libros" : r.kind === "jurisprudence" ? "jurisprudencia" : "recursos"}/`,
      ),
    );
    assert(
      relatedResources(r).every(
        (other) =>
          other.id !== r.id &&
          other.subjectIds.some((id) => r.subjectIds.includes(id)),
      ),
    );
  }
  assert(resources.some((r) => r.kind === "book" && r.subjectIds.length > 1));
});
test("solo dos archivos reales originales; referencias sin descarga; PDF deterministas válidos", () => {
  assert.equal(all.filter((r) => r.available).length, 2);
  for (const file of files) {
    const bytes = readFileSync(`public${file.path}`);
    assert.equal(bytes.subarray(0, 8).toString(), "%PDF-1.4");
    assert(bytes.toString("latin1").includes("DEMOSTRACION"));
    assert(bytes.toString("latin1").includes("%%EOF"));
    assert(editions.some((e) => e.id === file.editionId));
    assert(
      licenses.some(
        (l) => l.id === file.licenseId && l.distribution === "original-demo",
      ),
    );
  }
  for (const r of resources.filter((r) => r.licenseId === "reference-only"))
    assert.equal(fileFor(r), undefined);
});
