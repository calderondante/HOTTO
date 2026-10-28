# Despliegue y acceso del propietario

HOTTO requiere un hosting con runtime Node.js para Next.js App Router, Route
Handlers y Proxy (por ejemplo Vercel o un servidor Node con HTTPS). No es un
sitio exportable a HTML estático. El PR #4 conserva la misma base Supabase y
las ocho migraciones existentes; esta entrega no aplica migraciones.

## Variables del hosting

| Variable | Valor / uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS del proyecto Supabase existente, desde Connect |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key del mismo proyecto; se puede exponer al navegador |
| `HOTTO_DATA_SOURCE` | `supabase` |
| `HOTTO_SITE_ORIGIN` | Origen HTTPS definitivo exacto, sin rutas, query ni fragmento, por ejemplo `https://hotto.example` |
| `HOTTO_ADMIN_EMAILS` | Correos previamente autorizados, separados por comas. Para el propietario actual: `calderondante2004@gmail.com` |

Las tres últimas son variables del servidor. La lista de correos habilita el
envío del enlace; NO crea usuarios ni otorga membresía administrativa. El Auth
user debe existir y conservar membresía activa en `private.library_admins`.
No colocar en el hosting `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`,
`HOTTO_TEST_ADMIN_PASSWORD` ni una service-role key: no se requieren para operar
HOTTO. No copiar secretos de Cloud al repositorio. El antiguo secreto de prueba
de contraseña ya no se utiliza y puede retirarse de Codex Cloud.

Configurar variables antes del build; cambios en `NEXT_PUBLIC_*` requieren
reconstrucción. Node 24.x y pnpm 11.25.0 (fijados en package.json). Instalar con
`pnpm install --frozen-lockfile`, compilar con `pnpm build`, ejecutar con
`pnpm start --hostname 0.0.0.0 --port $PORT` (usar el puerto indicado por el
hosting). Vercel: framework Next.js, build `pnpm build`, directorio de salida
`.next-production` según next.config.ts. No ejecutar `db reset`, `db push` ni
semillas durante el despliegue. Preservar cuerpo/streaming de PDFs hasta 25 MiB:
verificar límites de carga del proveedor; algunos planes serverless tienen
límites menores y requieren un runtime Node con tamaño de request suficiente.

## Supabase Auth: configuración única por el propietario

En Authentication → URL Configuration del proyecto existente:

1. Site URL: el mismo origen HTTPS que `HOTTO_SITE_ORIGIN`.
2. Redirect URLs: agregar exactamente `https://DOMINIO/api/auth/callback`.
   Evitar comodines amplios y dominios de previews no controlados.
3. En Sign In / Providers mantener Email habilitado y desactivar el registro de
   nuevos usuarios (Allow new users to sign up). La solicitud de HOTTO también
   usa `shouldCreateUser: false`. No habilitar sign-in anónimo.
4. Email Templates → Magic Link: conservar un enlace `{{ .ConfirmationURL }}`.
   No reemplazarlo por una URL con tokens en el fragmento. El SDK SSR usa PKCE:
   Supabase redirige con `?code=...` y HOTTO lo canjea usando el verificador
   HTTPOnly del mismo navegador. No configurar un callback OTP/token_hash para
   esta implementación.
5. Configurar SMTP propio para entregar correos al propietario. El servicio
   predeterminado restringe destinatarios y tiene límites bajos. Elegir el
   proveedor y cargar sus credenciales solamente en Supabase; no se contrató ni
   configuró un servicio de correo desde esta entrega. Conservar límites de
   solicitudes y expiración; el valor típico es 60 s entre enlaces y 1 hora de
   vigencia. Abrir siempre el enlace más reciente.

Para desarrollo local, usar `HOTTO_SITE_ORIGIN=http://localhost:3000` y agregar
solo `http://localhost:3000/api/auth/callback` a Redirect URLs. No mezclar
localhost y 127.0.0.1. El navegador que solicita el enlace debe ser el que lo
abre: en móvil, abrir el link en ese navegador, no en el navegador integrado del
correo. Si falta el verificador, el enlace venció o se usó, HOTTO vuelve al login
con una explicación y permite solicitar otro. No registrar URLs del callback
con el parámetro code en analítica ni logs de acceso del hosting.

## Sesiones y autorización

El callback tiene destinos fijos, sin aceptar `next` externo; verifica el usuario
con `getUser()` y consulta `is_library_editor()` antes de entrar. Si falla, cierra
la sesión local. Cada página y operación administrativa vuelve a verificar
Auth y membresía real, con RLS como límite adicional. La lista de correos nunca
sustituye ese control. No existe alta pública ni login con contraseña en HOTTO.
Las cookies SSR son HTTPOnly, SameSite=Lax y Secure en HTTPS, y las respuestas
administrativas/callback son privadas sin caché. Proxy renueva las cookies de
sesión. En HTTP local se permite cookie sin Secure; en producción usar HTTPS.

## Prueba de aceptación con una sesión legítima (pendiente)

No publicar documentos ficticios. Realizar este circuito con un documento
original autorizado que el propietario quiera incorporar, preferentemente en
una instancia de validación aislada de la difusión pública:

| Paso | Resultado esperado |
| --- | --- |
| Solicitar enlace con correo no autorizado | Mensaje genérico; no se solicita correo ni se crea una cuenta |
| Solicitar y abrir enlace del propietario | Cookie SSR; `/admin` muestra la cuenta y sus documentos |
| Abrir enlace usado/vencido o en otro navegador | Regreso al login; ninguna operación protegida permitida |
| Registrar autor, fuente, licencia, obra y edición | Estado borrador, relaciones guardadas tras recargar |
| Asignar materias y subir PDF autorizado | Un solo archivo, metadatos e integridad, sin acceso público todavía |
| Completar evidencia/verificar permiso y pasar a revisión | La publicación sin permisos se rechaza |
| Publicar documento y obra revisados | Aparece en incógnito en buscador y ficha; PDF accesible |
| Despublicar y repetir desde incógnito | Desaparece del catálogo; gateway PDF rechaza la lectura pública |
| Cerrar sesión y consultar API administrativa | 401; sin posibilidad de mutar registros |
| Usuario Auth legítimo sin membresía / membresía revocada | 403, incluso con sesión Auth vigente |

Los fixtures de `tests/postgres/authorization.sql` ejercitan localmente permisos,
publicación y revocación sin documentos en el catálogo remoto. Ejecutar con
`pnpm test:postgres` (PostgreSQL nativo; no descargar Docker). `pnpm test` cubre
reglas del flujo Magic Link con dobles de prueba, no demuestra entrega de correo
ni autenticación real. El primer ingreso por correo y la publicación remota solo
pueden declararse aprobados tras ejecutar el circuito anterior.

Para repetir la regresión HTTP sin correos ni sesión, arrancar la aplicación
local con `HOTTO_SITE_ORIGIN=http://localhost:3120` y la lista de correos
configurada; luego ejecutar
`HOTTO_TEST_URL=http://localhost:3120 pnpm test:auth-http`.
El script solo prueba una dirección no autorizada y denegaciones; no autentica
al propietario ni publica documentos.

Resultados de esta entrega: [VALIDACION_MAGIC_LINK.md](VALIDACION_MAGIC_LINK.md).
