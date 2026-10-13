# HOTTO

Bootstrap de desarrollo de una plataforma para la comunidad jurídica argentina.
La biblioteca será el producto principal. Este repositorio prepara el entorno:
solo hay una pantalla técnica mínima, sin catálogo, cuentas ni administración.

## Reconstrucción

Requisitos: Node.js 24.19+ de la rama 24 LTS, npm, Git y Bash. La versión de pnpm
está fijada en `package.json`; los scripts usan esa versión sin instalación global.

```bash
bash scripts/setup-cloud.sh
bash scripts/verify-setup.sh
bash scripts/pnpm.sh dev --hostname 127.0.0.1 --port 3000
```

`setup-cloud.sh` instala con `--frozen-lockfile`, valida las skills versionadas y
prepara los tipos de Next.js. Es idempotente y no regenera skills ni configura
servicios remotos. `verify-setup.sh` comprueba integridad, descubrimiento de skills,
TypeScript, ESLint, build y una respuesta funcional del servidor de producción.
La comprobación HTTP usa un puerto libre y termina su propio servidor.

Si ya usás el pnpm fijado, `pnpm dev`, `pnpm typecheck`, `pnpm lint` y `pnpm build`
funcionan directamente. En Codex Cloud conviene el wrapper `scripts/pnpm.sh`,
que mantiene las cachés en `.cache/` y conserva las credenciales existentes.

## Supabase y secretos

No se requieren credenciales para instalar, compilar o ver la pantalla inicial.
`.env.example` declara las variables públicas para una integración futura; no
contiene valores. Crear `.env.local` cuando exista un proyecto autorizado y
mantenerlo fuera de Git. Nunca exponer claves privilegiadas en `NEXT_PUBLIC_*`.

La configuración local está en `supabase/config.toml` (PostgreSQL 17, Auth y
Storage). Docker es necesario solo para arrancar ese stack:

```bash
bash scripts/supabase.sh start
bash scripts/supabase.sh db query --local 'select current_database(), version();'
bash scripts/supabase.sh stop
```

`supabase status` y `start` pueden imprimir claves locales: no copiar su salida
a documentación ni commits. No hay buckets, tablas o migraciones de producto.
No ejecutar `db reset`, `link`, `db push` ni despliegues remotos sin revisar su alcance.

## Codex Cloud

Install Script: `cd /workspace/HOTTO && bash scripts/setup-cloud.sh`.
Las instrucciones de Start Skill se describen en [docs/ENTORNO.md](docs/ENTORNO.md).
Cada tarea ya está aislada: usar este checkout, sin crear worktrees salvo pedido
explícito. Los procesos deben arrancarse en cada sesión; no forman parte de la
persistencia de Git ni del snapshot de dependencias.

## Guías

- [AGENTS.md](AGENTS.md): reglas para agentes y verificación.
- [Producto](docs/PRODUCTO.md), [arquitectura](docs/ARQUITECTURA.md),
  [datos](docs/BASE_DE_DATOS.md) y [roadmap](docs/ROADMAP.md).
- [Diseño](docs/DISENO.md), [skills](docs/SKILLS.md) y [decisiones](docs/DECISIONES.md).
- [Entorno y límites de validación](docs/ENTORNO.md).

El proyecto es compatible con el flujo estándar de Next.js en Vercel. No se ha
creado un proyecto remoto ni realizado ningún despliegue.
