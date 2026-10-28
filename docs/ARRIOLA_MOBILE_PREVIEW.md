# Arriola: ficha y recorrido móvil

La ruta `/biblioteca/jurisprudencia/ejemplo-arriola` presenta una ficha de
ejemplo de **«Arriola, Sebastián y otros s/ causa n.º 9080»**, CSJN,
25/08/2009, Fallos 332:1963. Desde la pantalla de jurisprudencia se accede
directamente a la ficha, sin repetir una búsqueda. La ficha resume la cuestión,
la decisión y su alcance y enlaza al [PDF original alojado por el Centro de
Información Judicial de la Corte Suprema](https://www.cij.gov.ar/archivo-cij/adj/pdfs/ADJ-0.331433001251232084.pdf).
La [reseña de la Corte](https://www.cij.gov.ar/nota-2156-La-Corte-Suprema-declar--inconstitucional-la-penalizaci-n-del-consumo-personal-de-marihuana.html)
apunta al mismo archivo en su visor. El PDF respondió como `application/pdf`,
tiene 91 páginas y el texto de la sentencia «Arriola» comienza en la página 5.
Las cuatro primeras páginas contienen un dictamen de la Procuración en otro
expediente citado en el archivo. HOTTO no copia ni redistribuye ese PDF.

La vista está marcada como **ejemplo fuera del catálogo administrado** y tiene
`noindex`. No crea un registro en Supabase ni reemplaza el flujo de revisión y
publicación del panel. El enlace abre el documento de la Corte en el navegador;
la navegación posterior dentro del PDF pertenece al visor del dispositivo.

La [grabación móvil de 18 segundos](../design/previews/jurisprudencia-arriola-ficha-pdf-movil.mp4)
muestra la entrada a la ficha, sus datos, la pulsación del botón oficial y el
desplazamiento del PDF hasta la página 5. Se capturó a 390 × 844 px desde la
versión de producción local; el archivo es H.264 MP4. También se guardaron
[una captura de la ficha](../design/previews/jurisprudencia-arriola-ficha-movil.png)
y [una de la página del fallo en el visor](../design/previews/jurisprudencia-arriola-pdf-oficial-movil.png).
La emulación de navegador permite revisar el flujo, pero no sustituye una prueba
en un teléfono físico.

Verificación local: `pnpm test` (19 pruebas), TypeScript, ESLint y build
aprobaron. La regresión de navegador del MVP pasó en modo demostración,
incluida la navegación desde Jurisprudencia hasta esta ficha, su enlace al
dominio judicial y `noindex`. En la versión conectada a Supabase se abrió el
PDF externo desde la ficha. Una auditoría axe a 390 × 844 px de esta ruta
registró 0 violaciones y 0 comprobaciones incompletas. `ffmpeg` decodificó
todos los cuadros del MP4 sin errores.
