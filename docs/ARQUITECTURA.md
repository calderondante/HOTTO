# Arquitectura del MVP

Una aplicación Next.js 16.4 App Router, React 19.3 y TypeScript estricto. Servidor
por defecto; búsqueda, filtros, controles Base UI y menú forman los límites
cliente. Supabase y PDF.js están instalados desde el bootstrap pero no se importan
en el catálogo ni se simula una conexión. No se necesitan credenciales para el MVP.

| Capa | Implementación |
| --- | --- |
| Rutas | Inicio, biblioteca, materias, libros, jurisprudencia y recursos complementarios |
| Dataset | `src/lib/library/{subjects,data,types}.ts`, versionado y con procedencia explícita |
| Repositorio | `repository.ts`, lectura local de recursos publicados, relaciones N:M y archivos con licencia |
| Búsqueda | `query.ts`, normalización de acentos/case, términos AND, título/autor/palabras clave |
| Estado | Filtros instantáneos y URL mediante History API de Next; formulario GET para SSR y recarga |
| UI | Tokens Tailwind, componentes shadcn Base UI y CSS institucional |
| Documentos | Dos PDF originales de una página; enlaces reales de apertura y descarga, sin visor falso |
| Base futura | Migración normalizada y RLS preparada, sin ejecución PostgreSQL |

Los slugs son estables y las páginas inválidas devuelven 404. Los recursos
legislativos, programas y complementos tienen `/biblioteca/recursos/[slug]` para
que todas las tarjetas tengan una ficha propia. Los libros y casos tienen sus
secciones específicas. Cada materia organiza cinco categorías; 32 materias sin
recursos muestran un estado vacío con acceso a los pilotos.

Título y descripción por página, lang `es-AR`, viewport y color de tema.
Se conserva `noindex, nofollow` porque esta entrega contiene autores y fallos
ficticios. No se inventan dominio canónico, ISBN, citas judiciales ni permisos.
Al publicar contenido real: revisar robots, canonical, sitemap y Open Graph con
el dominio confirmado. No hay deployment ni panel editorial en esta entrega.

`HOTTO_BUILD_DIR` separa caches: desarrollo `.next-mvp`, producción
`.next-production`. El build no borra una cache de un servidor vivo. No activar
Cache Components o servicios nuevos sin una necesidad concreta.
