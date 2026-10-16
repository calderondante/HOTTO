-- An approval belongs to the reviewer and is invalidated by a changed source URL.
begin;
create or replace function private.guard_jurisprudence() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.seo_level in ('B','C') and (length(btrim(new.legal_issue))<20 or length(btrim(new.decision))<20) then
    raise exception 'La ficha interna requiere problema jurídico y decisión';
  end if;
  if tg_op='UPDATE' then
    if new.official_url is distinct from old.official_url and new.official_verified_at is not distinct from old.official_verified_at then
      new.official_verified_at=null;
    end if;
    if (new.legal_issue,new.facts,new.decision,new.reasoning,new.significance,new.applicable_law,new.official_url,new.court,new.docket,new.decision_date)
      is distinct from (old.legal_issue,old.facts,old.decision,old.reasoning,old.significance,old.applicable_law,old.official_url,old.court,old.docket,old.decision_date) then
      new.analysis_state=case when new.analysis_state='none' then 'none' else 'draft' end;
      new.seo_level=case when new.seo_level='C' then 'B' else new.seo_level end;
      new.approved_by=null; new.approved_at=null;
    elsif old.analysis_state='approved' and new.analysis_state='approved'
      and (new.approved_by is distinct from old.approved_by or new.approved_at is distinct from old.approved_at) then
      raise exception 'La aprobación editorial no se puede atribuir manualmente';
    end if;
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
  if new.seo_level='C' and (new.analysis_state<>'approved' or new.approved_by is null) then raise exception 'El nivel C exige aprobación vigente'; end if;
  return new;
end;$$;
commit;
