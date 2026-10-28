# Vista móvil de jurisprudencia: Marbury v. Madison

La ruta `/biblioteca/jurisprudencia?ejemplo=marbury&q=Marbury` muestra un único
resultado histórico para probar la búsqueda móvil cuando la base todavía no
tiene fallos publicados. Se identifica como **vista de ejemplo**, queda fuera
del RPC, del catálogo administrado y del índice de buscadores. El formulario
mantiene el modo de ejemplo al buscar o filtrar; el enlace «Volver a la búsqueda
real» lo abandona. Esta ruta histórica sigue disponible por URL directa. La
entrada visible desde jurisprudencia ahora lleva a la
[ficha argentina de Arriola](ARRIOLA_MOBILE_PREVIEW.md). El ejemplo no crea
registros en Supabase.

La referencia es *Marbury v. Madison*, 5 U.S. (1 Cranch) 137 (1803), Corte
Suprema de los Estados Unidos. La tarjeta enlaza al
[facsímil de U.S. Reports alojado por la Biblioteca del Congreso](https://tile.loc.gov/storage-services/service/ll/usrep/usrep005/usrep005137/usrep005137.pdf).
Se comprobó la respuesta PDF y la presencia del caso en el documento. El PDF
no se copió al repositorio ni a Storage.

La [grabación móvil](../design/previews/jurisprudencia-marbury-movil.mp4) muestra
la pantalla real a 390 × 844 px con tres gestos táctiles de desplazamiento,
sin pulsar controles. Dura 10,7 segundos; el archivo es H.264 MP4 de 780 ×
1688 px. La [imagen de vista previa](../design/previews/jurisprudencia-marbury-movil.png)
muestra el resultado. Se probaron búsqueda y filtros del ejemplo, TypeScript,
ESLint, build, carga de la ruta de producción, `noindex`, reproducción íntegra
del video y accesibilidad automática móvil sin violaciones.

La [segunda grabación con pulsaciones](../design/previews/jurisprudencia-marbury-movil-con-toques.mp4)
reproduce el flujo desde la biblioteca: abrir el menú móvil, entrar en
Jurisprudencia, elegir el ejemplo histórico, escribir «Marbury» y pulsar
«Buscar». Combina toques reales emulados y desplazamientos táctiles en el
navegador, con un indicador visual discreto para cada toque. Dura 18 segundos
y conserva la vista final del resultado; se comprobó su decodificación íntegra.
