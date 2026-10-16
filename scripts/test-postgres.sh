#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/tool-env.sh"
cd "$HOTTO_ROOT"
mkdir -p .cache
pg_bin="${HOTTO_TEST_PG_BIN:-$HOTTO_ROOT/.cache/pg-runtime/usr/lib/postgresql/17/bin}"
if [[ ! -x "$pg_bin/psql" ]]; then
  for candidate in /usr/lib/postgresql/17/bin /usr/lib/postgresql/16/bin; do
    if [[ -x "$candidate/psql" ]]; then pg_bin="$candidate"; break; fi
  done
fi
if [[ -n "${HOTTO_TEST_DATABASE_URL:-}" ]]; then
  node --input-type=module -e 'const u=new URL(process.env.HOTTO_TEST_DATABASE_URL); if(!["localhost","127.0.0.1"].includes(u.hostname)||!u.pathname.startsWith("/hotto_test_"))throw Error("Only a disposable loopback hotto_test_* database is allowed.");'
  command -v psql >/dev/null && pg_bin="$(dirname "$(command -v psql)")"
  args=("$HOTTO_TEST_DATABASE_URL")
  run_dir="$(mktemp -d "$HOTTO_ROOT/.cache/pg-report-XXXXXX")"
else
  [[ -x "$pg_bin/initdb" ]] || { echo 'PostgreSQL nativo no disponible; pruebas SQL no ejecutadas.' >&2; exit 2; }
  run_dir="$(mktemp -d "$HOTTO_ROOT/.cache/pg-run-XXXXXX")"
  chmod 700 "$run_dir"
  mkdir "$run_dir/socket"
  shared="$HOTTO_ROOT/.cache/pg-runtime/usr/share/postgresql/17"
  lib="$HOTTO_ROOT/.cache/pg-runtime/usr/lib/postgresql/17/lib"
  if [[ "$pg_bin" != "$HOTTO_ROOT/.cache/pg-runtime/usr/lib/postgresql/17/bin" ]]; then shared="$("$pg_bin/pg_config" --sharedir)"; lib="$("$pg_bin/pg_config" --pkglibdir)"; fi
  "$pg_bin/initdb" -D "$run_dir/data" -L "$shared" --no-locale --encoding=UTF8 --auth-local=trust --auth-host=reject > "$run_dir/init.log" 2>&1
  trap '"$pg_bin/pg_ctl" -D "$run_dir/data" -m fast stop >/dev/null 2>&1 || true' EXIT
  "$pg_bin/pg_ctl" -D "$run_dir/data" -l "$run_dir/server.log" -o "-k $run_dir/socket -c listen_addresses='' -c dynamic_library_path=$lib" start >/dev/null
  "$pg_bin/createdb" -h "$run_dir/socket" hotto_test_native
  args=(-h "$run_dir/socket" -d hotto_test_native)
fi
[[ "$("$pg_bin/psql" "${args[@]}" -Atc "select to_regclass('public.works') is null")" == 't' ]] || { echo 'La base de pruebas no está vacía; no se modifica.' >&2; exit 1; }
"$pg_bin/psql" "${args[@]}" -v ON_ERROR_STOP=1 -f tests/postgres/platform.sql > "$run_dir/migrations.log"
for migration in supabase/migrations/*.sql; do "$pg_bin/psql" "${args[@]}" -v ON_ERROR_STOP=1 -f "$migration" >> "$run_dir/migrations.log"; done
"$pg_bin/psql" "${args[@]}" -v ON_ERROR_STOP=1 -f tests/postgres/authorization.sql > "$run_dir/authorization.log"
"$pg_bin/psql" "${args[@]}" -v ON_ERROR_STOP=1 -f tests/postgres/jurisprudence.sql > "$run_dir/jurisprudence.log"
"$pg_bin/psql" "${args[@]}" -Atc "select json_object_agg(table_name,cols) from (select table_name,array_agg(column_name order by ordinal_position) cols from information_schema.columns where table_schema='public' group by table_name) t" > "$run_dir/schema.json"
node scripts/check-schema-contract.mjs "$run_dir/schema.json"
cp "$run_dir/authorization.log" .cache/postgres-authorization.log
tail -n 1 "$run_dir/authorization.log"
tail -n 1 "$run_dir/jurisprudence.log"
"$pg_bin/psql" "${args[@]}" -Atc "select version(); select count(*) || ' seeded subjects' from public.subjects"
echo "PostgreSQL test evidence: $run_dir"
