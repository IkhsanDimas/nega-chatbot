-- Query untuk mengecek apakah kolom reply_to sudah ada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'group_messages' 
AND table_schema = 'public'
AND column_name = 'reply_to';

-- Query untuk mengecek constraint yang ada
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'group_messages' 
AND table_schema = 'public'
AND constraint_name = 'fk_group_messages_reply_to';

-- Query untuk mengecek index yang ada
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'group_messages' 
AND indexname = 'idx_group_messages_reply_to';