-- Keep anonymous publication and administrator-only writes while evaluating a
-- single SELECT policy per role/table. This removes duplicate permissive checks.
begin;

create index jurisprudence_approved_by_idx on public.jurisprudence (approved_by);

do $$
declare
  entry text[];
  table_name text;
  public_policy_name text;
  public_condition text;
begin
  foreach entry slice 1 in array array[
    array['academic_units','public_units'],
    array['sources','public_sources'],
    array['subjects','public_subjects'],
    array['authors','public_authors'],
    array['works','public_works'],
    array['work_subjects','public_work_subjects'],
    array['work_authors','public_work_authors'],
    array['editions','public_editions'],
    array['files','public_files'],
    array['jurisprudence','public_jurisprudence'],
    array['documents','public_documents'],
    array['legislation','public_legislation']
  ] loop
    table_name := entry[1];
    public_policy_name := entry[2];
    select qual into public_condition from pg_policies
      where schemaname='public' and tablename=table_name and policyname=public_policy_name
        and cmd='SELECT' and permissive='PERMISSIVE'
        and 'anon'=any(roles) and 'authenticated'=any(roles);
    if public_condition is null or not exists (
      select 1 from pg_policies where schemaname='public' and tablename=table_name
        and policyname='administrator_write' and cmd='ALL' and 'authenticated'=any(roles)
    ) then
      raise exception 'Unexpected policy state on public.%',table_name;
    end if;

    execute format('drop policy administrator_write on public.%I',table_name);
    execute format('alter policy %I on public.%I to anon',public_policy_name,table_name);
    execute format('create policy authenticated_read on public.%I for select to authenticated using ((select public.is_library_editor()) or (%s))',table_name,public_condition);
    execute format('create policy administrator_insert on public.%I for insert to authenticated with check ((select public.is_library_editor()))',table_name);
    execute format('create policy administrator_update on public.%I for update to authenticated using ((select public.is_library_editor())) with check ((select public.is_library_editor()))',table_name);
    execute format('create policy administrator_delete on public.%I for delete to authenticated using ((select public.is_library_editor()))',table_name);
  end loop;

  foreach table_name in array array['licenses','document_permissions'] loop
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename=table_name
        and policyname='administrator_write' and cmd='ALL' and 'authenticated'=any(roles)
    ) then
      raise exception 'Unexpected administrator policy on public.%',table_name;
    end if;
    execute format('drop policy administrator_write on public.%I',table_name);
    execute format('create policy administrator_read on public.%I for select to authenticated using ((select public.is_library_editor()))',table_name);
    execute format('create policy administrator_insert on public.%I for insert to authenticated with check ((select public.is_library_editor()))',table_name);
    execute format('create policy administrator_update on public.%I for update to authenticated using ((select public.is_library_editor())) with check ((select public.is_library_editor()))',table_name);
    execute format('create policy administrator_delete on public.%I for delete to authenticated using ((select public.is_library_editor()))',table_name);
  end loop;
end;
$$;
commit;
