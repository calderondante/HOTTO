# Arquitectura de HOTTO

Next.js 16.4 App Router, React 19.3, TypeScript estricto y shadcn/Base UI.
Server Components por defecto. Panel privado y catálogo comparten el dominio.

| Capa           | Implementación                                                                      |
| -------------- | ----------------------------------------------------------------------------------- |
| Biblioteca     | Rutas de materias, libros, jurisprudencia y complementos existentes                 |
| Datos          | Adaptador server-only `library/backend.ts`, SDK tipado, RPC search_catalog          |
| Demostración   | Dataset versionado conservado y `/biblioteca/demo`, fuera del catálogo real         |
| Búsqueda       | AND de términos sin acentos, título/autor/keywords, materia/tipo/PDF, páginas de 50 |
| Autenticación  | Supabase Auth real, cookies HTTPOnly y Proxy de renovación                          |
| Autorización   | Verificación independiente servidor + membresía/sesión vigentes por RLS             |
| Administración | Formularios privados y endpoints con campos permitidos, límites y mismo origen      |
| Documentos     | Bucket privado, validación PDF, gateways de streaming y visor nativo                |
| Base           | Migraciones normalizadas, semilla 34 materias, revisión/permisos y auditoría        |
| Pruebas        | Node, producción HTTP, navegador y PostgreSQL real aislado; CI separado SQL         |

El catálogo selecciona Supabase al configurar coordenadas del proyecto. Conexión
parcial/fallida muestra error explícito; sin configuración se conserva modo demo.
El panel nunca utiliza persistencia local ni login fingido. Lectura pública usa
cliente anon sin cookies para evitar exposición de borradores a visitantes.
Cada ruta de archivos revalida permisos y mantiene la firma temporal en servidor.

Slugs y sección de obra permanecen estables. Los tipos específicos conservan
`/biblioteca/libros/[slug]`, `/biblioteca/jurisprudencia/[slug]` y
`/biblioteca/recursos/[slug]`. Nuevos slugs reales no requieren modificar código.
Materias sin contenido y fallas de conexión tienen estados explícitos.

SEO inicial con título/descripción, lang es-AR y noindex conservado hasta confirmar
contenido/dominio/despliegue. No se inventan ISBN, citas ni permisos. PDF.js
avanzado y SEO de producción siguen pendientes. No hay deployment remoto.

Caches separadas: `.next-admin` para desarrollo y `.next-production` para build.
No borrar caches de servidores vivos. Ninguna capa usa service-role; la operación
admin emplea JWT verificado del usuario y RLS. Documentación detallada y conexión
pendiente: BACKEND_ADMIN.md y VALIDACION_BACKEND.md.
