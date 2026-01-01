-- Add groups table for group chat
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Add group messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Users can view groups they are members of"
ON public.groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups"
ON public.groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
ON public.groups FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
ON public.groups FOR DELETE
USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group members of their groups"
ON public.group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can add members"
ON public.group_members FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
);

CREATE POLICY "Users can leave groups"
ON public.group_members FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
);

-- Group messages policies
CREATE POLICY "Users can view messages in their groups"
ON public.group_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their groups"
ON public.group_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

-- Add trigger for groups updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();