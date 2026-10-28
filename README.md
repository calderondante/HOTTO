# HOTTO

Comunidad jurídica y biblioteca digital: 34 materias, búsqueda, filtros y fichas.
Backend documental y panel privado en `/admin`, con Supabase Auth, RLS, ediciones,
PDF privado, fuentes, permisos y revisión/publicación. Requiere conectar un
proyecto Supabase para administrar; no ofrece autenticación simulada.

Sin conexión funciona la demostración existente. `/biblioteca/demo` conserva los
13 ejemplos y dos PDF originales fuera del catálogo definitivo.

## Reconstrucción

Node.js 24.19+ de la rama 24 LTS, npm, Git y Bash; pnpm fijado en package.json.

```bash
bash scripts/setup-cloud.sh
bash scripts/verify-setup.sh
HOTTO_BUILD_DIR=.next-mvp bash scripts/pnpm.sh dev --hostname 127.0.0.1 --port 3000
```

Setup usa frozen-lockfile, conserva las 19 skills versionadas y no crea servicios
remotos. Verify comprueba integridad, descubrimiento de skills, dataset/búsqueda,
TypeScript, ESLint, build y 51 páginas de producción, filtros y PDF. Build/start
usan `.next-production`, separado del desarrollo; el smoke termina su propio
servidor y no toca otros procesos. No borrar caches de servidores vivos.

La comprobación de interfaz con Chromium y servidor iniciado es:

```bash
HOTTO_TEST_URL=http://127.0.0.1:3000 node scripts/browser-mvp.mjs
```

En el contenedor observado, Chromium requiere `AGENT_BROWSER_ARGS='--no-sandbox'`;
en una máquina con sandbox de navegador funcional, omitirlo. El wrapper conserva
el perfil y caches dentro del checkout, sin cambiar HOME. Browser checks requieren
Chromium; CI ejecuta pruebas de datos y smoke HTTP, no simula un navegador.

## Rutas

`/`, `/biblioteca`, `/biblioteca/materias`, `/biblioteca/materias/[slug]`,
`/biblioteca/libros/[slug]`, `/biblioteca/jurisprudencia`,
`/biblioteca/jurisprudencia/[slug]` y `/biblioteca/recursos/[slug]`.
Las URLs del catálogo conservan filtros; los slugs inexistentes devuelven 404.
El MVP conserva noindex por incluir contenido ficticio y no tener dominio final.

## Datos y límites

Los nombres/códigos de 34 materias se cotejaron entre dos fuentes secundarias.
El cotejo institucional de Drive/UNLaM sigue pendiente por bloqueo de red.
No se descargó ni distribuyó documentación de esa carpeta. No atribuir carácter
oficial a los recursos de demostración: [fuentes](docs/DATOS_Y_FUENTES.md).

El adaptador consulta Supabase cuando se configura el proyecto; conexión parcial
o fallida produce un error explícito. Migraciones y RLS fueron ejecutadas en
PostgreSQL 17.11 nativo de pruebas, con esquemas mínimos de plataforma. No hay
Supabase remoto conectado ni pruebas integradas de Auth/Storage HTTP. No se
arrancó el stack Docker pesado. `.env.example` conserva valores vacíos.

Ver [administración y conexión](docs/BACKEND_ADMIN.md) y
[validación del backend](docs/VALIDACION_BACKEND.md).
`bash scripts/pnpm.sh test:postgres` requiere PostgreSQL nativo o la base efímera
loopback documentada; CI dispone de un trabajo PostgreSQL separado.

## Documentación

[Validación MVP](docs/VALIDACION_MVP.md), [diseño](docs/DISENO.md),
[arquitectura](docs/ARQUITECTURA.md), [datos](docs/BASE_DE_DATOS.md),
[entorno cloud](docs/ENTORNO.md), [skills](docs/SKILLS.md),
[roadmap](docs/ROADMAP.md) y [AGENTS.md](AGENTS.md).
La validación histórica del bootstrap está en docs/VALIDACION.md.
No se ha desplegado un sitio ni creado una base remota.

Despliegue y acceso administrativo por Magic Link: [guía de lanzamiento](docs/LANZAMIENTO.md).
