-- Add reply_to column to group_messages table
ALTER TABLE public.group_messages 
ADD COLUMN reply_to UUID;

-- Add foreign key constraint
ALTER TABLE public.group_messages 
ADD CONSTRAINT fk_group_messages_reply_to 
FOREIGN KEY (reply_to) REFERENCES public.group_messages(id) ON DELETE SET NULL;

-- Add index for better performance on reply queries
CREATE INDEX IF NOT EXISTS idx_group_messages_reply_to ON public.group_messages(reply_to);