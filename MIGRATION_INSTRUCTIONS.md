# Database Migration Required

## Issue
The reply feature in group chat requires a new column `reply_to` in the `group_messages` table, but this column doesn't exist yet in your Supabase database.

## Solution
You need to run the migration in your Supabase SQL Editor:

### Steps:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/slsdltptkzrfzzcoqxjw
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Add reply_to column to group_messages table
ALTER TABLE public.group_messages 
ADD COLUMN reply_to UUID;

-- Add foreign key constraint
ALTER TABLE public.group_messages 
ADD CONSTRAINT fk_group_messages_reply_to 
FOREIGN KEY (reply_to) REFERENCES public.group_messages(id) ON DELETE SET NULL;

-- Add index for better performance on reply queries
CREATE INDEX IF NOT EXISTS idx_group_messages_reply_to ON public.group_messages(reply_to);
```

5. Click **Run** to execute the migration
6. Refresh your application - the reply feature should now work properly!

## What This Does
- Adds a `reply_to` column that can reference another message ID
- Sets up proper foreign key relationships
- Adds an index for better query performance
- Allows messages to be replies to other messages

## Fallback Handling
The code already includes fallback handling, so even if the migration hasn't been run yet:
- New messages will still be sent (just without reply relationships)
- Existing functionality continues to work
- No errors will occur

Once you run the migration, the reply feature will be fully functional!