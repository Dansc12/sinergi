-- Update RLS policy for user_streaks to allow anyone to view streaks
DROP POLICY IF EXISTS "Users can view their own streak" ON public.user_streaks;

CREATE POLICY "Anyone can view streaks" 
ON public.user_streaks 
FOR SELECT 
USING (true);