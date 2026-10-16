# Entorno de desarrollo

Repositorio seleccionado: `calderondante/HOTTO`, checkout `/workspace/HOTTO`.
Inicialmente estaba vacío, en una rama local sin commits llamada `work`, y
GitHub no devolvía refs. El bootstrap se fusionó vía PR #1; el MVP se desarrolla en
`feature/hotto-biblioteca-mvp`.
El estado final de publicación y las verificaciones ejecutadas se registrarán
en `docs/VALIDACION.md`.

## Persistencia

| Elemento                                          | Persistencia                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Fuente, config, docs, scripts, skills y lockfiles | Git, después de commit y push confirmado                             |
| `node_modules`, `.next*`, `.cache`                | Generados y excluidos; reconstruir con scripts                       |
| Procesos web, navegador y contenedores            | Reiniciar por sesión; no sobreviven por estar versionados            |
| Install Script y Start Skill cloud                | Borrador de configuración, sujeto a guardado/publicación del entorno |
| `.env.local`, sesiones y credenciales externas    | Solo estado local o configuración segura; nunca Git                  |

## Install Script y Start Skill

Install Script completo:

```bash
set -euo pipefail
cd /workspace/HOTTO
bash scripts/setup-cloud.sh
```

Start Skill debe indicar: usar el checkout existente, sin worktrees salvo pedido
explícito; leer `AGENTS.md`; ejecutar setup si faltan dependencias; iniciar
`HOTTO_BUILD_DIR=.next-mvp bash scripts/pnpm.sh dev --hostname 127.0.0.1 --port 3000` en un proceso mantenido
por las herramientas de la sesión; comprobar HTTP 200 en /biblioteca y 34 tarjetas en /biblioteca/materias, revisar
errores y, cuando haya tareas de interfaz, aplicar `next-dev-loop` con MCP y el
navegador local. Capturar pantallas del MVP sin presentar links de loopback como una URL pública.

Build/start usan `.next-production`, separados de `.next-mvp`: no borrar caches
de servidores vivos ni terminar procesos ajenos. Esta entrega no arranca Supabase
local: el intento anterior de bajar PostgreSQL excedía el espacio disponible.
No repetir descargas pesadas. La base remota queda para una fase autorizada.
No imprimir credenciales; el setup no reinicia datos.

## Red

La política observada es restringida, con el preset de gestores de paquetes,
GitHub por HTTPS y raw.githubusercontent.com permitidos. npm y Git de lectura
funcionaron. Se solicitaron adiciones a los dominios personalizados conservando
los presets existentes:

- `ui.shadcn.com`: registro de componentes y documentación shadcn.
- `supabase.com`: documentación y changelog de Supabase.
- `api.github.com`: consulta de repositorio y creación del PR mediante GitHub CLI.
- `results-receiver.actions.githubusercontent.com`: descarga de logs del CI de GitHub.

El borrador guardado no cambia por sí solo la red de esta máquina. Revisar y
guardar cambios en la configuración del entorno y publicarlo para activar la
versión correspondiente. Reintentar la operación después de aplicar cambios.
No desactivar TLS ni ampliar a todos los hosts para solucionar un bloqueo.

La documentación oficial de instalación de Next.js y shadcn se consultó desde
sus repositorios oficiales accesibles. El registro shadcn no respondió en la
política inicial, por lo que se usó la instalación manual oficial. Agregar
componentes posteriormente requiere acceso al registro o una fuente autorizada.

La consulta REST inicial de GitHub fue rechazada, pero posteriormente funcionaron
la creación y la lectura del PR mediante GitHub CLI. Las capacidades se verifican
por operación; un rechazo inicial no demuestra que falten todas las credenciales.

Docker y Chromium están presentes en la máquina inspeccionada. En una máquina
distinta, verificar sus capacidades antes de exigir checks que los necesiten.
El flujo inicial de tipos, lint, build y smoke no requiere Docker, navegador ni
claves Supabase; el flujo de UI real y datos sí necesita sus servicios específicos.

El Chromium de este contenedor no tiene el helper SUID configurado. Para verificar
la aplicación local aislada se utilizó el argumento `--no-sandbox` del navegador:

```bash
export AGENT_BROWSER_ARGS='--no-sandbox'
bash scripts/browser.sh open http://127.0.0.1:3000
bash scripts/browser.sh snapshot
bash scripts/browser.sh react tree
bash scripts/browser.sh errors
bash scripts/browser.sh close
```

El wrapper mantiene el socket en `.cache/agent-browser`, selecciona Chromium y
habilita el hook React. La CLI 0.39.1 guarda exports de restore bajo HOME sin
override de ruta; esa carpeta es de solo lectura aquí. Se usa su alternativa
oficial de perfil Chrome persistente en `.cache/browser/profile-<sesión>` y
`restore-save=never` para evitar ese export inaccesible. No se cambia HOME.
En un equipo con sandbox de navegador funcional, omitir `AGENT_BROWSER_ARGS`.
No se desactiva verificación TLS. Mantener los mismos argumentos en cada shell.

La CLI de Supabase tiene fallback oficial de ECR a GHCR. Si ECR está bloqueado,
puede fijarse `SUPABASE_INTERNAL_IMAGE_REGISTRY=ghcr.io` para el comando de arranque,
con las mismas versiones de servicios; no se sustituyen imágenes por terceros.

## Estado observado en el MVP

GitHub CLI permitió revisar CI, fusionar PR #1 y trabajar en la rama nueva.
El registro/documentación shadcn y Supabase respondieron correctamente en esta
sesión; se agregaron componentes selectivamente sin reinstalar las skills.
Drive y los dos hosts UNLaM continuaron bloqueados con CONNECT 403. El borrador
agrega esos tres dominios a los cuatro anteriores, conservando la configuración.
Guardar un borrador no publica la configuración ni cambia la sesión actual.
La única acción de interfaz pendiente, si no se publicó todavía, es publicar
el borrador revisado del entorno. Se guarda la revisión final de la rama por SHA.

Node 24.19.0, pnpm 11.25.0, Next 16.4.0 y React 19.3.0 conservados. Se agregó
Base UI 1.9.0, fijado en package y lockfile, para los componentes oficiales.
Un servidor preexistente en 3000 se preservó: el desarrollo propio usa 3001 y
`.next-mvp`; en una sesión nueva usar 3000 si está libre. La verificación HTTP de
producción utiliza un puerto libre y termina solo su proceso.

El install script puede reconstruir el proyecto con dependencias congeladas y
skills versionadas. Los scripts no requieren credenciales Supabase ni Docker.
La ejecución de la migración/RLS no fue probada; ver BASE_DE_DATOS.md.

## Fase 3: backend documental

PR #2 integrado; rama feature/hotto-backend-admin. El estado SQL anterior era
histórico: las cuatro migraciones y RLS ahora se probaron en PostgreSQL 17.11
nativo aislado, sin contenedores Cloud. Ver VALIDACION_BACKEND.md. No hay proyecto
Supabase conectado; Auth/Storage HTTP siguen pendientes. El frontend conserva
demo sin credenciales; el panel se cierra con explicación hasta configurar acceso.

Start Skill actualizado debe consultar BACKEND_ADMIN.md y VALIDACION_BACKEND.md,
iniciar `.next-admin` en puerto libre y verificar `/biblioteca`, `/biblioteca/demo`,
34 materias y `/admin`. No exigir muestras en el catálogo real ni activar login
simulado. Configuración remota por variables públicas de proyecto y bindings
seguros de acceso administrativo de desarrollo; nunca imprimir sus valores.
El borrador final fija el SHA de esta rama y requiere publicación desde la UI.
