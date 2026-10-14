# Validación del primer MVP

Fecha: 13 de octubre de 2026. Rama: feature/hotto-biblioteca-mvp.
PR #1 fusionado sin admin ni bypass, commit de merge
8c03ffe326ab8898cafd98b29276ce1e2dad67b5. CI previo y del merge aprobado.
La publicación de este MVP se registra en el PR nuevo; no se despliega un sitio.

## Entorno y controles ejecutados

| Comando / control | Resultado |
| --- | --- |
| bash scripts/setup-cloud.sh | OK, reconstrucción frozen-lockfile, peers, herramientas y 19 skills |
| bash scripts/verify-setup.sh | OK, 8 tests, TypeScript, ESLint sin warnings, build y smoke |
| node scripts/check-integrity.mjs | OK, 19 skills y 169 archivos auxiliares conservados |
| node scripts/smoke.mjs | OK, 51 páginas: 4 principales, 34 materias y 13 fichas |
| Smoke extra | Filtros SSR, cero resultados, 5 URLs inexistentes con HTTP 404, 2 PDF reales, CSS y metadatos |
| AGENT_BROWSER_ARGS=--no-sandbox node scripts/browser-mvp.mjs | OK, Chromium real, CDP de la sesión propia y eventos nativos |
| pdftotext de PDF de muestra | OK, una página de texto legible, no copia de terceros |
| pglast 7.10 | 46 sentencias analizadas; solo sintaxis, sin ejecución SQL |
| Patrones de credenciales en 59 archivos de fuente/config/docs | Sin coincidencias; no es una auditoría exhaustiva de seguridad |
| git diff --check | OK |

No se reinstalaron skills. La referencia PNG se comparó con el JPEG aportado:
0 píxeles distintos tras decodificación. Los PDF se declaran binarios en
.gitattributes para preservar sus bytes y las entradas xref con espacios de formato. Dependencias se reconstruyeron desde
lockfile, con Node 24.19.0/pnpm 11.25.0. No se descargó PostgreSQL ni se usó Docker.

## Pruebas de comportamiento en navegador

- Entrada desde inicio, búsqueda por título sin acento, autor y palabra clave.
- Combinación de materia/tipo/PDF, formulario GET, recarga y estado en URL.
- Cero resultados, restablecer y limpiar filtros.
- 13 tarjetas de recursos y las 34 de materias abren su propia ficha por click.
- Búsqueda de materias y filtro de año; recuperación desde estado vacío.
- Libros referenciados sin botón de descarga; click en descarga original produce
  un PDF idéntico al versionado, comprobado por bytes.
- 18 combinaciones de seis pantallas y anchos 640/375/320: sin desborde horizontal.
  640 px comprueba reflow; no se afirma haber probado zoom de navegador nativo.
- Menú con Enter, Tab y Escape, foco devuelto al summary, skip link, inputs de
  16 px y transición desactivada bajo prefers-reduced-motion.
- Sin excepciones de runtime registradas durante la ejecución final.

MCP de Next: get_routes enumeró ocho patrones de rutas; get_compilation_issues
retornó issues vacío y get_errors devolvió configErrors/sessionErrors vacíos.
React DevTools identificó el árbol de componentes y los límites cliente. Estas
observaciones son de la sesión de desarrollo; no se extrapolan a un servicio remoto.

## Accesibilidad

axe-core 4.12.1, resultados de la ejecución final:

| Pantalla | Violaciones | Chequeos incompletos |
| --- | --- | --- |
| home | 0 | 1 |
| library | 0 | 1 |
| subjects | 0 | 0 |
| subject-pilot | 0 | 1 |
| book | 0 | 0 |
| reference | 0 | 0 |
| case | 0 | 1 |
| mobile-library | 0 | 1 |

Los incompletos corresponden a contraste sobre gradientes: axe no puede resolver
el fondo automáticamente. Revisión manual de los colores más claros del fondo:
dorado #d4b77d sobre #36253d, 7,30:1; secundario #c7c0cb sobre ese fondo, 7,95:1;
dorado sobre #302238, 7,70:1. Botón blanco sobre violeta #442259, 12,97:1;
texto secundario sobre blanco, 6,18:1; aviso marfil, 6,09:1. No se declara una
certificación WCAG, una prueba con lector de pantalla ni un PDF etiquetado accesible.
No hubo prueba en hardware móvil ni en Safari/Firefox.

## Revisión visual (emil-design-eng / apple-design)

| Before | After | Why |
| --- | --- | --- |
| Pantalla técnica mínima | Biblioteca, fichas y navegación institucional | Prioridad de producto cumplida |
| Sin referencia incorporada | PNG original y paleta/jerarquía adaptadas | Identidad consistente con la lámina |
| Botón PDF oscuro sobre violeta, 1,26:1 | Blanco sobre violeta, 12,97:1; axe sin violación | Corregir una falla real de contraste por cascada CSS |
| Estado de búsqueda efímero | History API + GET y recarga comprobada | Filtros compartibles y recuperación |
| Materia inexistente con pantalla 404 y HTTP 200 | HTTP 404, sin boundary de carga que adelante el streaming | Estado HTTP correcto, smoke de regresión |
| Tarjetas estrechas en móvil | Una columna bajo 480 px y controles de 44 px | Lectura y tacto en 320/375 px |

## Revisión de animaciones (review-animations)

| Hallazgo | Acción | Resultado |
| --- | --- | --- |
| Lectura/listados no requieren animación de entrada | Sin transiciones al filtrar ni escalonar tarjetas | Lectura estable |
| Hover de tarjetas | Borde 140 ms, solo puntero preciso | Feedback discreto |
| Presión de botones | Escala mínima, sin animar layout | Feedback localizado |
| Reduced motion | CSS elimina transiciones/animaciones | Comprobado en navegador |

Verdict: **Approve** para el movimiento del MVP. Sin animaciones decorativas
repetitivas, transición de altura o bloqueos del scroll nativo.

## Capturas y límites

Capturas de producción, no de la referencia: [biblioteca escritorio](../design/capturas/biblioteca-escritorio.png),
[biblioteca móvil](../design/capturas/biblioteca-movil.png),
[inicio](../design/capturas/inicio.png) y [libro](../design/capturas/libro.png).

Dataset local: 34 nombres/códigos cotejados entre fuentes secundarias; fuente
institucional pendiente por CONNECT 403. Autores, recursos y casos son demo.
La migración y RLS no se probaron contra PostgreSQL; no hay base remota,
autenticación editorial ni visor avanzado conectados. Noindex permanece activo.

Configuración cloud: install script y Start Skill guardados como borrador,
con dominios específicos de Drive/UNLaM y revisión de repositorio fijada al commit
final. La herramienta devuelve requires_publish=true; la publicación del borrador
requiere la interfaz. Git y procesos temporales tienen persistencias distintas.
