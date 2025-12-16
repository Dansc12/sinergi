-- Drop existing problematic policies
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.groups;
DROP POLICY IF EXISTS "Users can view group members of groups they can see" ON public.group_members;

-- Recreate groups SELECT policy without circular reference
CREATE POLICY "Public groups are viewable by everyone" 
ON public.groups 
FOR SELECT 
USING (
  visibility = 'public'
  OR creator_id = auth.uid()
);

-- Recreate group_members SELECT policy without circular reference
CREATE POLICY "Users can view group members of groups they can see" 
ON public.group_members 
FOR SELECT 
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
    AND (g.visibility = 'public' OR g.creator_id = auth.uid())
  )
);