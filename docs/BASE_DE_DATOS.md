# Datos: propuesta para validar

No hay esquema de producto, semillas ni migraciones SQL implementadas. La
configuración de desarrollo usa PostgreSQL 17, como el valor generado por la
CLI oficial. La versión deberá coincidir con el futuro proyecto remoto.

| Entidad propuesta | Responsabilidad | Relaciones previstas |
| --- | --- | --- |
| Materia | Nombre y posición curricular documentados | Recursos mediante relación N:M |
| Recurso | Ficha permanente, tipo, título, estado editorial | Materias, responsables/autores y documentos |
| Autor o responsable | Identificación bibliográfica o institucional | Recursos mediante relación N:M |
| Documento | Objeto Storage, MIME, tamaño, origen, permisos | Recurso y constancia de autorización |
| Fuente | Procedencia y enlace verificable | Recursos y documentos |
| Perfil editorial | Rol administrativo vinculado a Auth | Publicaciones y auditoría |
| Evento | Información institucional confirmada | Referentes y recursos, si se requiere |

Libros, doctrina, jurisprudencia y legislación pueden compartir una ficha base
con atributos por tipo. Evitar decidir campos jurídicos específicos sin validar
el catálogo real. Elegir slugs permanentes, reglas de cambio y redirecciones antes
de publicar URLs. Considerar búsqueda nativa PostgreSQL primero; evaluar índices,
normalización de acentos y resultados representativos antes de incorporar otro motor.

RLS será obligatoria en todas las tablas expuestas. Las lecturas anónimas deben
filtrar por publicación y permisos; las escrituras deben exigir autorización
editorial validada en servidor y en políticas SQL. No confiar en `user_metadata`
editable para decisiones de autorización. En la configuración local, las tablas
nuevas requieren GRANT explícito (`auto_expose_new_tables = false`).

Storage no tiene buckets creados. Se prevén buckets privados, políticas por
objeto y URLs firmadas cuando corresponda. No subir PDFs hasta confirmar derechos.
Probar accesos permitidos y denegados antes de habilitar distribución o administración.

Al crear el esquema, cargar `supabase` y `supabase-postgres-best-practices`,
generar migraciones versionadas, regenerar tipos y ejecutar pruebas SQL. No
aplicar migraciones remotas ni reiniciar datos existentes sin autorización.
