# Fase 4 — Supabase real y jurisprudencia híbrida (16/10/2026)

## Entorno y consolidación

El PR #3 pasó los checks de GitHub y se fusionó normalmente en `main` (merge
`f48bdd17c5a05ec7ed867e52517c2cc3d6a6397c`). Esta fase parte de esa
revisión en `feature/hotto-supabase-live`. El proyecto autorizado es
`trkoraszozabtywkfvin`, sa-east-1, PostgreSQL 17.11. Antes de modificarlo se
confirmó que tenía una cuenta Auth preexistente, ninguna tabla de aplicación,
ningún objeto Storage y ningún historial de migraciones. Las variables Cloud
coinciden con la URL/ID especificados; sus valores secretos nunca se registraron.

Las siete migraciones versionadas están aplicadas, incluidas las 34 materias, y
`supabase_migrations.schema_migrations` tiene siete entradas cuyo SQL almacenado
coincide byte a byte con los archivos locales. Hay 15 tablas públicas, todas con
RLS; `library-private` es un bucket privado con MIME PDF y tamaño máximo de
25 MiB. Se generaron tipos reales del esquema remoto en
`src/lib/library/database.generated.ts`; los clientes Supabase los utilizan.

La CLI no logró abrir el puerto PostgreSQL TCP de Supabase desde este Cloud
(`ECONNREFUSED`), aunque las credenciales y el proyecto sí funcionan. Cada
migración se ensayó con `begin ... rollback` y se ejecutó por la API HTTPS de la
CLI (`supabase db query --linked --project-ref ... --file ...`). El historial se
registró mediante SQL con el mismo mecanismo, sin reset ni forzar versiones.
Para futuras migraciones, probar primero en PostgreSQL 17 y repetir este flujo
solo después de confirmar el project-ref, el historial y la ausencia de datos
ajenos; no usar `db push` hasta que exista conectividad TCP.

La cuenta Auth existente `calderondante2004@gmail.com` tiene correo confirmado
y es la única fila activa de `private.library_admins`. No se cambió contraseña
ni se generó una sesión. El ingreso real y la publicación/despublicación desde
el panel requieren que la persona titular introduzca su contraseña mediante
un canal seguro. La autorización se comprueba en servidor, RLS y Storage; las
pruebas locales cubren revocación de membresía y sesión.

## Jurisprudencia

Un fallo es una `work` de tipo `jurisprudence` con una fila judicial, materias
N:M y al menos un `document` externo cuyo URL coincide con `official_url`.
Para publicar se exigen identificador judicial, tribunal, jurisdicción,
expediente, fecha, tema, fuente oficial publicada, verificación registrada del
enlace, documento revisado y permiso de lectura verificado. No se requiere PDF
ni se atribuyen derechos de distribución a la sentencia oficial. Los índices
únicos de URL y `(tribunal, identificador)` previenen duplicados comunes.
Una referencia secundaria publicada no hace visible el fallo si el documento
oficial coincidente está en borrador o pierde su permiso.

El RPC `search_jurisprudence` pagina de a 30 y filtra texto por carátula,
tema, tribunal, sala, expediente, identificador y keywords, además de materia,
tribunal, año y jurisdicción. Solo entrega filas visibles por RLS y con
documento oficial publicable. La tarjeta lleva directamente a la sentencia en
otra pestaña, marcada como externa. Si hay ficha editorial B o C ofrece un
segundo enlace interno. El nivel A carece de página propia pública; la ruta
dinámica da 404. El nivel B tiene página con `noindex`. El nivel C requiere
análisis original completo, transición por revisión, aprobación de un
administrador activo con autor y fecha registrados, y obra republicada tras
el cambio. Editar el análisis revoca aprobación, degrada C a B y devuelve la
obra a borrador.

El SEO permanece cerrado hasta establecer `HOTTO_SITE_ORIGIN` con el dominio
HTTPS público confirmado. Solo entonces las fichas C publicadas reciben
`index`, canonical, Open Graph y `ScholarlyArticle` del análisis editorial; el
sitemap dinámico incluye exclusivamente esas fichas visibles por RLS y la
entrada de jurisprudencia. Los filtros de búsqueda quedan `noindex`. El
contenido de fichas se renderiza en servidor y no se generan miles de páginas
estáticas en el build. No se ha configurado Search Console ni medido ranking.

El panel permite editar los metadatos judiciales, registrar la verificación
manual de la URL y escribir problema, hechos, decisión, fundamentos, relevancia
y normativa. Un formulario separado cambia estado del análisis y nivel SEO;
la base impide saltar directamente a C. En el ingreso se crea el documento
externo y después se completan fuente, licencia de referencia, materias,
permiso de lectura y revisión antes de publicar. Guardar la ficha puede
despublicar la obra para forzar una nueva revisión. La ruta para miles de
fallos será: obtener metadatos de una fuente permitida → normalizar → detectar
duplicados → clasificar → verificar URL → revisar registro → publicar A →
redactar/revisar análisis → aprobar C. No hay scraper, importación masiva ni
publicación automática de análisis IA.

## Evidencia y pendientes

- PostgreSQL 17.11 nativo y desechable: siete migraciones desde cero, semilla,
  contrato de tipos, RLS, permisos, Storage, revocación y secuencia A/B/C;
  `bash scripts/test-postgres.sh` aprobado. Los fixtures se revierten y nunca
  se aplicaron a Supabase alojado.
- HTTP de Supabase real con publishable key: 34 materias y búsqueda judicial
  vacía; escritura anónima en jurisprudencia, carga anónima en Storage y lectura
  de objeto privado rechazadas. El catálogo remoto tiene cero documentos.
- TypeScript, ESLint, build y pruebas Node ejecutados. Navegador Chromium en
  escritorio y móvil: búsqueda judicial vacía, filtros, navegación y redirección
  de `/admin` a login. Capturas del estado remoto vacío:
  `design/previews/jurisprudencia-desktop.png` y
  `design/previews/jurisprudencia-mobile.png`. Ninguna sentencia oficial se incorporó ni se afirmó
  haber verificado un destino externo.
- Pendientes por falta de contraseña administrada: ingreso real, carga HTTP con
  JWT administrativo, publicación/lectura/despublicación de un PDF original y
  prueba HTTP de un usuario Auth no administrador. Las pruebas SQL verifican
  esas reglas de RLS con sesiones de fixture; no sustituyen una sesión real.
- Pendiente de despliegue público: configurar `HOTTO_SITE_ORIGIN` y Search
  Console si se desea medir indexación. No establecer el origen en previews.

El asesor remoto de Supabase devolvió un aviso de seguridad: protección contra
contraseñas filtradas desactivada en Auth. Debe habilitarse en el Dashboard si
el plan/proyecto la ofrece. También devolvió 12 avisos de rendimiento por
políticas RLS permisivas superpuestas para lectura `authenticated`; preservan
la lectura pública y la privada del administrador, pero conviene perfilar y
consolidar antes de una carga grande. Los índices de búsqueda actuales usan normalización de
texto y paginación; no hay medición de volumen con miles de fallos, por lo que
no se declara capacidad de producción cuantificada.
