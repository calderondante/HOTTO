-- Initial architecture only. Not executed against PostgreSQL in this delivery.
-- Remote Supabase project, editor claims and storage integration are a later phase.
begin;

create type public.editorial_status as enum ('draft', 'review', 'published', 'archived');
create type public.resource_kind as enum ('book', 'jurisprudence', 'legislation', 'syllabus', 'complement');
create type public.source_verification as enum ('official', 'secondary-crosschecked', 'original-demo');

create function public.is_library_editor() returns boolean
language sql stable security invoker set search_path = '' as $$
  select (select auth.uid()) is not null and coalesce(
    (select auth.jwt()) -> 'app_metadata' ->> 'library_role' in ('editor', 'admin'), false);
$$;
revoke all on function public.is_library_editor() from public;
grant execute on function public.is_library_editor() to anon, authenticated;

create table public.academic_units (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  name text not null, program text not null, curriculum_year smallint not null,
  editorial_status public.editorial_status not null default 'draft'
);
create table public.sources (
  id uuid primary key default gen_random_uuid(), label text not null,
  urls text[] not null default '{}', verification public.source_verification not null,
  note text not null, editorial_status public.editorial_status not null default 'draft'
);
create table public.subjects (
  id uuid primary key default gen_random_uuid(), academic_unit_id uuid not null references public.academic_units(id),
  source_id uuid not null references public.sources(id), code text, slug text not null unique,
  name text not null, aliases text[] not null default '{}', curriculum_year smallint not null check (curriculum_year between 1 and 10),
  editorial_area text, pilot boolean not null default false,
  editorial_status public.editorial_status not null default 'draft',
  unique (academic_unit_id, code), check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
create table public.authors (
  id uuid primary key default gen_random_uuid(), name text not null, demo boolean not null default false
);
create table public.licenses (
  id uuid primary key default gen_random_uuid(), name text not null, attribution text,
  distribution_allowed boolean not null default false, evidence text,
  unique (id, distribution_allowed),
  check (not distribution_allowed or nullif(btrim(evidence), '') is not null)
);
create table public.works (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  kind public.resource_kind not null, title text not null, subtitle text not null default '',
  description text not null, keywords text[] not null default '{}',
  source_id uuid not null references public.sources(id), license_id uuid not null references public.licenses(id),
  editorial_status public.editorial_status not null default 'draft', demo boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
create table public.work_subjects (
  work_id uuid not null references public.works(id) on delete cascade,
  subject_id uuid not null references public.subjects(id), primary key (work_id, subject_id)
);
create table public.work_authors (
  work_id uuid not null references public.works(id) on delete cascade,
  author_id uuid not null references public.authors(id), position smallint not null default 0,
  primary key (work_id, author_id), check (position >= 0)
);
create table public.editions (
  id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id),
  label text not null, publication_year smallint, publisher text, isbn text,
  editorial_status public.editorial_status not null default 'draft'
);
create table public.files (
  id uuid primary key default gen_random_uuid(), edition_id uuid not null references public.editions(id),
  license_id uuid not null, distribution_allowed boolean not null default false check (distribution_allowed),
  storage_bucket text not null default 'library-private' check (storage_bucket = 'library-private'),
  storage_path text not null unique, mime text not null check (mime = 'application/pdf'),
  bytes bigint not null check (bytes > 0), pages integer check (pages > 0), sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  editorial_status public.editorial_status not null default 'draft',
  foreign key (license_id, distribution_allowed) references public.licenses(id, distribution_allowed)
);
create table public.jurisprudence (
  work_id uuid primary key references public.works(id) on delete cascade,
  court text not null, docket text not null, decision_date date not null,
  topic text not null, holding text not null
);

create index subjects_academic_unit_idx on public.subjects (academic_unit_id);
create index subjects_source_idx on public.subjects (source_id);
create index works_source_idx on public.works (source_id);
create index works_license_idx on public.works (license_id);
create index works_published_kind_idx on public.works (kind) where editorial_status = 'published';
create index works_keywords_idx on public.works using gin (keywords);
create index work_subjects_subject_idx on public.work_subjects (subject_id, work_id);
create index work_authors_author_idx on public.work_authors (author_id, work_id);
create index editions_work_idx on public.editions (work_id);
create index files_edition_idx on public.files (edition_id);
create index files_license_idx on public.files (license_id, distribution_allowed);

create function public.touch_work_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger works_updated_at before update on public.works for each row execute function public.touch_work_updated_at();

-- No anonymous writes. Editor status comes only from trusted app_metadata.
-- A user cannot assign this claim through their editable user_metadata.
do $$
declare table_name text;
begin
  foreach table_name in array array['academic_units','sources','subjects','authors','licenses','works','work_subjects','work_authors','editions','files','jurisprudence'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy editor_access on public.%I for all to authenticated using ((select public.is_library_editor())) with check ((select public.is_library_editor()))', table_name);
  end loop;
end;
$$;
grant select on public.academic_units, public.sources, public.subjects, public.authors, public.works,
  public.work_subjects, public.work_authors, public.editions, public.jurisprudence to anon;
-- Permission evidence can contain private contracts: expose only license labels.
revoke select on public.licenses from authenticated;
grant select (id, name, attribution, distribution_allowed) on public.licenses to anon, authenticated;
create policy license_labels on public.licenses for select to anon, authenticated using (true);
create policy published_units on public.academic_units for select to anon, authenticated using (editorial_status = 'published');
create policy published_sources on public.sources for select to anon, authenticated using (editorial_status = 'published');
create policy published_subjects on public.subjects for select to anon, authenticated using (
  editorial_status = 'published' and exists (select 1 from public.academic_units u where u.id = academic_unit_id and u.editorial_status = 'published')
);
create policy published_works on public.works for select to anon, authenticated using (editorial_status = 'published');
create policy published_work_subjects on public.work_subjects for select to anon, authenticated using (
  exists (select 1 from public.works w where w.id = work_id and w.editorial_status = 'published') and
  exists (select 1 from public.subjects s where s.id = subject_id and s.editorial_status = 'published')
);
create policy published_work_authors on public.work_authors for select to anon, authenticated using (
  exists (select 1 from public.works w where w.id = work_id and w.editorial_status = 'published')
);
create policy published_authors on public.authors for select to anon, authenticated using (
  exists (select 1 from public.work_authors wa join public.works w on w.id = wa.work_id where wa.author_id = authors.id and w.editorial_status = 'published')
);
create policy published_editions on public.editions for select to anon, authenticated using (
  editorial_status = 'published' and exists (select 1 from public.works w where w.id = work_id and w.editorial_status = 'published')
);
create policy published_jurisprudence on public.jurisprudence for select to anon, authenticated using (
  exists (select 1 from public.works w where w.id = work_id and w.kind = 'jurisprudence' and w.editorial_status = 'published')
);
-- No public file metadata/path policies or Storage policies in this migration.
-- Only an editor sees file records. A server download gateway with a checked
-- permission and short-lived signed URL is required before real distribution.
-- Do not create a public bucket or grant service keys to the frontend.
commit;
