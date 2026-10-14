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

Probadas desde cero en PostgreSQL 17.11 nativo con fixtures de plataforma aislados;
Supabase remoto y Auth/Storage HTTP siguen pendientes. Los fixtures de tests/postgres
no se aplican a proyectos reales. Ver docs/BACKEND_ADMIN.md y VALIDACION_BACKEND.md.
El bucket library-private debe ser privado y compatible; la migración falla ante
una configuración preexistente insegura, sin volver público el bucket.
