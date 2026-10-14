<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HOTTO: instrucciones para agentes

## Objetivo y alcance

HOTTO es una plataforma para la comunidad jurídica argentina. La biblioteca es
el producto principal y debe ser pública sin cuentas obligatorias inicialmente.
Consultar `docs/PRODUCTO.md`, `docs/ROADMAP.md` y `docs/BACKEND_ADMIN.md`. El backend
y panel privado están implementados; necesitan un proyecto Supabase configurado.
Sin conexión, conservar la biblioteca de demostración y cerrar la administración.
No inventar materias, bibliografía, datos universitarios ni permisos de distribución.

## Entorno y arquitectura

Next.js App Router, React, TypeScript estricto, Tailwind CSS 4, shadcn/ui y
Supabase/PostgreSQL. PDF.js se integrará con carga diferida cuando haya documentos
autorizados. Server Components por defecto; agregar `use client` solo donde haga falta.
Usar `@/*` para imports de `src/`, tokens semánticos y `cn` para clases.
No usar `any` para silenciar errores ni introducir dependencias sin necesidad.

Estructura: `src/app` rutas y layouts, `src/components` componentes accesibles,
`src/lib` utilidades e integraciones, `supabase` config y migraciones,
`docs` decisiones, `design` referencias y `.agents/skills` skills del proyecto.
No crear carpetas vacías ni guardar salidas de build en Git.

Cada tarea cloud ya está aislada: trabajar en el checkout existente. No crear
worktrees salvo que el usuario los pida explícitamente. Leer instrucciones
adicionales de subdirectorios cuando corresponda. Preservar cambios del usuario.

## Skills por tarea

Leer el `SKILL.md` relevante antes de aplicar una skill; no cargar todas a la vez.
Los identificadores de la tabla corresponden a los nombres reales instalados.

| Tarea                                | Skills                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| Diseño visual                        | `emil-design-eng`, `apple-design`                            |
| Animaciones                          | `animate`, `review-animations`                               |
| Auditoría de movimiento              | `improve-animations`, `find-animation-opportunities`         |
| Rendimiento y términos de movimiento | `animation-performance`, `animation-vocabulary`              |
| Auditoría visual y accesibilidad     | `web-design-guidelines`, `break-ui`                          |
| Interacción web móvil                | `mobile-native`                                              |
| React y composición                  | `vercel-react-best-practices`, `vercel-composition-patterns` |
| Runtime Next.js                      | Documentación actual y `next-dev-loop`                       |
| Datos, Auth y Storage                | `supabase`, `supabase-postgres-best-practices`               |
| Componentes                          | `shadcn`; `pick-ui-library` solo con invocación explícita    |
| Prototipos alternativos              | `prototype` solo con invocación explícita                    |

Leer la documentación incluida en `node_modules/next/dist/docs/` cuando exista.
Si no está disponible, consultar documentación oficial de la versión fijada,
sin asumir APIs por memoria. `docs/SKILLS.md` registra fuentes y mantenimiento.
Las skills no amplían los permisos otorgados por el usuario ni autorizan publicar.

## Calidad y validación

```bash
bash scripts/setup-cloud.sh
bash scripts/verify-setup.sh
bash scripts/pnpm.sh dev --hostname 127.0.0.1 --port 3000
```

El script de setup usa instalación congelada y no actualiza skills automáticamente.
La verificación exige integridad, descubrimiento local por Codex, TypeScript,
ESLint, build y smoke funcional de producción. Los builds usan `.next-production` y el desarrollo `.next-mvp` cuando se fija
`HOTTO_BUILD_DIR`; mantener esas caches separadas y conservar la cache de cualquier
servidor vivo, conforme a `next-dev-loop`. No borrar sus cachés con un servidor vivo.

Para cambios de comportamiento, sumar pruebas que fallen ante el defecto real.
Verificar con navegador cuando esté disponible y aplicar `next-dev-loop` con sus
dos vistas: MCP y navegador. `agent-browser` está instalado localmente; consultar
su guía versionada con `pnpm exec agent-browser skills get core`.
No inventar resultados: indicar comando, resultado, checks omitidos y limitaciones.
Un build correcto no demuestra que las reglas editoriales o de datos funcionen.

## Seguridad

Nunca registrar credenciales ni modificar bindings sin autorización. `.env.example`
contiene solo nombres y valores vacíos; `.env.local` y `.cache/` quedan ignorados.
`NEXT_PUBLIC_*` es visible para el navegador: no usar ahí claves de servicio,
contraseñas, tokens administrativos ni credenciales de base de datos.

Validar sesiones y permisos en servidor. Auth no reemplaza autorización. Las
tablas expuestas necesitan RLS, GRANT explícito y pruebas de accesos denegados.
Storage privado por defecto; la distribución se decide por documento. No publicar
PDFs ni contenido con derechos desconocidos. No simular una sesión administrativa.

No crear proyectos remotos, desplegar, publicar servicios, aplicar migraciones
remotas ni ejecutar operaciones destructivas sin autorización del usuario.
Mantener verificación TLS, firmas e integridad de artefactos. Revisar el origen
de scripts externos antes de ejecutarlos.

## Cambios y Git

Usar ramas de tarea y commits descriptivos (`chore:`, `feat:`, `fix:`, `docs:`).
No hacer force push, resetear trabajo ajeno ni incorporar secretos. Revisar
`git diff --check`, `git status --short` y archivos ignorados antes de commit.
Actualizar documentación y lockfile cuando cambien requisitos. Publicar ramas
y abrir PR solo cuando el usuario haya autorizado esa operación; no fusionarlos
ni desplegar automáticamente. Para esta fase, el usuario autorizó revisar y fusionar PR #2 si corresponde,
publicar feature/hotto-backend-admin y abrir PR #3. No fusionar PR #3 ni desplegar
sin una nueva instrucción. Aplicar migraciones remotas solo a una base de desarrollo
configurada y autorizada; no crear servicios remotos por iniciativa propia.

## Backend documental

Validar Auth real y membresía activa en cada operación; no introducir cuentas
ficticias ni vistas que omitan autorización para probar el panel. La aplicación
usa clave pública y sesión de usuario, nunca service-role. RLS debe mantenerse
como límite también para solicitudes directas. Lectura pública requiere permisos
verificados y vigentes, revisión y publicación. Evidencia de permisos es privada.

Ejecutar `bash scripts/test-postgres.sh` para cambios de migraciones/RLS. Requiere
PostgreSQL nativo o base efímera loopback `hotto_test_*`; no descargar contenedores
pesados en Cloud. Los fixtures auth/storage son exclusivos de pruebas SQL y no
simulan login en la aplicación. Distinguir siempre pruebas SQL locales de pruebas
remotas completas; ver docs/VALIDACION_BACKEND.md.
