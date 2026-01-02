-- Create set_muscle_volume table for pre-computed allocated tonnage per muscle per set
CREATE TABLE public.set_muscle_volume (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  exercise_name TEXT NOT NULL,
  set_index INTEGER NOT NULL,
  primary_group TEXT NOT NULL,
  muscle TEXT NOT NULL,
  allocated_tonnage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.set_muscle_volume ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own set_muscle_volume" 
ON public.set_muscle_volume 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own set_muscle_volume" 
ON public.set_muscle_volume 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own set_muscle_volume" 
ON public.set_muscle_volume 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own set_muscle_volume" 
ON public.set_muscle_volume 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for efficient querying
CREATE INDEX idx_set_muscle_volume_user_date ON public.set_muscle_volume(user_id, log_date);
CREATE INDEX idx_set_muscle_volume_primary_group ON public.set_muscle_volume(user_id, primary_group);
CREATE INDEX idx_set_muscle_volume_muscle ON public.set_muscle_volume(user_id, muscle);
CREATE INDEX idx_set_muscle_volume_workout ON public.set_muscle_volume(workout_log_id);