import { mkdirSync, writeFileSync } from "node:fs";

// Original one-page fixtures, not scans or reproductions of third-party works.
const documents = [
  [
    "primeras-preguntas-demo.pdf",
    "Primeras preguntas del Derecho",
    [
      "HOTTO - Equipo de lectura (autor ficticio)",
      "DEMOSTRACION: material original creado para probar la biblioteca.",
      "No integra la bibliografia oficial de UNLaM. No es asesoramiento juridico.",
      "",
      "Un punto de partida",
      "Estudiar Derecho comienza con preguntas: que regula una norma,",
      "a quienes se dirige y como se relaciona con otras normas.",
      "La lectura atenta distingue el texto, su contexto y la interpretacion.",
      "",
      "Preguntas de lectura",
      "1. Como diferenciarias una norma juridica de una regla social?",
      "2. Que fuentes consultarias para comprobar una afirmacion juridica?",
      "3. Que argumentos sostienen una interpretacion y cuales la cuestionan?",
      "",
      "Esta pagina es una muestra tecnica, no un manual academico completo.",
      "Distribucion autorizada de esta muestra original para evaluar HOTTO.",
    ],
  ],
  [
    "constitucion-ciudadania-demo.pdf",
    "Constitucion y ciudadania",
    [
      "HOTTO - Taller de Derecho (autor ficticio)",
      "DEMOSTRACION: material original creado para probar la biblioteca.",
      "No integra la bibliografia oficial de UNLaM. No es asesoramiento juridico.",
      "",
      "Derechos e instituciones",
      "Una lectura introductoria de la Constitucion puede organizarse en torno",
      "a derechos, instituciones y mecanismos de control. El analisis requiere",
      "consultar el texto vigente y distinguirlo de las opiniones sobre el.",
      "",
      "Preguntas de lectura",
      "1. Que funcion cumple una constitucion en la organizacion del Estado?",
      "2. Como explicarias la relacion entre derechos y garantias?",
      "3. Que fuentes primarias utilizarias para analizar un caso concreto?",
      "",
      "Esta pagina es una muestra tecnica, no un manual academico completo.",
      "Distribucion autorizada de esta muestra original para evaluar HOTTO.",
    ],
  ],
];
const escape = (s) =>
  s.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
mkdirSync("public/documentos", { recursive: true });
for (const [name, title, lines] of documents) {
  const stream = `BT /F1 21 Tf 50 780 Td (${escape(title)}) Tj /F1 11 Tf 0 -40 Td 20 TL\n${lines.map((line, i) => `${i ? "T* " : ""}(${escape(line)}) Tj`).join("\n")}\nET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    `<< /Title (${escape(title)}) /Author (HOTTO - autores ficticios) /Subject (Demostracion original) >>`,
  ];
  let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(output, "latin1"));
    output += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(output, "latin1");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((n) => `${String(n).padStart(10, "0")} 00000 n \n`)
    .join(
      "",
    )}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  writeFileSync(`public/documentos/${name}`, Buffer.from(output, "latin1"));
}
console.log(
  "2 PDF originales de demostración generados de forma determinista.",
);
