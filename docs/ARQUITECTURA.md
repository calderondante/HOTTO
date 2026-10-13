# Arquitectura inicial

Una aplicación Next.js con App Router, React y TypeScript estricto. Tailwind CSS
4 y shadcn/ui aportan el sistema de estilos; los componentes se agregarán por
necesidad. Server Components por defecto, con límites de cliente pequeños para
interacciones. No hay páginas institucionales ni funciones editoriales todavía.

| Capa | Base preparada | Trabajo posterior |
| --- | --- | --- |
| Web | Next.js, `src/app`, layout español, pantalla mínima | Navegación, fichas, metadata permanente y SEO |
| UI | Tokens semánticos, `components.json`, helper `cn` | Componentes accesibles, sin instalar todo el catálogo |
| Datos | SDK Supabase, integración SSR instalada, CLI y config local | Clientes por contexto, tipos generados, consultas y RLS |
| Auth | Servicio previsto en config local, registro deshabilitado | Sesiones verificadas en servidor, roles administrativos |
| Documentos | PDF.js instalado, sin importar en el bundle inicial | Worker local, carga diferida, autorizaciones y Range requests |
| Validación | Scripts de integridad, lint, tipos, build y smoke | Pruebas de producto y políticas SQL cuando haya funcionalidades |

Supabase PostgreSQL almacenará los metadatos; Storage tendrá buckets privados
por defecto. La lectura pública será una decisión por documento. Auth se
reservará inicialmente al flujo editorial; no habrá cuentas obligatorias para
consultar contenido público. No hay autenticación simulada.

Estructura: `src/app` para rutas, `src/components` para UI, `src/lib` para
utilidades e integraciones, `supabase` para configuración y futuras migraciones,
`docs` para decisiones, `design` para referencias autorizadas y `.agents/skills`
para instrucciones locales. `public` admite solo recursos realmente públicos.

Las dependencias directas están fijadas y `pnpm-lock.yaml` resuelve las
transitivas con integridad. Las herramientas de agentes son dependencias de
desarrollo. PDF.js y Supabase no se importan en la pantalla mínima.

Para Vercel se usará el runtime Node.js 24 y las convenciones estándar del
framework. No hace falta un `vercel.json` vacío ni un proyecto remoto ahora.
No se activan Cache Components, Partial Prefetching o React Compiler antes de
una necesidad concreta. Turbopack usa el adaptador Tailwind del template oficial.
