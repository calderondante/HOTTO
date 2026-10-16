# Migraciones documentales

Aplicar los archivos SQL en orden mediante la CLI Supabase a una base de desarrollo
con acceso autorizado. No modificar foundation después de haber sido aplicada:
las migraciones posteriores reemplazan sus políticas y agregan el flujo documental.

1. `20261013215529_library_foundation.sql`: modelo inicial del MVP.
2. `20261014000705_documentary_admin.sql`: documentos, permisos, administradores,
   legislación, auditoría, revisión/publicación, RLS y Storage privado.
3. `20261014000707_academic_seed.sql`: unidad, fuentes y 34 materias; sin obras ni
   administradores ni atribuciones de distribución ficticias.
4. `20261014002405_public_catalog_search.sql`: búsqueda pública paginada.
5. `20261016000001_jurisprudence_hybrid.sql`: fallos con enlace oficial,
   identificador único, búsqueda filtrada, fichas A/B/C y aprobación editorial.
6. `20261016000002_jurisprudence_approval_integrity.sql`: atribución inmutable
   de aprobaciones e invalidación de una URL oficial modificada.

Probadas desde cero en PostgreSQL 17.11 nativo con fixtures de plataforma aislados.
Las seis están aplicadas al proyecto Supabase de desarrollo `trkoraszozabtywkfvin`;
el historial remoto registra el SQL exacto de cada archivo. La red de Cloud bloquea
la conexión PostgreSQL TCP de la CLI, por lo que se aplicaron por la API HTTPS
oficial (`supabase db query --linked`) tras ensayo transaccional con `rollback`,
y se registraron en `supabase_migrations.schema_migrations`. Consultar
`docs/PHASE4_SUPABASE_LIVE.md` antes de otro despliegue. Los fixtures de
`tests/postgres` nunca se aplican a proyectos reales.
El bucket library-private debe ser privado y compatible; la migración falla ante
una configuración preexistente insegura, sin volver público el bucket.
