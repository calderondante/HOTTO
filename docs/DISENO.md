# Diseño del MVP

Referencia principal: [referencia-hotto.png](../design/referencia-hotto.png), aportada
por el usuario, convertida de JPEG a PNG sin alterar los píxeles. Es una lámina
con vistas de escritorio y móvil: cabecera institucional, hero oscuro, serif de
alto contraste, dorado, violeta, tarjetas marfil y navegación clara por secciones.
No se afirma haber identificado la familia tipográfica exacta ni replicado cada
pantalla del collage. Se adapta su lenguaje a la biblioteca funcional.

| Decisión | Implementación | Motivo |
| --- | --- | --- |
| Negro cálido | `#17141c` | Hero y pie institucional |
| Violeta | `#442259` | Acciones principales, foco y acentos |
| Dorado | `#d4b77d` | Identidad y titulares sobre fondo oscuro |
| Marfil / blanco | `#f7f6f2` / `#fff` | Lectura y separación de tarjetas |
| Texto secundario | `#655f6a` | Contraste legible sobre superficies claras |
| Tipografía | Georgia/Times para títulos; Arial/Helvetica para cuerpo | Jerarquía editorial sin descargas de fuentes |
| Espaciado | Contenedor 1160 px, espacios de 8–32 px | Lectura y ritmo constante |
| Cubiertas | Composiciones tipográficas CSS originales | Evitar atribuir portadas de publicaciones inexistentes |

Inicio preliminar y biblioteca comparten marca, navegación y pie. No se muestran
secciones institucionales vacías como si funcionaran. El acceso a recursos no
requiere una cuenta. Las tarjetas son enlaces reales y la ficha explica si hay
archivo o solo referencia. Los avisos de demostración están visibles.

shadcn/ui usa su variante Base UI: Button, Badge, Input y Field, instalados desde
el registro oficial. El tema se define con tokens semánticos y variantes; no se
copió un catálogo completo. Select y checkbox nativos tienen labels explícitos.
Los iconos decorativos se ocultan a tecnologías de asistencia.

## Adaptación y movimiento

Tres columnas en escritorio; dos en tablet y una por debajo de 480 px. Cabecera
oscura y menú disclosure nativo en móvil; Escape cierra el menú y devuelve el
foco. Controles de al menos 44 px, inputs de 16 px, foco visible y skip link.
No se bloquea pinch zoom. Se respetan los safe areas y el scroll nativo.

No hay animaciones de entrada ni movimiento de tarjetas al escribir. El feedback
se limita a color de borde, foco y presión del botón. El hover de tarjetas está
limitado a puntero preciso. `prefers-reduced-motion` elimina transiciones y
transformaciones animadas; las cubiertas mantienen su composición estática.

La revisión visual, pruebas de navegador y capturas se registran en
[VALIDACION_MVP.md](VALIDACION_MVP.md). Viewports emulados no prueban hardware móvil.
