-- 1. Create helper function to check membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(group_id UUID, user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = $1
    AND group_members.user_id = $2
  );
END;
$$;

-- 2. Drop old groups policies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups;

-- 3. Create updated groups policies
CREATE POLICY "Users can view groups they are members of"
ON public.groups FOR SELECT
USING (
  created_by = auth.uid() OR public.is_group_member(id, auth.uid())
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


-- 4. Drop old group members policies
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- 5. Create updated group members policies
CREATE POLICY "Users can view group members of their groups"
ON public.group_members FOR SELECT
USING (
  public.is_group_member(group_id, auth.uid())
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


-- 6. Drop old group messages policies
DROP POLICY IF EXISTS "Users can view messages in their groups" ON public.group_messages;
DROP POLICY IF EXISTS "Users can send messages in their groups" ON public.group_messages;

-- 7. Create updated group messages policies
CREATE POLICY "Users can view messages in their groups"
ON public.group_messages FOR SELECT
USING (
  public.is_group_member(group_id, auth.uid())
);

CREATE POLICY "Users can send messages in their groups"
ON public.group_messages FOR INSERT
WITH CHECK (
  public.is_group_member(group_id, auth.uid())
);
