# Inventario constitucional genérico

Referencias documentadas a los materiales compartidos por HOTTO. No se obtuvo
un programa analítico completo: **0 programas confirmados**. Las notas de
lectura de Constitucional II son de 2020; la carpeta de Constitucional I no
consigna una versión de programa. No se atribuyen unidades oficiales,
comisiones, docentes ni bibliografía obligatoria vigente.

- 21 referencias en Constitucional I; 8 con sentencia oficial cotejada.
- 19 referencias en Constitucional II; 6 con sentencia oficial cotejada.
- 39 fallos únicos, con Hooft compartido; Giroldi deduplicado dentro de I.
- 13 sentencias únicas verificadas; 26 referencias aún por completar.
- **0 registros incorporados o publicados en Supabase en esta etapa**.
- Dos referencias de doctrina adicionales (Saba y Gargarella), sin archivos.

El JSON conserva nulos para datos desconocidos y URLs de procedencia por cada
referencia. Los identificadores internos SAIJ se transcriben tal como aparecen,
sin reconstruir expedientes romanos ausentes. Las descargas fueron adjuntos
puntuales del piloto para cotejo temporal; no se versionaron ni alojaron PDFs.

## Sentencias cotejadas

| Materia | Carátula | Fecha | Fuente oficial |
| --- | --- | --- | --- |
| I | Arriola, Sebastián y otros s/ causa n° 9080 | 2009-08-25 | [Documento](https://www.cij.gov.ar/archivo-cij/adj/pdfs/ADJ-0.331433001251232084.pdf) |
| I | Ekmekdjian, Miguel Angel c/ Sofovich, Gerardo y otros. s/ Recurso de hecho | 1992-07-07 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o92000322pdf&name=92000322.pdf) |
| I | Fibraca Constructora SCA c/ Comisión Técnica Mixta de Salto Grande. s/ Recurso de Hecho | 1993-07-07 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o93000274pdf&name=93000274.pdf) |
| I | Giroldi, Horacio David y otro s/ recurso de casación - causa n. 32/93. | 1995-04-07 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o95000086pdf&name=95000086.pdf) |
| I | Gustavo Mario BAZTERRICA s/ TENENCIA DE ESTUPEFACIENTES | 1986-08-29 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o86000507pdf&name=86000507.pdf) |
| I | Halabi, Ernesto c/ P.E.N. — ley 25.873 — dto. 1563/04 s/ amparo ley 16.986 | 2009-02-24 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o09000006pdf&name=09000006.pdf) |
| I/II | Hooft, Pedro Cornelio Federico c/ Provincia de Buenos Aires s/ acción declarativa de inconstitucionalidad | 2004-11-16 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o04000213pdf&name=04000213.pdf) |
| I | Sojo, Eduardo s/ recurso de habeas corpus | 1887-09-22 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o87001154pdf&name=87001154.pdf) |
| II | Albarracini Nieves, Jorge Washington s/ medidas precautorias | 2012-06-01 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o12000076pdf&name=12000076.pdf) |
| II | Sisnero, Mirtha Graciela y otros c/ Taldelva SRL y otros s/ amparo | 2014-05-20 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o14000071pdf&name=14000071.pdf) |
| II | Benítez, Aníbal Leonel s/ lesiones graves — causa n° 1524 | 2006-12-12 | [Documento](https://sjconsulta.csjn.gov.ar/sjconsulta/documentos/verDocumentoByIdLinksJSP.html?idDocumento=6126951) |
| II | Losicer, Jorge Alberto y otros c/ BCRA - Resol.169/05 (expte.105.666/86 SUM FIN 708) | 2012-06-26 | [Documento](https://www.saij.gob.ar/descarga-archivo?guid=rstuvwfa-llos-comp-uest-o12000097pdf&name=12000097.pdf) |
| II | Partido Nuevo Triunfo s/ reconocimiento — Distrito Capital Federal | 2009-03-17 | [Documento](https://www.cij.gov.ar/archivo-cij/adj/pdfs/ADJ-0.469791001237304946.pdf) |

## Incorporación pendiente

`pnpm inventory:prepare` valida y prepara 13 paquetes en
`.cache/constitutional-draft-import.json`. No escribe en Supabase. El inventario
completo está disponible en `/admin/inventario` con autorización real; el JSON
puede descargarse allí. No se expone como catálogo público alternativo.

Para incorporar, un editor debe resolver las materias existentes por código,
crear/vincular fuente y licencia sin asumir distribución, guardar cada obra,
ficha A y documento externo como borrador usando las APIs administrativas,
revisar los datos, confirmar el enlace y verificar permisos antes de publicar.
No usar una conexión privilegiada para sustituir la sesión del editor.

Antes de importar: comprobar duplicados por URL oficial, tribunal y expediente
y confirmar el cotejo de fuentes; los paquetes conservan permisos pendientes y
`official_link_checked: false` para exigir esa revisión. Las referencias a
programas no confirmados no deben convertirse en unidades o exigencias docentes.

La nota que llama «Duarte» a la publicación CIJ 36556 remite al caso P., S. M. y
otro que cita Duarte. No se importó con esa atribución. «ATE» y «Martín» siguen
sin identificación unívoca. Ríos y Llerena tienen ficha oficial comprobada,
pero el texto completo no se recuperó durante esta entrega; no se cuentan
entre las 13 sentencias verificadas. Marbury tiene un facsímil LOC localizado,
pero permanece pendiente de completar su metadata exacta y es derecho comparado.
