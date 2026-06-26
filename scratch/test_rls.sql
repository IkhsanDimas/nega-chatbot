BEGIN;
SELECT set_config('request.jwt.claims', '{"sub": "a12ce5bc-1cdb-40a7-8cf2-065b48ac4ce5"}', true);
SELECT gm.*, g.name AS group_name, g.created_by AS group_creator
FROM public.group_members gm
LEFT JOIN public.groups g ON g.id = gm.group_id;
COMMIT;
