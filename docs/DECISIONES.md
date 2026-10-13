# Decisiones

| Decisión aceptada para el bootstrap | Motivo |
| --- | --- |
| Next.js estable 16.4.0, React 19.3.0, App Router | Template oficial y dependencias compatibles verificadas |
| Node 24 LTS, versión de referencia 24.19.0 | Compatible con Next.js, CLI skills y PDF.js actuales |
| pnpm 11.25.0 fijado | Herramienta disponible; lockfile y wrapper reproducibles |
| TypeScript estricto 5.9.3 | Versión estable del template oficial, sin actualización innecesaria |
| ESLint 9.39.5 | Los plugins import, jsx-a11y y react aún declaran peers hasta ESLint 9; 10 produce incompatibilidades |
| Tailwind 4.3.3 y shadcn/ui mínimo | Adaptador Turbopack oficial, tokens y aliases; componentes bajo demanda |
| Instalación manual oficial de shadcn | Registro bloqueado por política de red; instrucciones accesibles desde su GitHub oficial |
| Supabase CLI local y PostgreSQL 17 configurado | No requiere crear un proyecto remoto ni solicitar claves en esta fase |
| PDF.js instalado sin lector | Prepara la dependencia sin construir funcionalidad fuera de alcance |
| Skills copiadas y versionadas | Codex las descubre en `.agents/skills`; no hay enlaces a temporales |
| Cachés y estado dentro de `.cache` | El HOME de esta máquina es de solo lectura; no se altera ni se extraen credenciales |
| Pantalla mínima sin indexación | Permite validar el runtime sin presentar un sitio institucional terminado |

ESLint 9 emite un aviso de fin de soporte. Mantenerlo es una decisión de
compatibilidad, no una recomendación permanente: revisar la actualización cuando
Next.js y sus plugins admitan una versión mantenida sin romper los peers.

Pendiente: listado curricular validado, permisos documentales, identidad visual,
esquema editorial, modelo de roles, búsqueda, hosting y proyecto Supabase remoto.
No se implementaron políticas RLS porque todavía no se creó ninguna tabla de
producto; son un requisito de la fase de datos.
