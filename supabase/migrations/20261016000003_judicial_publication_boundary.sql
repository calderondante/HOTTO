-- A judicial work is public only when its matching official document is public.
begin;
create function private.judicial_source_public(work_uuid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists (
   select 1 from public.jurisprudence j join public.documents d
     on d.work_id=j.work_id and d.access_mode='external' and d.external_url=j.official_url
   where j.work_id=work_uuid and j.official_verified_at is not null
     and d.editorial_status='published' and private.document_ready(d.id)
 );
$$;
revoke all on function private.judicial_source_public(uuid) from public;
grant execute on function private.judicial_source_public(uuid) to anon,authenticated;

drop policy public_works on public.works;
create policy public_works on public.works for select to anon,authenticated using(
 editorial_status='published' and enabled and not demo
 and exists(select 1 from public.documents d where d.work_id=works.id and private.document_public(d.id))
 and (kind<>'jurisprudence' or private.judicial_source_public(id))
);

create or replace function private.validate_work() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if length(btrim(new.title)) not between 1 and 300 or length(new.description)>12000 then raise exception 'Metadatos fuera de límite'; end if;
 if tg_op='UPDATE' then
   new.revision=old.revision+1;
   if old.editorial_status='published' and (new.title<>old.title or new.description<>old.description or new.source_id<>old.source_id or new.license_id<>old.license_id) then new.editorial_status='draft'; end if;
   if new.slug<>old.slug then raise exception 'La URL permanente no puede cambiar'; end if;
   if new.kind<>old.kind then raise exception 'El tipo determina la URL permanente y no puede cambiar'; end if;
 end if;
 if new.editorial_status in ('review','published') then
   if length(btrim(new.description))<20 or not exists(select 1 from public.work_subjects where work_id=new.id)
      or (new.kind<>'jurisprudence' and not exists(select 1 from public.work_authors where work_id=new.id)) then
     raise exception 'Completá descripción, materias y, cuando corresponda, autores antes de revisar';
   end if;
   if new.kind='jurisprudence' and not exists (
     select 1 from public.jurisprudence j join public.sources s on s.id=new.source_id
     where j.work_id=new.id and j.official_url is not null and j.official_verified_at is not null
       and j.judicial_id is not null and length(btrim(j.jurisdiction))>1 and length(btrim(j.topic))>1
       and length(btrim(j.court))>1 and length(btrim(j.docket))>1
       and s.verification='official' and s.editorial_status='published'
       and exists(select 1 from public.documents d where d.work_id=new.id and d.access_mode='external' and d.external_url=j.official_url)
   ) then raise exception 'Falta identificación, fuente oficial verificada o enlace judicial'; end if;
   if new.kind='legislation' and not exists(select 1 from public.legislation where work_id=new.id) then raise exception 'Falta la ficha legislativa'; end if;
 end if;
 if new.editorial_status='published' then
   if tg_op='INSERT' or old.editorial_status not in ('review','published') then raise exception 'La obra debe pasar por revisión'; end if;
   if new.demo or not exists(select 1 from public.documents d where d.work_id=new.id and d.editorial_status='published' and private.document_ready(d.id)) then raise exception 'Publicación sin un documento habilitado'; end if;
   if new.kind='jurisprudence' and not private.judicial_source_public(new.id) then raise exception 'La sentencia oficial debe estar publicada y habilitada'; end if;
 end if;
 return new;
end;$$;
commit;
