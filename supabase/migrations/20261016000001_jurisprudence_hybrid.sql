-- Official-source jurisprudence with optional reviewed editorial analysis.
begin;
alter table public.jurisprudence
  add column jurisdiction text not null default '',
  add column chamber text not null default '',
  add column judicial_id text,
  add column official_url text,
  add column official_verified_at timestamptz,
  add column legal_issue text not null default '',
  add column facts text not null default '',
  add column decision text not null default '',
  add column reasoning text not null default '',
  add column significance text not null default '',
  add column applicable_law text not null default '',
  add column analysis_state text not null default 'none' check (analysis_state in ('none','draft','review','approved')),
  add column seo_level text not null default 'A' check (seo_level in ('A','B','C')),
  add column approved_by uuid references auth.users(id),
  add column approved_at timestamptz,
  add constraint jurisprudence_official_https check (official_url is null or (official_url ~ '^https://[^[:space:]]+$' and official_url !~ '^https://[^/]*@')),
  add constraint jurisprudence_identity check (judicial_id is null or length(btrim(judicial_id)) between 3 and 200),
  add constraint jurisprudence_approval_pair check ((approved_by is null) = (approved_at is null)),
  add constraint jurisprudence_seo_approval check (seo_level <> 'C' or (analysis_state='approved' and approved_by is not null));
alter table public.jurisprudence alter column holding drop not null;
create unique index jurisprudence_official_url_uniq on public.jurisprudence (official_url) where official_url is not null;
create unique index jurisprudence_judicial_identity_uniq on public.jurisprudence (lower(court),lower(judicial_id)) where judicial_id is not null;
create index jurisprudence_court_year_idx on public.jurisprudence (court,decision_date desc,work_id);
create index jurisprudence_jurisdiction_year_idx on public.jurisprudence (jurisdiction,decision_date desc,work_id);
create index jurisprudence_seo_idx on public.jurisprudence (seo_level,decision_date desc) where seo_level='C';

create function private.guard_jurisprudence() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.seo_level='C' and new.analysis_state<>'approved' then raise exception 'El nivel C exige análisis aprobado'; end if;
  if new.seo_level in ('B','C') and (length(btrim(new.legal_issue))<20 or length(btrim(new.decision))<20) then
    raise exception 'La ficha interna requiere problema jurídico y decisión';
  end if;
  if tg_op='UPDATE' and (new.legal_issue,new.facts,new.decision,new.reasoning,new.significance,new.applicable_law,new.official_url,new.court,new.docket,new.decision_date)
    is distinct from (old.legal_issue,old.facts,old.decision,old.reasoning,old.significance,old.applicable_law,old.official_url,old.court,old.docket,old.decision_date) then
    new.analysis_state=case when new.analysis_state='none' then 'none' else 'draft' end;
    new.seo_level=case when new.seo_level='C' then 'B' else new.seo_level end;
    new.approved_by=null; new.approved_at=null;
  end if;
  if new.analysis_state='approved' and (tg_op='INSERT' or old.analysis_state<>'approved') then
    if tg_op='INSERT' or old.analysis_state<>'review' or not public.is_library_editor() then raise exception 'El análisis debe revisarse antes de aprobar'; end if;
    if length(btrim(new.facts))<40 or length(btrim(new.reasoning))<80 or length(btrim(new.significance))<40 or length(btrim(new.applicable_law))<10 then
      raise exception 'El análisis editorial todavía está incompleto';
    end if;
    new.approved_by=auth.uid(); new.approved_at=now();
  elsif new.analysis_state<>'approved' then
    new.approved_by=null; new.approved_at=null;
  end if;
  if new.seo_level='C' and new.analysis_state<>'approved' then raise exception 'El nivel C exige aprobación vigente'; end if;
  return new;
end;$$;
create trigger jurisprudence_guard before insert or update on public.jurisprudence for each row execute function private.guard_jurisprudence();
revoke all on function private.guard_jurisprudence() from public;

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
 end if;
 return new;
end;$$;

create function public.search_jurisprudence(query_text text default '',subject_code text default '',court_filter text default '',year_filter integer default null,jurisdiction_filter text default '',page_number integer default 1)
returns jsonb language sql stable security invoker set search_path='' as $$
 with candidates as (
   select w.id,w.slug,w.title,w.description,w.keywords,j.court,j.chamber,j.docket,j.judicial_id,
     j.decision_date,j.topic,j.jurisdiction,j.official_url,j.seo_level,
     coalesce((select array_agg(s.code) from public.work_subjects ws join public.subjects s on s.id=ws.subject_id where ws.work_id=w.id),'{}') subject_codes
   from public.works w join public.jurisprudence j on j.work_id=w.id
   where w.kind='jurisprudence' and w.editorial_status='published' and w.enabled and not w.demo
     and j.official_url is not null and j.official_verified_at is not null
     and exists(select 1 from public.documents d where d.work_id=w.id and d.access_mode='external'
       and d.external_url=j.official_url and private.document_public(d.id))
 ), filtered as (
   select * from candidates c where (subject_code='' or subject_code=any(c.subject_codes))
     and (court_filter='' or c.court=court_filter)
     and (jurisdiction_filter='' or c.jurisdiction=jurisdiction_filter)
     and (year_filter is null or extract(year from c.decision_date)=year_filter)
     and not exists(select 1 from regexp_split_to_table(lower(extensions.unaccent(left(trim(query_text),160))),E'\\s+') term
       where term<>'' and strpos(lower(extensions.unaccent(concat_ws(' ',c.title,c.topic,c.court,c.chamber,c.docket,c.judicial_id,array_to_string(c.keywords,' ')))),term)=0)
 ), paged as (select * from filtered order by decision_date desc,id limit 30 offset (greatest(1,least(page_number,10000))-1)*30)
 select jsonb_build_object('total',(select count(*) from filtered),
   'items',coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]'::jsonb),
   'courts',coalesce((select jsonb_agg(court order by court) from (select distinct court from candidates) x),'[]'::jsonb),
   'jurisdictions',coalesce((select jsonb_agg(jurisdiction order by jurisdiction) from (select distinct jurisdiction from candidates) x),'[]'::jsonb));
$$;
revoke all on function public.search_jurisprudence(text,text,text,integer,text,integer) from public;
grant execute on function public.search_jurisprudence(text,text,text,integer,text,integer) to anon,authenticated;
commit;
