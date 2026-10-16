# Backend y administración documental

Fase 3 sobre el MVP del PR #2, fusionado el 14/10/2026. El panel y el adaptador
Supabase están implementados. **No hay un proyecto remoto conectado en este
entorno:** sin credenciales válidas, `/admin` informa la conexión pendiente y
rechaza operaciones. No hay login de demostración ni persistencia en navegador.

## Modelo y flujo

`academic_units` y `subjects` representan la carrera y sus 34 materias.
`works` es la obra o ficha intelectual; `editions` registra sus ediciones y
`documents` sus manifestaciones disponibles: PDF, enlace externo o referencia.
`files` describe el binario privado, con SHA-256, bytes, páginas y fecha de
validación. Un documento tiene como máximo un archivo; una obra puede tener
varios documentos y varias materias mediante `work_subjects`, sin duplicar PDF.
`work_authors` permite múltiples autores. Jurisprudencia y legislación tienen
metadatos específicos en tablas propias. Fuentes, licencias, permisos por
documento y eventos editoriales completan la trazabilidad.

Proceso del panel:

1. Ingresar título y tipo, con PDF privado, enlace HTTPS o referencia.
2. Completar descripción, autores, fuente, licencia y clasificación por materias.
3. Registrar ediciones; cada documento de un libro requiere una edición publicada.
4. Verificar evidencia y vigencia de permisos de cada documento.
5. Enviar el documento a revisión y publicarlo; luego revisar y publicar la obra.

PostgreSQL bloquea saltarse la revisión y publicar sin metadatos, fuente
verificada, permisos vigentes o archivo realmente registrado en Storage. Una
referencia puede publicarse sin atribuir derechos de distribución del libro.
Un PDF requiere además una licencia que permita distribuirlo. Evidencia,
verificador y fechas de autorización permanecen privados.

Los estados son `draft`, `review`, `published` y `archived`. Slug y tipo de obra
son inmutables para conservar URLs. La edición de metadatos desde el panel vuelve
la obra a borrador; cambios materiales del documento invalidan su autorización.
Revocar permisos o licencias, deshabilitar o despublicar retira lectura pública
por RLS. Los campos heredados `files.editorial_status` y `distribution_allowed`
no gobiernan la publicación: la decisión autoritativa está en el documento y sus
permisos. El reemplazo de binarios exige otro documento; no hay sobrescritura.

## Panel

- `/admin/login`: contraseña mediante Supabase Auth; sin signup público.
- `/admin`: obras, estados editoriales, búsqueda y paginación de 50 registros.
- `/admin/obras/nueva`: ingreso inicial y carga privada.
- `/admin/obras/[id]`: obra, autores, materias, ediciones, archivos, fichas
  judiciales/legislativas, permisos, vista privada de revisión y publicación.
- `/admin/catalogo`: altas y edición de autores, fuentes y licencias.

Los selectores consultan nombres con límite de 50 y conservan las selecciones;
no requieren pegar IDs. Los formularios muestran pendientes y errores, y se
adaptan a móvil. No existen acciones administrativas genéricas ni borrado de
obras/archivos desde el panel.

## Seguridad

Cada operación consulta `auth.getUser()` en el servidor y verifica membresía
activa en `private.library_admins`. La función RLS comprueba también `session_id`
contra `auth.sessions`: revocar membresía o sesión bloquea tokens todavía vigentes.
No se autorizan roles provenientes de `user_metadata` ni del antiguo claim
`app_metadata.library_role`. Un usuario no puede darse de alta como administrador.
Solo el propietario de la base puede aprovisionar esa tabla privada.

Todas las tablas públicas y la tabla de administradores tienen RLS y GRANT
explícitos. Lectura pública requiere publicación, habilitación y permisos; las
licencias con evidencia, verificaciones y auditoría son solo administrativas.
Las funciones SECURITY DEFINER tienen search_path vacío y permisos de ejecución
acotados. La aplicación emplea únicamente clave pública y JWT del usuario: no
necesita una clave service-role. La lectura pública usa un cliente anon nuevo,
sin cookies administrativas. Las sesiones se mantienen en cookies HTTPOnly,
SameSite=Lax y Secure con HTTPS, con respuestas privadas sin caché.

Mutaciones exigen mismo origen; `HOTTO_SITE_ORIGIN` fija el origen público exacto
si el despliegue usa un proxy HTTPS. No se confía en un forwarded-host arbitrario.
JSON y multipart tienen límites reales de lectura, incluso sin Content-Length.
PDFs: máximo 25 MiB, 1–2000 páginas, parseo estructural, SHA-256, rechazo de cifrado,
acciones automáticas/JavaScript y adjuntos. Esto no es un antivirus; añadir uno
antes de admitir archivos no confiables de terceros.

Bucket `library-private`, privado y limitado a PDF. Políticas restrictivas
protegen también frente a políticas permisivas preexistentes de otros buckets.
No se permiten overwrite ni borrar objetos ligados a documentos. Los gateways
`/api/library/files/[id]` y `/api/admin/files/[id]` verifican RLS por solicitud y
transmiten el PDF, con Range y sin caché. La URL firmada de 60 segundos permanece
en el servidor. Bytes ya entregados no pueden retirarse del equipo del lector.

## Conexión pendiente

Se comprobaron configuración Cloud, nombres/presencia de variables y la CLI.
No hay bindings Supabase ni project-ref. `supabase projects list` exige access
token. Eso indica falta de acceso configurado, no demuestra que el propietario
no tenga un proyecto existente. No se creó ningún servicio remoto.

Para continuar, el propietario debe seleccionar un **proyecto de desarrollo**
existente o crear uno desde Supabase con el plan que autorice. Configurar por el
mecanismo seguro del entorno, sin pegar secretos en chat:

| Variable                             | Uso                                                           |
| ------------------------------------ | ------------------------------------------------------------- |
| NEXT_PUBLIC_SUPABASE_URL             | URL real del proyecto                                         |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Clave pública publishable, o anon heredada                    |
| HOTTO_DATA_SOURCE                    | `supabase` opcional; conexión parcial produce error explícito |
| HOTTO_SITE_ORIGIN                    | Origen HTTPS exacto del despliegue cuando haya proxy          |

Reiniciar el servidor y reconstruir el despliegue después de configurar variables
NEXT_PUBLIC; Next integra esas variables al build.

Agregar el hostname específico del proyecto a la política de red; no inventar
hosts ni habilitar todos los proyectos Supabase. Las migraciones requieren además
acceso administrativo **de desarrollo**, por CLI vinculada o conexión SQL segura.
Con ese acceso, el agente puede aplicar las migraciones ordenadas, cotejar la
versión y generar tipos reales, sin tareas manuales innecesarias. No aplicar a
producción ni resetear datos existentes.

Crear el primer usuario mediante Supabase Auth y elegir explícitamente quién
será administrador. El propietario SQL puede habilitarlo después de migrar:

```sql
insert into private.library_admins(user_id, active)
select id, true from auth.users where lower(email) = lower('<correo elegido>')
on conflict (user_id) do update set active = true;
```

La semilla no crea usuarios, obras, permisos de distribución ni cuentas de
prueba. Tras la conexión faltan las pruebas integradas reales: login/logout,
no-administrador, carga por Storage HTTP, vista privada, revisión/publicación,
lectura anónima, despublicación y revocación. No se han considerado aprobadas.

## Biblioteca y límites

Con Supabase configurado, la biblioteca consulta exclusivamente el catálogo
publicado, con búsqueda por título/autor/palabras clave, acentos, filtros y
paginación de 50. Maneja catálogo vacío y error de conexión sin sustituirlo por
muestras. Las URLs y fichas existentes se conservan. `/biblioteca/demo` retiene
los 13 ejemplos y los dos PDF originales, claramente identificados, fuera del
catálogo definitivo. Sin conexión, el modo inicial sigue siendo demostración.
Las 34 materias mantienen el cotejo primario pendiente documentado en
DATOS_Y_FUENTES.md; la semilla conserva esa procedencia.

`metadata` y `metadata_origin` preparan una futura asistencia de clasificación;
no hay ejecución de IA, agentes, importaciones masivas ni suscripciones. El visor
actual usa PDF nativo del navegador; PDF.js avanzado sigue pendiente. La búsqueda
SQL pagina resultados pero normaliza texto durante la consulta; medir con datos
reales antes de incorporar índices de búsqueda avanzada. No se efectuaron pruebas
de volumen de miles de documentos ni se declara capacidad medida.
