\set ON_ERROR_STOP on
begin;
create function pg_temp.assert_true(condition boolean,message text) returns void language plpgsql as $$begin if condition is distinct from true then raise exception 'FAIL: %',message;end if;end;$$;
insert into auth.users values('10000000-0000-4000-8000-000000000010');
insert into auth.sessions(id,user_id) values('10000000-0000-4000-9000-000000000010','10000000-0000-4000-8000-000000000010');
insert into private.library_admins(user_id) values('10000000-0000-4000-8000-000000000010');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000010","session_id":"10000000-0000-4000-9000-000000000010","role":"authenticated"}',true);
set local role authenticated;
insert into public.sources(id,label,verification,note,editorial_status) values('20000000-0000-4000-8000-000000000010','Fuente judicial SQL','official','Fuente exclusivamente de prueba local SQL','published');
insert into public.licenses(id,name,distribution_allowed) values('20000000-0000-4000-8000-000000000010','Enlace externo de prueba',false);
select public.save_library_work('{"slug":"fallo-prueba-sql","kind":"jurisprudence","title":"Carátula judicial de prueba SQL","description":"Ficha judicial local para verificar las reglas de publicación.","source_id":"20000000-0000-4000-8000-000000000010","license_id":"20000000-0000-4000-8000-000000000010","subject_ids":["00000000-0000-4000-8001-000000002340"],"author_ids":[]}'::jsonb) as judicial_work_id \gset
insert into public.documents(id,work_id,label,access_mode,external_url) values('30000000-0000-4000-8000-000000000010',:'judicial_work_id','Sentencia oficial de prueba','external','https://www.csjn.gov.ar/prueba-local/1');
insert into public.document_permissions(document_id,license_id,state,allow_public,evidence) values('30000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000010','verified',true,'Enlace oficial de prueba local verificado para la transacción');
update public.documents set editorial_status='review' where id='30000000-0000-4000-8000-000000000010';
update public.documents set editorial_status='published' where id='30000000-0000-4000-8000-000000000010';
insert into public.jurisprudence(work_id,court,docket,decision_date,topic,holding,jurisdiction,judicial_id,official_url)
values(:'judicial_work_id','Tribunal de prueba SQL','EXP-LOCAL-1','2026-01-01','Tema local de prueba',null,'Nacional','ID-LOCAL-1','https://www.csjn.gov.ar/prueba-local/1');
do $$begin
 begin update public.works set editorial_status='review' where slug='fallo-prueba-sql';raise exception 'Unverified official URL allowed';
 exception when raise_exception then if sqlerrm='Unverified official URL allowed' then raise;end if;end;
end;$$;
update public.jurisprudence set official_verified_at=now() where work_id=:'judicial_work_id';
update public.works set editorial_status='review' where id=:'judicial_work_id';
update public.works set editorial_status='published' where id=:'judicial_work_id';
insert into public.documents(id,work_id,label,access_mode) values('30000000-0000-4000-8000-000000000011',:'judicial_work_id','Referencia secundaria de prueba','reference');
insert into public.document_permissions(document_id,license_id,state,allow_public,evidence) values('30000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000010','verified',true,'Referencia secundaria verificada solo para la prueba local');
update public.documents set editorial_status='review' where id='30000000-0000-4000-8000-000000000011';
update public.documents set editorial_status='published' where id='30000000-0000-4000-8000-000000000011';
update public.documents set editorial_status='draft' where id='30000000-0000-4000-8000-000000000010';
reset role;
select set_config('request.jwt.claims','{}',true);
set local role anon;
select pg_temp.assert_true((select count(*)=0 from public.works where slug='fallo-prueba-sql'),'secondary reference cannot expose unpublished official case');
select pg_temp.assert_true((public.search_jurisprudence('','','',null,'',1)->>'total')::integer=0,'unpublished official document hides case');
reset role;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000010","session_id":"10000000-0000-4000-9000-000000000010","role":"authenticated"}',true);
set local role authenticated;
update public.works set editorial_status='draft' where id=:'judicial_work_id';
update public.works set editorial_status='review' where id=:'judicial_work_id';
do $$begin begin update public.works set editorial_status='published' where slug='fallo-prueba-sql';raise exception 'Published through secondary reference';exception when raise_exception then if sqlerrm='Published through secondary reference' then raise;end if;end;end;$$;
update public.documents set editorial_status='review' where id='30000000-0000-4000-8000-000000000010';
update public.documents set editorial_status='published' where id='30000000-0000-4000-8000-000000000010';
update public.works set editorial_status='published' where id=:'judicial_work_id';
reset role;
select set_config('request.jwt.claims','{}',true);
set local role anon;
select pg_temp.assert_true((public.search_jurisprudence('EXP-LOCAL-1','2340','Tribunal de prueba SQL',2026,'Nacional',1)->>'total')::integer=1,'A search with docket and filters');
select pg_temp.assert_true((public.search_jurisprudence('','','',null,'',1)->'items'->0->>'seo_level')='A','basic case has no editorial page');
do $$begin begin update public.jurisprudence set seo_level='C';raise exception 'Anonymous analysis edit allowed';exception when insufficient_privilege then null;end;end;$$;
reset role;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000010","session_id":"10000000-0000-4000-9000-000000000010","role":"authenticated"}',true);
set local role authenticated;
do $$begin begin update public.jurisprudence set seo_level='C' where work_id=(select id from public.works where slug='fallo-prueba-sql');raise exception 'Unapproved C allowed';exception when raise_exception then if sqlerrm='Unapproved C allowed' then raise;end if;end;end;$$;
update public.jurisprudence set legal_issue='¿Puede una norma local modificar este procedimiento judicial?',
  facts='Hechos ficticios de prueba local, exclusivos de una transacción reversible.',
  decision='El tribunal ficticio resolvió únicamente el supuesto local de prueba.',
  reasoning='Fundamentos ficticios de prueba local que permiten comprobar un umbral técnico sin publicarse ni atribuirse a tribunal real.',
  significance='Importancia ficticia de prueba local para validar las reglas editoriales.',
  applicable_law='Norma ficticia de prueba',seo_level='B',analysis_state='draft' where work_id=:'judicial_work_id';
update public.works set editorial_status='review' where id=:'judicial_work_id';
update public.works set editorial_status='published' where id=:'judicial_work_id';
select pg_temp.assert_true((public.search_jurisprudence('','','',null,'',1)->'items'->0->>'seo_level')='B','preliminary case searchable');
update public.jurisprudence set analysis_state='review' where work_id=:'judicial_work_id';
update public.jurisprudence set analysis_state='approved',seo_level='C' where work_id=:'judicial_work_id';
select pg_temp.assert_true((select approved_by=auth.uid() and approved_at is not null from public.jurisprudence where work_id=:'judicial_work_id'),'editorial approval attributed to active admin');
do $$begin begin update public.jurisprudence set approved_by='10000000-0000-4000-8000-000000000011' where work_id=(select id from public.works where slug='fallo-prueba-sql');raise exception 'Approval attribution forged';exception when raise_exception then if sqlerrm='Approval attribution forged' then raise;end if;end;end;$$;
update public.works set editorial_status='review' where id=:'judicial_work_id';
update public.works set editorial_status='published' where id=:'judicial_work_id';
reset role;
select set_config('request.jwt.claims','{}',true);
set local role anon;
select pg_temp.assert_true((public.search_jurisprudence('','','',null,'',1)->'items'->0->>'seo_level')='C','approved case publicly eligible');
reset role;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000010","session_id":"10000000-0000-4000-9000-000000000010","role":"authenticated"}',true);
set local role authenticated;
update public.jurisprudence set reasoning=reasoning||' Revisión posterior.' where work_id=:'judicial_work_id';
select pg_temp.assert_true((select seo_level='B' and analysis_state='draft' and approved_by is null from public.jurisprudence where work_id=:'judicial_work_id'),'editing revokes SEO approval');
select pg_temp.assert_true((select editorial_status='draft' from public.works where id=:'judicial_work_id'),'editing unpublishes case');
update public.jurisprudence set official_url='https://www.csjn.gov.ar/prueba-local/2' where work_id=:'judicial_work_id';
select pg_temp.assert_true((select official_verified_at is null from public.jurisprudence where work_id=:'judicial_work_id'),'changing official URL clears prior verification');
reset role;
rollback;
\echo 'PASS: local PostgreSQL jurisprudence A/B/C, search filters, official-link gate, admin-only review, approval revocation.'
