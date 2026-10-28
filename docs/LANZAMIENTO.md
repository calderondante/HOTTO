# Lanzamiento y administración de HOTTO

Guía vigente para la Etapa 6 (OTP). El PR #4 ya fue integrado a main; la nueva
entrega se prepara en una rama independiente y requiere revisión/despliegue.

## Hosting y variables

Usar un hosting con Next.js App Router, Route Handlers, Proxy y Node.js 24.x.
No usar exportación HTML estática. El servidor debe admitir cargas PDF de
hasta 25 MiB; verificar los límites del proveedor (varios planes serverless
admiten menos). No se contrató infraestructura ni SMTP desde esta entrega.

Instalación: `pnpm install --frozen-lockfile` con pnpm 11.25.0.
Build: `pnpm build`. Inicio: `pnpm start --hostname 0.0.0.0 --port $PORT`, usando
el puerto del hosting. Next usa `.next-production` según next.config.ts.
No ejecutar reset, migraciones ni semillas al desplegar: las ocho migraciones
remotas ya existen y las 34 materias deben conservarse.

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS del proyecto existente `trkoraszozabtywkfvin` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key del mismo proyecto |
| `HOTTO_DATA_SOURCE` | `supabase` |
| `HOTTO_SITE_ORIGIN` | `https://hotto-six.vercel.app`, si ese es el dominio utilizado; sin ruta ni query |
| `HOTTO_ADMIN_EMAILS` | `calderondante2004@gmail.com`; más correos solo cuando ya estén autorizados |

Las últimas tres son del servidor. La lista habilita solicitudes de correo,
pero no crea usuarios ni concede derechos. El usuario Auth debe existir y tener
membresía activa en `private.library_admins`. No colocar en Vercel service-role,
contraseña de base, token de gestión ni `HOTTO_TEST_ADMIN_PASSWORD`: la aplicación
no los necesita. Cambiar `NEXT_PUBLIC_*` requiere un nuevo build.

## Activación de OTP después de desplegar la UI

El correo debe contener un código, no solo un Magic Link. La configuración remota
observada seguía con plantilla de enlace y ocho dígitos. No cambiarla antes de
desplegar esta interfaz, para conservar el acceso de la versión anterior.

Con la UI de este PR desplegada, desde Codex Cloud y sus credenciales de gestión
ya inyectadas:

```
source scripts/tool-env.sh
bash scripts/pnpm.sh auth:configure-otp --apply
```

Sin `--apply`, el comando solo consulta. Con esa opción comprueba la versión
pública y aplica la plantilla versionada, seis dígitos, vigencia de diez minutos
y signup deshabilitado. No envía emails ni modifica administradores.

Desde Supabase Dashboard, la alternativa es:

1. Authentication → Email Templates → Magic Link: usar el contenido de
   `supabase/templates/email-otp.html`, con `{{ .Token }}`.
2. Sign In / Providers → Email: habilitado, OTP length 6 y OTP expiration 600.
   Desactivar Allow new users to sign up. No habilitar usuarios anónimos.
3. Configurar SMTP propio para entrega al propietario y límites adecuados.
   Cambiar a OTP no elimina las cuotas ni los errores 429 del proveedor.
4. Site URL: origen definitivo del sitio. OTP no depende de redirect URLs ni
   de abrir el correo en el mismo navegador. El callback anterior se conserva
   para enlaces ya emitidos; mantener solo su redirect exacto si se necesita,
   evitando comodines amplios de dominios no controlados.

El cambio de expiración de email afecta también a otros enlaces de Auth del
mismo proyecto. No cargar credenciales SMTP en Git ni en el chat.

## Uso y prueba real del propietario

Entrar a `/admin/login`, escribir el correo habilitado y solicitar el código.
Ingresar los seis dígitos recibidos; se puede leer el correo en otro dispositivo.
«Ya tengo un código» permite verificar uno recibido sin gastar otro envío.
Esperar antes de reenviar y usar el código más reciente. No compartirlo por chat.

El servidor verifica el código en Supabase y la membresía administrativa. Las
cookies son HTTPOnly, SameSite=Lax y Secure en HTTPS; Proxy renueva la sesión.
Páginas/APIs vuelven a comprobar permisos y RLS. No hay alta pública. Los límites
adicionales de HOTTO son por instancia; las cuotas centrales siguen en Supabase.
Ver las limitaciones exactas en [Etapa 6](ETAPA6_OTP_Y_JURISPRUDENCIA.md).

Aceptación real pendiente:

| Paso | Resultado esperado |
| --- | --- |
| OTP correcto con cuenta habilitada | Ingreso y sesión conservada al recargar `/admin` |
| Código incorrecto/vencido/usado | Error comprensible, sin acceso administrativo |
| Esperar/reintentar ante 429 | Sin reenvíos automáticos ni bucles de correos |
| Usuario sin membresía / revocada | Acceso administrativo rechazado |
| Cerrar sesión | API privada devuelve 401 |
| Registrar documento original autorizado | Borrador conservado tras recargar |
| Verificar procedencia/licencia y pasar por revisión | Rechazo de publicación sin requisitos |
| Publicar recurso autorizado | Consulta desde incógnito y lectura/enlace correctos |
| Despublicar | Desaparece del catálogo y se revoca el gateway público PDF |

Para el inventario constitucional: `/admin/inventario` contiene referencias
locales para revisión, no obras de Supabase. `pnpm inventory:prepare` genera
paquetes de borrador sin ejecutar escrituras. Incorporar únicamente con sesión
legítima, resolver materias existentes por código y confirmar permisos/fuentes.
Los estudios jurídicos B/C requieren análisis revisado; el piloto es nivel A.

Para pruebas sin sesión: servidor local con las variables de arriba y un origen
HTTP local coherente (por ejemplo `http://localhost:3131`), luego
`HOTTO_TEST_URL=http://localhost:3131 pnpm test:auth-http`. No solicita correo
para una cuenta autorizada ni publica documentos. `pnpm test:postgres` usa una
base local efímera y PostgreSQL nativo, sin Docker pesado. Estas pruebas no
sustituyen el primer ingreso OTP ni una publicación remota real.
