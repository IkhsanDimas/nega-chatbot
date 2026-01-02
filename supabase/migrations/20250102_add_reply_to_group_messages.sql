-- Add reply_to column to group_messages table
ALTER TABLE public.group_messages 
ADD COLUMN reply_to UUID REFERENCES public.group_messages(id) ON DELETE SET NULL;

-- Add index for better performance on reply queries
CREATE INDEX idx_group_messages_reply_to ON public.group_messages(reply_to);

-- Update RLS policies to include reply_to in select
DROP POLICY IF EXISTS "Users can view messages in their groups" ON public.group_messages;

CREATE POLICY "Users can view messages in their groups"
ON public.group_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  )
);