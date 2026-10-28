# Administración sin contraseña: validación de lanzamiento

27/10/2026 (Buenos Aires), continuación del PR #4.

La consulta de solo lectura al proyecto Supabase existente confirmó ocho
migraciones, 34 materias, cero obras y una cuenta del propietario con correo
confirmado y membresía activa. No se ejecutaron migraciones ni se cambiaron
cuentas, permisos o configuración remota.

El login ahora solicita Magic Link por Supabase SSR/PKCE. Solo los correos de
`HOTTO_ADMIN_EMAILS` pueden provocar una solicitud de envío; la respuesta al
visitante es genérica. `shouldCreateUser: false` impide alta automática. La lista
no concede permisos: el callback verifica usuario y membresía activa vía RPC;
las páginas y APIs conservan `requireAdmin()` y RLS. No se aceptan destinos
`next` suministrados por el visitante. El código de Auth se retira de la URL al
redirigir a un destino fijo. Se conservaron cookies HTTPOnly/Lax, renovación en
Proxy y respuestas privadas sin caché; Secure se calcula por el origen de HOTTO,
para permitir pruebas HTTP locales sin confundirlas con el HTTPS de Supabase.

## Evidencia ejecutada

- 24 pruebas Node: incluye envío restringido, prohibición de crear cuentas,
  callback con código rechazado, permisos revocados/fallo de RPC, destinos y
  atributos de cookies. Incluye el SDK SSR instalado con transporte interceptado para comprobar PKCE y cookie verificadora HTTPOnly/Secure/Lax. Estos casos usan dobles para Auth; no son login real.
- TypeScript, ESLint y build de producción; smoke de 51 páginas, 34 materias,
  13 fichas de demostración, filtros, SEO y dos PDF originales.
- PostgreSQL 17.11 nativo local: esquema, 34 materias, RLS, permisos de
  distribución, revisión, publicación, revocación, Storage y jurisprudencia.
  Solo base efímera local; no se repitieron migraciones remotas.
- `scripts/test-auth-http.mjs` contra desarrollo y producción locales conectados
  al Supabase existente: solicitud de correo no autorizado, datos inválidos,
  CSRF, callback sin código/con código rechazado y `next` externo, redirección
  de `/admin`, rechazo 401 en consultas, mutaciones y upload sin sesión.
  Ninguna solicitud se hizo con un correo autorizado, por lo que no envió email.
- Chromium a 390 × 844: formulario con etiqueta, botón y respuesta genérica tras
  enviar correo no autorizado, sin campo de contraseña ni desborde horizontal.
  Axe en producción: 0 violaciones, 0 incompletos. No hubo teléfono físico.
  [Captura](../design/previews/admin-magic-link-mobile.png).
- Next MCP de desarrollo: `get_compilation_issues` sin incidencias y
  `get_errors` sin errores de configuración/sesión.

El primer build detectó avisos de seguridad publicados para Next 16.4.0
(GHSA-p3m5-59mp-jv5r, GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr).
Se actualizaron Next y eslint-config-next a 16.4.3 con lockfile fijado. La
consulta del registro npm para Next 16.4.3 devolvió cero avisos en ese momento,
y el build posterior aprobó. Esto no equivale a una auditoría de todas las
posibles dependencias o vulnerabilidades futuras.

## Pendiente antes de operar públicamente

La configuración remota observada conserva Site URL `http://localhost:3000`,
Redirect URLs vacías, SMTP propio ausente y signup global habilitado. El
propietario debe ajustar esos campos para el dominio definitivo siguiendo
[LANZAMIENTO.md](LANZAMIENTO.md). HOTTO sí desactiva el alta en cada solicitud.
No se envió un Magic Link real ni se obtuvo una sesión de administrador en esta
entrega. No se probaron cookies con una sesión real, entrega de correo, refresh
con token real ni la primera publicación/lectura/despublicación remotas.
Los formularios privados requieren esa sesión para validar su interacción real.
El circuito de aceptación está preparado en la guía de lanzamiento, con un
recurso original autorizado; no se cargaron documentos ficticios.
