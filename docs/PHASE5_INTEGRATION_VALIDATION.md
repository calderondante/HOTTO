# Cierre de integración: validación del PR #4 (17/10/2026)

El PR #4 sigue abierto. Al iniciar esta revisión, `verify` y `postgres` estaban
aprobados. La base de desarrollo `trkoraszozabtywkfvin` tenía exactamente siete
migraciones, con SQL idéntico al repositorio; 34 materias, cero obras y cero
objetos en `library-private`. La única cuenta Auth consultada por correo,
`calderondante2004@gmail.com`, tiene correo confirmado y una membresía activa
en `private.library_admins`. No se modificó su identidad ni su contraseña.

La migración incremental `20261017000001_consolidate_rls_and_approval_index.sql`
se probó en PostgreSQL 17 local y con una transacción remota revertida antes de
aplicarse a desarrollo. La aplicación y el registro del SQL en
`supabase_migrations.schema_migrations` fueron atómicos. La verificación posterior
confirmó ocho entradas, SQL idéntico para las ocho, 34 materias, cero obras y
cero objetos. Todas las tablas públicas conservan RLS.

Las 12 tablas que ofrecían a `authenticated` dos políticas permisivas SELECT
ahora tienen una política de lectura por rol: `anon` conserva la lectura pública
condicionada; `authenticated` puede leer lo público y, si es administrador
activo, los registros administrativos. INSERT, UPDATE y DELETE requieren
`is_library_editor()`. Las tablas privadas de licencias y permisos también
tienen políticas separadas por operación. Se añadió el índice
`jurisprudence_approved_by_idx`; no se eliminaron índices por uso bajo. El asesor
remoto ya no informa los 12 avisos de políticas superpuestas. Sigue informando
`auth_leaked_password_protection`: la protección está desactivada. [Supabase
documenta](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
que se activa en Auth settings y que requiere plan Pro o superior. Si el plan
la permite, habilitar **Leaked password protection** en el Dashboard del
proyecto; no se contrató un plan ni se cambió esta configuración.

Pruebas ejecutadas: PostgreSQL 17 desechable con semilla, RLS, publicación y
revocación, almacenamiento y jurisprudencia; 18 tests Node; TypeScript, ESLint
y build. Contra Supabase real, la clave pública ve 34 materias y la búsqueda
judicial vacía, pero no puede escribir jurisprudencia, subir al bucket privado
ni leerlo. La aplicación compilada respondió 200 para inicio, biblioteca,
materias, jurisprudencia y login; `/admin` redirigió al login y
`/api/admin/options` devolvió 401 sin sesión. Auditoría axe de login y
biblioteca: cero violaciones; la biblioteca tuvo una comprobación incompleta.

La sesión Auth real y la primera carga/publicación/lectura/despublicación
remotas **siguen pendientes**. El secreto `HOTTO_TEST_ADMIN_PASSWORD` ya está
disponible, pero Supabase Auth devolvió `invalid_credentials` al intentar
ingresar con esa cuenta, tanto desde HOTTO como mediante el cliente Auth. No se
inició sesión ni se modificaron obras. Tampoco hay otra cuenta Auth legítima no
administradora para la prueba HTTP de ese rol. Los fixtures SQL ejercitan sus
reglas de RLS, pero no sustituyen esas pruebas. El titular debe comprobar el
valor actual del secreto en la configuración segura de Codex Cloud y reiniciar
el entorno después de corregirlo; no debe enviarlo por chat. Cuando Auth acepte
la contraseña se podrá ejecutar el circuito con uno de los PDF originales del
repositorio. Retirar ese secreto después.
