# Validación del bootstrap

Fecha: 2026-10-13. Alcance: preparación técnica, no implementación de producto.

## Versiones fijadas

| Herramienta o dependencia | Versión |
| --- | --- |
| Node.js de referencia | 24.19.0 (se acepta rama 24, desde 24.19) |
| pnpm | 11.25.0 |
| Next.js / React | 16.4.0 / 19.3.0 |
| TypeScript / Tailwind CSS | 5.9.3 / 4.3.3 |
| ESLint / eslint-config-next | 9.39.5 / 16.4.0 |
| shadcn CLI | 4.21.4 |
| Supabase CLI / JS / SSR | 2.120.0 / 2.117.3 / 0.12.7 |
| PDF.js | 6.4.299 |
| skills CLI / agent-browser | 1.7.2 / 0.39.1 |
| PostgreSQL configurado | 17; instancia local no validada |

Next.js y React se verificaron contra los tags estables del registro oficial;
se consultó el template/documentación del repositorio oficial Next.js. shadcn se
configuró según su instalación manual oficial accesible en GitHub. Los peers
quedan sin conflictos. El aviso de soporte de ESLint 9 está explicado en
`DECISIONES.md`; ESLint 10 se investigó y se descartó por peers incompatibles.

## Controles ejecutados en esta máquina

| Control | Resultado comprobado |
| --- | --- |
| `setup-cloud.sh` con frozen lockfile | Pasó, incluyendo ejecuciones repetidas |
| Reconstrucción sin `node_modules` ni `.next` | Pasó: reinstalación desde el store verificado y generación nueva de tipos/build |
| `check-integrity.mjs` | Pasó: 19 skills, 169 archivos copiados, hashes, referencias y exclusiones Git |
| Descubrimiento `skills list --agent codex --json` | Pasó: 19 skills de scope proyecto reconocidas por Codex |
| `pnpm peers check` | Sin conflictos |
| `pnpm typecheck` | Pasó: `next typegen` y `tsc --noEmit` |
| `pnpm lint` | Pasó, cero warnings de lint |
| `pnpm build` | Pasó, rutas `/` y `/_not-found` |
| `pnpm smoke` | Pasó: HTML HOTTO, idioma es-AR, noindex, CSS servido y ruta faltante 404 |
| Next.js dev + MCP | Arrancó; `get_compilation_issues` sin issues, `get_routes` con `/`, `get_errors` sin errores de configuración o sesión |
| Navegador Chromium + React DevTools | DOM esperado, árbol React inspeccionable y ningún error de página reportado |
| Viewport 375 × 812 | Pantalla mínima sin desbordamiento horizontal |
| axe-core 4.12.1, WCAG 2 A/AA | 15 checks pasados, 45 no aplicables, cero infracciones y cero resultados incompletos en la pantalla inicial |
| Perfil persistente de navegador | Dato de prueba conservado al cerrar/reabrir; dato eliminado después del control |
| Scripts shell | Sintaxis válida con Bash |

Los controles de navegador/a11y cubren únicamente la pantalla inicial. No
demuestran accesibilidad, seguridad o funcionamiento de páginas aún inexistentes.
No se ejecutó una suite de producto porque no hay funcionalidades ni tests de
producto implementados. El workflow CI está preparado; su ejecución en GitHub
no se verificó desde esta sesión.

## Límites comprobados

La CLI Supabase pudo inicializar configuración y responder a ayuda/versiones.
El intento de arrancar el stack mínimo (PostgreSQL, Auth, Storage, Kong y REST)
falló al registrar capas de la imagen PostgreSQL 17.11.0.004:
`failed to register layer: no space left on device`. El disco es de 32 GB.
ECR estaba bloqueado; el fallback oficial a GHCR descargó las otras imágenes.
La falta de espacio también apareció en los intentos automáticos de la CLI.
Se detuvo el proceso propio y se eliminaron las cuatro imágenes descargadas por
esta prueba; no se crearon contenedores, tablas, buckets ni volúmenes de producto.
El backend local completo y sus consultas quedan **sin validar**. Requieren
capacidad suficiente para esas imágenes o un proyecto remoto autorizado en una
tarea posterior. No se creó ni vinculó ningún servicio remoto como alternativa.

El registro `ui.shadcn.com`, la documentación `supabase.com` y `api.github.com`
devolvieron bloqueos en la política inicial. Las adiciones de dominios se
guardaron en un borrador cloud, junto con Install Script y Start Skill. Ese
guardado no activa la red ni publica un snapshot. Revisar/guardar cambios en
los ajustes del entorno y publicar la versión cuando corresponda.

Se verificó reconstrucción de dependencias y build en este checkout, usando
archivos versionables y el store local. No se inició una nueva tarea cloud ni
se publicó el entorno desde esta sesión; no se afirma que esas etapas hayan
sido verificadas. Las sesiones y procesos necesitan reiniciarse después.

## Git

La rama de trabajo es `setup/hotto-bootstrap`. Se creó y subió `main` con un
commit inicial vacío para poder comparar el bootstrap, sin force push ni código
de producto directo sobre main. La publicación del bootstrap debe comprobarse
mediante `git ls-remote origin refs/heads/setup/hotto-bootstrap` después del push.
No se fusiona la rama ni se despliega la aplicación.

La API de GitHub devolvió `Forbidden` bajo la política observada. El acceso Git
por HTTPS sí funciona: no se solicitó un token adicional ni se concluyó que la
autenticación Git estuviera ausente por el estado de `gh auth`. Si la API sigue
bloqueada, el PR puede abrirse en GitHub desde la comparación de ramas, o desde
una sesión con el dominio permitido; no se declara un PR creado sin su URL.

Siguiente paso de producto: validar el listado oficial de 34 materias y los
permisos documentales antes de diseñar las primeras migraciones y políticas RLS.
