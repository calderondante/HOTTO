-- Documentary administration. Additive to the MVP foundation; no fixture works imported.
alter type public.source_verification add value if not exists 'unverified';
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;
create table private.library_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true, created_at timestamptz not null default now()
);
alter table private.library_admins enable row level security;
grant select on private.library_admins to anon,authenticated;
create policy own_membership on private.library_admins for select to anon,authenticated using (user_id = (select auth.uid()));
-- Membership changes require the database owner, never a browser or editable JWT claim.
create function private.active_administrator() returns boolean
language sql stable security definer set search_path='' as $$
 select (select auth.uid()) is not null and (select auth.jwt())->>'role'='authenticated' and exists (
   select 1 from private.library_admins a join auth.sessions s on s.user_id=a.user_id
   where a.user_id=(select auth.uid()) and a.active
     and s.id::text=(select auth.jwt())->>'session_id' and (s.not_after is null or s.not_after>now())
 );
$$;
revoke all on function private.active_administrator() from public;
grant execute on function private.active_administrator() to anon,authenticated;
create or replace function public.is_library_editor() returns boolean
language sql stable security invoker set search_path='' as $$select private.active_administrator();$$;

alter table public.works add column enabled boolean not null default true;
alter table public.works add column revision integer not null default 1;
alter table public.licenses add column revoked_at timestamptz;
alter table public.licenses add column valid_until date;
alter table public.licenses drop constraint licenses_check;
-- Evidence is registered when a permission is verified, not when intake starts.
alter table public.licenses add constraint licenses_distribution_evidence check (not distribution_allowed or nullif(btrim(evidence),'') is not null);
create table public.documents (
  id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id),
  edition_id uuid references public.editions(id), label text not null check (length(btrim(label)) between 1 and 200),
  access_mode text not null check (access_mode in ('pdf','external','reference')),
  external_url text check (external_url ~ '^https://[^[:space:]]+$'),
  editorial_status public.editorial_status not null default 'draft', enabled boolean not null default true,
  metadata jsonb not null default '{}', metadata_origin text not null default 'manual' check (metadata_origin in ('manual','assisted')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((access_mode='external' and external_url is not null) or (access_mode<>'external' and external_url is null))
);
create table public.document_permissions (
  document_id uuid primary key references public.documents(id), license_id uuid not null references public.licenses(id),
  state text not null default 'pending' check (state in ('pending','verified','rejected')),
  allow_public boolean not null default false, evidence text not null default '',
  verified_by uuid references auth.users(id), verified_at timestamptz, valid_until date,
  check (state<>'verified' or (allow_public and length(btrim(evidence))>=10 and verified_by is not null and verified_at is not null))
);
create table public.legislation (
  work_id uuid primary key references public.works(id), authority text not null,
  identifier text not null, enacted_on date, jurisdiction text not null, validity_note text not null
);
create table public.editorial_events (
  id bigint generated always as identity primary key, entity text not null,
  entity_id uuid not null, actor_id uuid references auth.users(id) on delete set null,
  before_status text, after_status text, occurred_at timestamptz not null default now()
);
-- Keep any existing file metadata during upgrade, then backfill its resource relation.
alter table public.files drop constraint files_distribution_allowed_check;
alter table public.files drop constraint files_license_id_distribution_allowed_fkey;
alter table public.files add column document_id uuid references public.documents(id);
alter table public.files add column validated_at timestamptz;
alter table public.files alter column edition_id drop not null;
insert into public.documents(id,work_id,edition_id,label,access_mode)
select f.id,e.work_id,e.id,'Archivo migrado: requiere revisión','pdf' from public.files f join public.editions e on e.id=f.edition_id;
update public.files set document_id=id;
alter table public.files alter column document_id set not null;
alter table public.files add constraint files_document_unique unique(document_id);
alter table public.files add constraint files_license_fk foreign key(license_id) references public.licenses(id);
alter table public.files add constraint files_size_limit check(bytes<=26214400);
create index documents_work_idx on public.documents(work_id);
create index documents_edition_idx on public.documents(edition_id);
create index permissions_license_idx on public.document_permissions(license_id);
create index permissions_verifier_idx on public.document_permissions(verified_by);
create index events_actor_idx on public.editorial_events(actor_id);
create index events_entity_idx on public.editorial_events(entity,entity_id,occurred_at desc);
create index works_catalog_idx on public.works(kind,created_at desc) where editorial_status='published' and enabled and not demo;

-- Narrow private lookup functions return only eligibility, never permission evidence.
-- These are intentional anonymous-publication gates, not identity bypasses.
create function private.document_ready(document_uuid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists (
   select 1 from public.documents d
   join public.works w on w.id=d.work_id
   join public.sources s on s.id=w.source_id
   join public.document_permissions p on p.document_id=d.id
   join public.licenses l on l.id=p.license_id
   where d.id=document_uuid and d.enabled and not w.demo and s.editorial_status='published' and s.verification::text<>'unverified'
     and p.state='verified' and p.allow_public and p.verified_at is not null and length(btrim(p.evidence))>=10
     and (p.valid_until is null or p.valid_until>=current_date)
     and l.revoked_at is null and (l.valid_until is null or l.valid_until>=current_date)
     and (w.kind<>'book' or d.edition_id is not null)
     and (d.edition_id is null or exists(select 1 from public.editions e where e.id=d.edition_id and e.work_id=w.id and e.editorial_status='published'))
     and (d.access_mode<>'pdf' or (l.distribution_allowed and exists(
       select 1 from public.files f join storage.objects o on o.bucket_id=f.storage_bucket and o.name=f.storage_path
       where f.document_id=d.id and f.validated_at is not null and f.license_id=l.id
         and f.bytes>0 and f.bytes<=26214400 and f.mime='application/pdf'
         and coalesce((o.metadata->>'size')::bigint,0)=f.bytes and o.metadata->>'mimetype'='application/pdf'
     )))
 );
$$;
create function private.document_public(document_uuid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.documents d join public.works w on w.id=d.work_id
   where d.id=document_uuid and d.editorial_status='published' and w.editorial_status='published'
     and w.enabled and private.document_ready(d.id));
$$;
revoke all on function private.document_ready(uuid),private.document_public(uuid) from public;
grant execute on function private.document_ready(uuid) to authenticated;
grant execute on function private.document_public(uuid) to anon,authenticated;

-- Replace all MVP policies; live administrator membership is the only write gate.
do $$
declare t text; p record;
begin
 foreach t in array array['academic_units','sources','subjects','authors','licenses','works','work_subjects','work_authors','editions','files','jurisprudence','documents','document_permissions','legislation','editorial_events'] loop
   for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
     execute format('drop policy %I on public.%I',p.policyname,t);
   end loop;
   execute format('alter table public.%I enable row level security',t);
   execute format('revoke all on public.%I from anon,authenticated',t);
   execute format('grant select on public.%I to authenticated',t);
   if t<>'editorial_events' then
     execute format('grant insert,update,delete on public.%I to authenticated',t);
     execute format('create policy administrator_write on public.%I for all to authenticated using ((select public.is_library_editor())) with check ((select public.is_library_editor()))',t);
   else
     execute format('create policy administrator_read on public.%I for select to authenticated using ((select public.is_library_editor()))',t);
   end if;
 end loop;
end;$$;
grant select on public.academic_units,public.sources,public.subjects,public.authors,public.works,public.work_subjects,public.work_authors,public.editions,public.files,public.jurisprudence,public.documents,public.legislation to anon;
create policy public_units on public.academic_units for select to anon,authenticated using(editorial_status='published');
create policy public_sources on public.sources for select to anon,authenticated using(editorial_status='published');
create policy public_subjects on public.subjects for select to anon,authenticated using(editorial_status='published' and exists(select 1 from public.academic_units u where u.id=academic_unit_id and u.editorial_status='published'));
create policy public_works on public.works for select to anon,authenticated using(editorial_status='published' and enabled and not demo and exists(select 1 from public.documents d where d.work_id=works.id and private.document_public(d.id)));
create policy public_documents on public.documents for select to anon,authenticated using(private.document_public(id));
create policy public_files on public.files for select to anon,authenticated using(private.document_public(document_id));
create policy public_editions on public.editions for select to anon,authenticated using(editorial_status='published' and exists(select 1 from public.works w where w.id=work_id));
create policy public_work_subjects on public.work_subjects for select to anon,authenticated using(exists(select 1 from public.works w where w.id=work_id) and exists(select 1 from public.subjects s where s.id=subject_id));
create policy public_work_authors on public.work_authors for select to anon,authenticated using(exists(select 1 from public.works w where w.id=work_id));
create policy public_authors on public.authors for select to anon,authenticated using(not demo and exists(select 1 from public.work_authors wa where wa.author_id=authors.id));
create policy public_jurisprudence on public.jurisprudence for select to anon,authenticated using(exists(select 1 from public.works w where w.id=work_id and w.kind='jurisprudence'));
create policy public_legislation on public.legislation for select to anon,authenticated using(exists(select 1 from public.works w where w.id=work_id and w.kind='legislation'));

create function private.validate_document() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.edition_id is not null and not exists(select 1 from public.editions where id=new.edition_id and work_id=new.work_id) then raise exception 'La edición pertenece a otra obra'; end if;
 if tg_op='UPDATE' then
   if new.access_mode<>old.access_mode and exists(select 1 from public.files where document_id=old.id) then raise exception 'Un documento con archivo no puede cambiar de tipo';end if;
   if new.work_id<>old.work_id then raise exception 'El documento no puede cambiar de obra'; end if;
   if new.external_url is distinct from old.external_url or new.edition_id is distinct from old.edition_id or new.access_mode<>old.access_mode or new.label<>old.label then
     new.editorial_status='draft';
     update public.works set editorial_status='draft' where id=new.work_id and editorial_status='published';
     update public.document_permissions set state='pending',allow_public=false where document_id=new.id;
   end if;
 end if;
 if new.editorial_status='published' then
   if tg_op='INSERT' or old.editorial_status not in ('review','published') then raise exception 'El documento debe pasar por revisión'; end if;
   if not private.document_ready(new.id) then raise exception 'Documento sin archivo válido, procedencia o permisos verificados'; end if;
 end if;
 new.updated_at=now();return new;
end;$$;
create trigger document_guard before insert or update on public.documents for each row execute function private.validate_document();
create function private.validate_work() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if length(btrim(new.title)) not between 1 and 300 or length(new.description)>12000 then raise exception 'Metadatos fuera de límite'; end if;
 if tg_op='UPDATE' then
   new.revision=old.revision+1;
   if old.editorial_status='published' and (new.title<>old.title or new.description<>old.description or new.source_id<>old.source_id or new.license_id<>old.license_id) then new.editorial_status='draft'; end if;
   if new.slug<>old.slug then raise exception 'La URL permanente no puede cambiar'; end if;
   if new.kind<>old.kind then raise exception 'El tipo determina la URL permanente y no puede cambiar'; end if;
 end if;
 if new.editorial_status in ('review','published') then
   if length(btrim(new.description))<20 or not exists(select 1 from public.work_subjects where work_id=new.id) or not exists(select 1 from public.work_authors where work_id=new.id) then raise exception 'Completá descripción, autores y materias antes de revisar'; end if;
   if new.kind='jurisprudence' and not exists(select 1 from public.jurisprudence where work_id=new.id) then raise exception 'Falta la ficha judicial'; end if;
   if new.kind='legislation' and not exists(select 1 from public.legislation where work_id=new.id) then raise exception 'Falta la ficha legislativa'; end if;
 end if;
 if new.editorial_status='published' then
   if tg_op='INSERT' or old.editorial_status not in ('review','published') then raise exception 'La obra debe pasar por revisión'; end if;
   if new.demo or not exists(select 1 from public.documents d where d.work_id=new.id and d.editorial_status='published' and private.document_ready(d.id)) then raise exception 'Publicación sin un documento habilitado'; end if;
 end if;
 return new;
end;$$;
create trigger work_guard before insert or update on public.works for each row execute function private.validate_work();
create function private.verify_permission() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.state='verified' then
   if not public.is_library_editor() then raise exception 'Solo administradores verifican permisos'; end if;
   new.verified_by=auth.uid();new.verified_at=now();
 else new.verified_by=null;new.verified_at=null;
 end if;return new;
end;$$;
create trigger permission_guard before insert or update on public.document_permissions for each row execute function private.verify_permission();
create function private.audit_editorial() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.editorial_events(entity,entity_id,actor_id,before_status,after_status)
 values(tg_table_name,new.id,auth.uid(),case when tg_op='UPDATE' then old.editorial_status::text else null end,new.editorial_status::text);
 return new;
end;$$;
revoke all on function private.audit_editorial() from public;
create trigger audit_work after insert or update on public.works for each row execute function private.audit_editorial();
create trigger audit_document after insert or update on public.documents for each row execute function private.audit_editorial();

create function public.save_library_work(payload jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
declare work_uuid uuid; subject_uuid uuid; author_uuid uuid; expected integer;
begin
 if not public.is_library_editor() then raise exception 'Administrador requerido' using errcode='42501'; end if;
 work_uuid=nullif(payload->>'id','')::uuid;
 if work_uuid is null then
   insert into public.works(slug,kind,title,subtitle,description,keywords,source_id,license_id)
   values(payload->>'slug',(payload->>'kind')::public.resource_kind,payload->>'title',coalesce(payload->>'subtitle',''),coalesce(payload->>'description',''),array(select jsonb_array_elements_text(coalesce(payload->'keywords','[]'))),coalesce(nullif(payload->>'source_id','')::uuid,'00000000-0000-4000-8000-000000000010'),coalesce(nullif(payload->>'license_id','')::uuid,'00000000-0000-4000-8000-000000000011')) returning id into work_uuid;
 else
   expected=(payload->>'revision')::integer;
   perform 1 from public.works where id=work_uuid and revision=expected for update;
   if not found then raise exception 'La obra cambió: recargá antes de guardar' using errcode='40001'; end if;
   update public.works set title=payload->>'title',subtitle=coalesce(payload->>'subtitle',''),description=coalesce(payload->>'description',''),keywords=array(select jsonb_array_elements_text(coalesce(payload->'keywords','[]'))),source_id=(payload->>'source_id')::uuid,license_id=(payload->>'license_id')::uuid,editorial_status='draft' where id=work_uuid;
 end if;
 delete from public.work_subjects where work_id=work_uuid;
 for subject_uuid in select value::uuid from jsonb_array_elements_text(coalesce(payload->'subject_ids','[]')) loop insert into public.work_subjects values(work_uuid,subject_uuid) on conflict do nothing;end loop;
 delete from public.work_authors where work_id=work_uuid;
 for author_uuid in select value::uuid from jsonb_array_elements_text(coalesce(payload->'author_ids','[]')) loop insert into public.work_authors(work_id,author_id) values(work_uuid,author_uuid) on conflict do nothing;end loop;
 return work_uuid;
end;$$;
revoke all on function public.save_library_work(jsonb) from public;
grant execute on function public.save_library_work(jsonb) to authenticated;

-- A private bucket, capped at 25 MiB. No object overwrites; replacement gets a new UUID.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('library-private','library-private',false,26214400,array['application/pdf']) on conflict(id) do nothing;
do $$begin if exists(select 1 from storage.buckets where id='library-private' and (public or file_size_limit is null or file_size_limit>26214400 or allowed_mime_types is distinct from array['application/pdf'])) then raise exception 'Configuración incompatible del bucket library-private';end if;end;$$;
create policy hotto_admin_read on storage.objects for select to authenticated using(bucket_id='library-private' and (select public.is_library_editor()));
create policy hotto_admin_upload on storage.objects for insert to authenticated with check(bucket_id='library-private' and (select public.is_library_editor()) and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.pdf$');
-- Deletion only for unlinked intake objects. Published objects cannot be replaced/deleted.
create policy hotto_admin_cleanup on storage.objects for delete to authenticated using(bucket_id='library-private' and (select public.is_library_editor()) and not exists(select 1 from public.files f where f.storage_path=name));
create policy hotto_public_pdf on storage.objects for select to anon,authenticated using(bucket_id='library-private' and exists(select 1 from public.files f where f.storage_path=name and private.document_public(f.document_id)));
-- Restrictive boundaries also hold if the project has broad policies for other buckets.
create policy hotto_read_boundary on storage.objects as restrictive for select to anon,authenticated using(bucket_id<>'library-private' or (select public.is_library_editor()) or exists(select 1 from public.files f where f.storage_path=name and private.document_public(f.document_id)));
create policy hotto_insert_boundary on storage.objects as restrictive for insert to anon,authenticated with check(bucket_id<>'library-private' or ((select public.is_library_editor()) and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.pdf$'));
create policy hotto_update_boundary on storage.objects as restrictive for update to anon,authenticated using(bucket_id<>'library-private') with check(bucket_id<>'library-private');
create policy hotto_delete_boundary on storage.objects as restrictive for delete to anon,authenticated using(bucket_id<>'library-private' or ((select public.is_library_editor()) and not exists(select 1 from public.files f where f.storage_path=name)));
revoke all on function private.validate_work(),private.validate_document(),private.verify_permission() from public;
create function private.sync_file_edition() returns trigger language plpgsql security invoker set search_path='' as $$begin update public.files set edition_id=new.edition_id where document_id=new.id;return null;end;$$;
create trigger sync_file_edition after update of edition_id on public.documents for each row execute function private.sync_file_edition();
revoke all on function private.sync_file_edition() from public;
-- Files are immutable: a replacement is a new private intake document.
create function private.guard_file() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.documents d where d.id=new.document_id and d.access_mode='pdf' and d.edition_id is not distinct from new.edition_id) then raise exception 'Archivo y documento/edición incompatibles'; end if;
 if new.storage_path<>new.document_id::text||'/'||new.id::text||'.pdf' then raise exception 'Ruta de archivo inválida'; end if;
 if tg_op='UPDATE' then
   if new.document_id<>old.document_id or new.storage_path<>old.storage_path or new.sha256<>old.sha256 or new.bytes<>old.bytes or new.validated_at is distinct from old.validated_at then raise exception 'Los archivos son inmutables; creá un documento nuevo'; end if;
   if new.license_id<>old.license_id then
     update public.document_permissions set state='pending',allow_public=false where document_id=new.document_id;
     update public.documents set editorial_status='draft' where id=new.document_id;
   end if;
 end if;return new;
end;$$;
create trigger file_guard before insert or update on public.files for each row execute function private.guard_file();
create function private.invalidate_work() returns trigger language plpgsql security invoker set search_path='' as $$
declare work_uuid uuid;
begin
 work_uuid=case when tg_op='DELETE' then old.work_id else new.work_id end;
 if tg_table_name in ('jurisprudence','legislation') and tg_op<>'DELETE' and not exists(select 1 from public.works where id=work_uuid and kind=case when tg_table_name='legislation' then 'legislation'::public.resource_kind else 'jurisprudence'::public.resource_kind end) then raise exception 'Tipo de ficha incompatible con la obra'; end if;
 update public.works set editorial_status='draft' where id=work_uuid and editorial_status='published';
 return null;
end;$$;
do $$declare t text;begin
 foreach t in array array['work_authors','work_subjects','jurisprudence','legislation','editions'] loop
   execute format('create trigger metadata_review after insert or update or delete on public.%I for each row execute function private.invalidate_work()',t);
 end loop;
end;$$;
revoke all on function private.guard_file(),private.invalidate_work() from public;
revoke delete on public.works,public.documents,public.files,public.editions,public.sources,public.licenses,public.document_permissions,public.jurisprudence,public.legislation,public.authors from authenticated;
commit;
