begin;
create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;
grant usage on schema extensions to anon,authenticated;
create function public.search_catalog(query_text text default '',subject_code text default '',kind_filter text default 'all',available_only boolean default false,page_number integer default 1)
returns jsonb language sql stable security invoker set search_path='' as $$
 with candidates as (
  select w.id,w.slug,w.kind,w.title,w.subtitle,w.description,w.keywords,
   (select string_agg(a.name,' · ' order by a.name) from public.work_authors wa join public.authors a on a.id=wa.author_id where wa.work_id=w.id) author_names,
   coalesce((select array_agg(s.code) from public.work_subjects ws join public.subjects s on s.id=ws.subject_id where ws.work_id=w.id),'{}') subject_codes,
   exists(select 1 from public.documents d join public.files f on f.document_id=d.id where d.work_id=w.id and private.document_public(d.id)) available
  from public.works w where w.editorial_status='published' and w.enabled and not w.demo
   and exists(select 1 from public.documents d where d.work_id=w.id and private.document_public(d.id))
 ), filtered as (
  select * from candidates c where (kind_filter='all' or c.kind::text=kind_filter)
   and (subject_code='' or subject_code=any(c.subject_codes)) and (not available_only or c.available)
   and not exists(select 1 from regexp_split_to_table(lower(extensions.unaccent(left(trim(query_text),160))),E'\\s+') term
    where term<>'' and strpos(lower(extensions.unaccent(concat_ws(' ',c.title,c.subtitle,c.author_names,array_to_string(c.keywords,' ')))),term)=0)
 ), paged as (select * from filtered order by title,id limit 50 offset (greatest(1,least(page_number,10000))-1)*50)
 select jsonb_build_object('total',(select count(*) from filtered),'items',coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]'::jsonb));
$$;
revoke all on function public.search_catalog(text,text,text,boolean,integer) from public;
grant execute on function public.search_catalog(text,text,text,boolean,integer) to anon,authenticated;
commit;
