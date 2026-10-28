# Etapa 6: OTP y bibliografía constitucional

## Acceso por código

La UI utiliza `signInWithOtp({ options: { shouldCreateUser: false } })` y
`verifyOtp({ email, token, type: "email" })` en el servidor. El correo debe
estar en `HOTTO_ADMIN_EMAILS`; después de verificar el código se consulta Auth
y `is_library_editor()`. Los permisos administrativos y RLS no cambian.
El propietario no necesita contraseña. Las cookies SSR siguen siendo HTTPOnly,
SameSite=Lax y Secure sobre HTTPS. No se registran códigos ni sesiones.

El formulario acepta seis dígitos, conserva ceros iniciales, ofrece «Ya tengo
un código», separa solicitud y verificación y espera antes de reenviar. Mensajes
específicos para código vencido/incorrecto y límites 429. La protección adicional
en el proceso de Next limita el envío a una vez por minuto y cinco verificaciones
por correo cada diez minutos; no se reinicia al reenviar. Esa memoria es acotada,
se pierde al reiniciar y no se comparte entre réplicas. Supabase mantiene los
límites centrales; no se afirma que este control local sea distribuido. Al
escalar, usar un almacén compartido de límites además de las cuotas de Auth.

## Transición segura de la plantilla

Al consultar Auth, la configuración real todavía tenía ocho dígitos, una hora
de vigencia, plantilla con ConfirmationURL, signup habilitado y ningún SMTP
propio. La interfaz pública seguía siendo Magic Link. Cambiar a correo sin enlace
antes de desplegar esta UI dejaría al propietario sin el acceso actual.

Se preparó `supabase/templates/email-otp.html` con `{{ .Token }}` y el script
`pnpm auth:configure-otp`. Por defecto solo consulta; no envía correos ni cambia
Auth. Tras revisar, integrar y desplegar este PR, ejecutar en Codex Cloud con
las credenciales de gestión ya inyectadas:

```
source scripts/tool-env.sh
bash scripts/pnpm.sh auth:configure-otp --apply
```

El script comprueba que `https://hotto-six.vercel.app/admin/login` ya sea la UI
OTP y que exista `/api/auth/verify` antes de cambiar la plantilla. Aplica seis
dígitos, 600 s de vigencia y signup deshabilitado, y comprueba el resultado.
No modifica usuarios ni membresías. La expiración de correo es una configuración
compartida de Supabase y también afecta a sus otros enlaces de correo.

Alternativa exacta desde Dashboard del proyecto `trkoraszozabtywkfvin`:
Authentication → Email Templates → Magic Link: pegar la plantilla preparada;
Sign In / Providers → Email: OTP length 6, OTP expiration 600; desactivar Allow
new users to sign up. Conservar Email habilitado. Configurar SMTP propio allí
para superar las restricciones del servicio predeterminado. OTP no elimina las
cuotas ni los HTTP 429; no se contrató ni configuró un proveedor de pago.

Hosting: mantener las cinco variables de `LANZAMIENTO.md`; fijar
`HOTTO_SITE_ORIGIN=https://hotto-six.vercel.app` para ese dominio. El callback
anterior permanece para enlaces ya emitidos, pero el nuevo ingreso por código
no depende del mismo navegador ni de URLs de retorno. Nunca colocar el token
de gestión ni contraseñas de base en Vercel.

## Investigación e inventario

Por indicación del propietario, las materias se trabajan genéricamente, sin
comisiones ni docentes. Se accedió a la carpeta compartida y a las carpetas
Constitucional I, Constitucional II y sus materiales anidados. El archivo RAR
específico de Constitucional II se inspeccionó para buscar un programa: contiene
material bibliográfico, no un programa. No se descargaron masivamente PDFs ni
se copiaron libros o sentencias al repositorio/Storage.

La página oficial del plan de UNLaM
https://derecho.unlam.edu.ar/index.php?seccion=3&idArticulo=386 confirma los
códigos 02304 y 02314. No ofrece programas analíticos en esa página. No se
localizó un programa completo verificable para ninguna de las dos materias;
no se inventaron unidades, versiones, docentes ni obligatoriedad académica.

`data/research/constitutional-cases.json` conserva referencias documentadas a
las lecturas de la carpeta, con sus URLs de Drive y fechas de notas cuando
constan. Giroldi aparece en dos PDFs y se normalizó a un único registro. Hooft
está relacionado con ambas materias. «ATE» y «Martín» no identifican una sentencia
unívoca; se dejan sin completar. La nota de debido proceso llama «Duarte» a un
link CIJ que corresponde a P., S. M. y otro y solo cita Duarte: se marcó la
discrepancia, sin atribuirle ese PDF.

Solo se marcan cotejadas las fuentes donde se pudo comprobar carátula, fecha e
identificador. El inventario es un archivo de investigación en borrador, no
registros guardados ni publicados en Supabase. `/admin/inventario` y su descarga
JSON requieren una sesión administrativa. `pnpm inventory:prepare` produce
paquetes locales para incorporar como borrador mediante las APIs existentes,
resolviendo materias por código y sin usar SQL privilegiado. No ejecuta escrituras.
Las verificaciones de enlace y permisos siguen pendientes de confirmación en el
panel antes de publicar. El nivel A no genera páginas SEO de análisis vacío.

Las páginas de Constitucional I y II ya agrupan por tema los fallos que el RPC
público devuelva como publicados. No usan el inventario como catálogo alternativo.
La agrupación es temática, no una atribución a unidades académicas oficiales.

## Método para otras materias

1. Registrar la fuente académica real, distinguiendo programa, nota de lectura
   y recopilación. Desconocidos se mantienen nulos.
2. Extraer las denominaciones exactas y conservar referencias a la fuente.
3. Desambiguar por carátula, tribunal, fecha e identificador; fusionar relaciones
   de un mismo fallo a varias materias.
4. Localizar fuente oficial específica, abrir el documento y cotejar su texto;
   distinguir fecha del dictamen de fecha del fallo y registrar comprobación.
5. Preparar borrador A con documento externo y procedencia; no almacenar PDF ni
   atribuir licencias de redistribución.
6. Un administrador revisa fuente, metadatos y permisos y publica mediante los
   controles existentes. Los análisis B/C requieren revisión propia.

No se ejecutó una sesión OTP real ni una publicación remota. Se evita consumir
la cuota con correos de prueba; la aceptación real requiere desplegar la UI,
activar la plantilla y que el propietario ingrese personalmente su código.

## Resultado de validación

Consulta de solo lectura: ocho migraciones remotas, 34 materias, cero obras y
una membresía activa del propietario. Se deshabilitó el registro público en Auth mediante un PATCH acotado y
se comprobó su persistencia. No hubo escrituras de documentos, migraciones,
importaciones ni publicaciones. Inventario: 21 referencias para I y 19 para II, 39 únicas;
8 y 6 sentencias cotejadas respectivamente (13 únicas por Hooft compartido).
Los 13 paquetes están preparados como borrador; las otras 26 referencias aún
necesitan completar fuentes/datos. Cero programas completos confirmados.
Ver [tabla de enlaces y pendientes](../data/research/README.md).

TypeScript, ESLint, 29 pruebas Node, build y smoke de 51 páginas aprobados.
PostgreSQL 17.11 nativo local pasó RLS, publicación, permisos, revocación y
Storage/jurisprudencia en una base efímera; no se ejecutaron migraciones remotas.
Pruebas HTTP contra producción local: rechazo de OTP/callback inválidos, CSRF,
mutaciones/cargas sin sesión y descarga privada del inventario sin sesión.
Chromium móvil: código de seis dígitos con cero inicial, error de cuenta no
autorizada, espera de reenvío y sin desborde a 390 y 320 px; axe: 0 violaciones,
0 incompletos. Next MCP: sin incidencias de compilación/configuración/runtime.
No se probó hardware móvil, entrega real de OTP, sesión real ni publicación remota.
[Captura móvil](../design/previews/admin-otp-mobile.png).

El registro público ya quedó deshabilitado en Auth. La plantilla y la longitud
actual de ocho dígitos no se modificaron, para preservar el Magic Link vigente
hasta el despliegue OTP. No se envió correo ni se consumió cuota con este ajuste.
