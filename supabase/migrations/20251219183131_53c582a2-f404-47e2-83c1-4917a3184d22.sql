-- Create custom_exercises table for user-defined exercises
CREATE TABLE public.custom_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  is_cardio BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own custom exercises"
ON public.custom_exercises
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom exercises"
ON public.custom_exercises
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom exercises"
ON public.custom_exercises
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom exercises"
ON public.custom_exercises
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_exercises_updated_at
BEFORE UPDATE ON public.custom_exercises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();