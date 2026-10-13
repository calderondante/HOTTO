# Datos y fuentes

## Materias

Objetivo: Abogacía UNLaM plan 2018, 40 asignaturas menos Inglés I–IV (901–904)
y Computación I–II (911–912), total 34 jurídicas. Fuente primaria aportada:
https://drive.google.com/drive/folders/1UK-M7GRvDg93cFms75HmMINAuY3HPOZb

Drive y los sitios derecho.unlam.edu.ar / www.unlam.edu.ar devolvieron CONNECT
403 en esta sesión. No se accedió al contenido ni se descargaron documentos.
El listado se cotejó con dos transcripciones públicas fijadas por commit:

- [UNLaM-Organizer, abogacia.ts](https://github.com/MatiBarcia/UNLaM-Organizer/blob/b1fc5cbc5a53919392ac6ebdeb25168135ec7b9f/src/data/abogacia.ts).
- [MALLADERECHOUNLAM, index.html](https://github.com/Florrvega/MALLADERECHOUNLAM/blob/105e39d4bbcc72471cb35cbb0931bd43ac34e464/index.html).

Ambas contienen 40 asignaturas; coinciden los 34 nombres/códigos y el año al
normalizar acentos, mayúsculas y cero inicial de códigos (02340 → 2340).
Solo se transcriben esos hechos académicos. No se ejecutó código de los repositorios.
No se importaron lógica, correlativas, cargas horarias ni cuatrimestres: la primera
fuente declara que sus semestres son inferidos. El cotejo con fuente primaria
continúa pendiente y el nivel de verificación está registrado como
secondary-crosschecked en el dataset y visible en la pantalla de materias.

No se consideran estas transcripciones una publicación oficial de UNLaM. Los
nombres se conservan; 2340 tiene el nombre Introducción al Estudio del Derecho,
alias Introducción al Derecho y slug permanente introduccion-al-derecho. Los
códigos se guardan como texto. Las áreas son agrupaciones editoriales HOTTO,
no departamentos oficiales. No se atribuyen programas curriculares.

| Código | Materia | Año según transcripciones |
| --- | --- | --- |
| 2302 | Derecho Político | 1 |
| 2340 | Introducción al Estudio del Derecho | 1 |
| 2341 | Historia y Evolución de las Instituciones del Derecho | 1 |
| 2306 | Filosofía del Derecho | 1 |
| 2304 | Derecho Constitucional I | 1 |
| 2309 | Economía Política | 1 |
| 2342 | Derecho Civil y Comercial I (Parte General) | 1 |
| 2314 | Derecho Constitucional II | 2 |
| 2343 | Derecho Civil y Comercial II (Obligaciones Civiles y Comerciales) | 2 |
| 2318 | Derecho Administrativo I | 2 |
| 2305 | Sociología | 2 |
| 2333 | Derecho Público: Provincial y Municipal | 2 |
| 2307 | Derecho Penal I | 2 |
| 2344 | Derecho Civil y Comercial III (Contratos Civiles y Comerciales) | 2 |
| 2311 | Derecho Penal II | 3 |
| 2345 | Derecho Civil y Comercial IV (Derechos Reales y Garantías) | 3 |
| 2327 | Derecho Administrativo II | 3 |
| 2346 | Derecho Empresario I (Sociedades Comerciales y Seguros) | 3 |
| 2316 | Derecho Procesal I | 3 |
| 2347 | Derecho Civil y Comercial V (Derecho de Familia y Sucesiones) | 3 |
| 2323 | Derecho Procesal II | 4 |
| 2324 | Derecho Internacional Público | 4 |
| 2348 | Derecho del Trabajo y la Seguridad Social | 4 |
| 2338 | Taller de Retórica y Oratoria Forense | 4 |
| 2312 | Finanzas y Derecho Tributario | 4 |
| 2319 | Política Económica | 4 |
| 2349 | Derecho Empresario II (Títulos Valores y Concursos y Quiebras) | 4 |
| 2325 | Metodología de la Investigación Jurídica | 5 |
| 2334 | Seminario de Resolución Adecuada de Controversias | 5 |
| 2335 | Práctica Profesional I | 5 |
| 2337 | Seminario de Derecho de los Consumidores | 5 |
| 2328 | Derecho Ambiental y de los Recursos Naturales | 5 |
| 2329 | Derecho Internacional Privado | 5 |
| 2336 | Práctica Profesional II | 5 |

## Recursos y derechos

Los 13 registros y los dos nombres colectivos de autor son ficticios, creados
para esta entrega. Los tres tribunales/expedientes/fechas de casos son ejemplos,
no sentencias reales. Los recorridos de lectura no son programas de UNLaM.
Se identifica demo en tarjetas, fichas, textos y modelos; no hay ISBN ni enlaces
a publicaciones reales inventadas. Las seis fichas de libros prueban dos estados:
dos con PDF original y cuatro referencias ficticias sin archivo.

Los dos PDF de public/documentos se generan determinísticamente con
scripts/generate-demo-pdfs.mjs. Son una página de texto original para evaluar la
apertura/descarga; no reproducen manuales de terceros. El archivo expresa su
carácter de demostración y autoriza la distribución de esa muestra para evaluar
HOTTO. Esa evidencia es específica de estas muestras; no cubre bibliografía
real futura. La etiqueta reference-only no afirma permiso de distribución.

Los demás tipos tienen ficha de lectura, sin botón de descarga inexistente.
No hay archivos universitarios, fallos reales ni libros escaneados publicados.
Los recursos relacionados comparten al menos una materia; una obra puede tener
varias materias. El frontend no consulta servicios de datos externos.

Antes de incorporar recursos reales: cotejar título/autor/edición, URL primaria,
licencia y evidencia, editor responsable y estado editorial. Documentos con
derechos desconocidos pueden tener una ficha de referencia comprobada, sin
archivo público ni descarga. Mantener las URLs existentes o agregar redirecciones
cuando se verifique un cambio académico.
