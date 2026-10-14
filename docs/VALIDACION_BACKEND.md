# Validación del backend documental — 14/10/2026

## Consolidación

PR #2 revisado y fusionado mediante merge normal, sin bypass ni force, con sus
checks SUCCESS. Merge `156285e0b9ce4928fe6eb201142b441de0d0d441`.
Rama de esta entrega: `feature/hotto-backend-admin`. PR de entrega: #3.
Node 24.19.0, pnpm 11.25.0, 19 skills intactas, Next 16.4 y React 19.3 conservados.

## Pruebas ejecutadas

- `bash scripts/verify-setup.sh`: integridad de skills, pruebas Node del dataset
  y backend, TypeScript, ESLint sin warnings, build y smoke de producción.
- Smoke: 51 páginas del MVP, 34 materias, 13 fichas, búsqueda/filtros SSR, cinco
  404, dos PDF originales, SEO y CSS. Añade `/biblioteca/demo`, ID de PDF inválido,
  rechazo de origen externo y comprobaciones del panel no conectado: ingreso,
  cargas, cambios y vistas privadas rechazados, incluso con cookie inventada.
- 16 pruebas Node aprobadas (8 existentes y 8 de backend): configuración/claves privilegiadas, límites de entradas,
  whitelist de metadatos, URLs HTTPS y fechas, PDF real y SHA-256, rechazo de
  archivos inválidos, excesivos y con acciones JavaScript, Range y validación de
  origen con normalización de host de Next. No usan autenticación simulada.
- `bash scripts/test-postgres.sh`: **PostgreSQL 17.11 real**, binarios nativos
  oficiales Debian, descargados con índices firmados; sin imagen Docker pesada
  en Cloud. Cluster propio temporal, socket Unix y sin escucha TCP.
- Aplicación desde cero de las cuatro migraciones, semilla con 34 materias,
  correspondencia de 14 contratos TypeScript con columnas SQL reales.
- SQL: anon no escribe; usuario sin membresía no escribe ni puede convertirse en
  admin; claims falsificados no autorizan. Admin activo autorizado, revisión
  obligatoria, permiso no verificado bloqueado, referencia permitida sin PDF,
  asociación N:M, búsqueda por autor y filtro de materia, evidencia privada,
  revocación inmediata, PDF exige objeto Storage registrado, edición sincronizada,
  identidad del archivo y sección de URL inmutables, overwrite bloqueado y
  despublicación bloquea Storage incluso con política permisiva preexistente.
  Revocar sesión o membresía bloquea JWT todavía vigente.
- Navegador Chromium: búsquedas/filtros/URL/recarga, 47 navegaciones de tarjetas,
  descarga real, ocho auditorías axe públicas sin violaciones, 18 revisiones de
  layout móvil/escritorio, teclado y reduced-motion. `/admin` sin conexión y `/admin/login` móvil:
  auditorías axe sin violaciones; no se abrió un panel autenticado de prueba.

Las pruebas SQL incluyen esquemas mínimos de plataforma `auth` y `storage` y
roles de Supabase en **una base desechable**. Ejercitan PostgreSQL, RLS, triggers,
FKs y tablas/políticas Storage de verdad. No arrancan GoTrue, PostgREST ni Storage
HTTP, y **no equivalen a pruebas integradas de Supabase remoto ni a validar la
firma de JWT**. La aplicación no reutiliza esos fixtures para autenticarse.

CI incorpora trabajos separados `verify` y `postgres`, este último con servicio
PostgreSQL 17.11 efímero en GitHub Actions. No descarga el contenedor en Cloud.
Los resultados remotos finales se informan en el PR sobre su commit publicado.

## Reproducción SQL

`bash scripts/pnpm.sh test:postgres` requiere PostgreSQL nativo disponible mediante
`HOTTO_TEST_PG_BIN` o las rutas habituales 17/16. Si falta, termina con código 2;
no declara éxito. Para CI existe `HOTTO_TEST_DATABASE_URL`, restringido a loopback
y nombre `hotto_test_*`; rechaza una base no vacía. Los fixtures no se deben
aplicar a un proyecto Supabase real ni a una base compartida. Los logs temporales
quedan en `.cache`, fuera de Git.

## No ejecutado

No hay proyecto Supabase conectado, credenciales/bindings ni referencia local.
No se aplicaron migraciones remotas, no se hizo login real en un proyecto, carga
Storage HTTP ni publicación completa desde un navegador autenticado. Tampoco se
probaron rendimiento con miles de recursos, deployment o lector PDF.js avanzado.
Ver BACKEND_ADMIN.md para el acceso que permitirá completar esas verificaciones.

La configuración Cloud se guarda como borrador de install/start y referencia Git;
guardarla no la publica ni valida su reconstrucción en una tarea nueva.

Capturas reales del estado no conectado: `design/capturas/admin-conexion-pendiente.png`
y `design/capturas/admin-movil-conexion-pendiente.png`. No muestran una sesión
administrativa operativa. MCP de Next sin errores de compilación/runtime; se
revisó además el árbol React de la biblioteca.
