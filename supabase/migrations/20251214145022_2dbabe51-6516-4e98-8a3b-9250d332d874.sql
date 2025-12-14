-- Create meal_logs table for tracking logged meals
CREATE TABLE public.meal_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  foods JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_calories INTEGER DEFAULT 0,
  total_protein NUMERIC(10,2) DEFAULT 0,
  total_carbs NUMERIC(10,2) DEFAULT 0,
  total_fat NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_logs table for tracking logged workouts
CREATE TABLE public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create water_logs table for tracking water intake
CREATE TABLE public.water_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  glasses INTEGER NOT NULL DEFAULT 0,
  target_glasses INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_streaks table for tracking streak data
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_log_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_logs
CREATE POLICY "Users can view their own meal logs" ON public.meal_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meal logs" ON public.meal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal logs" ON public.meal_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal logs" ON public.meal_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for workout_logs
CREATE POLICY "Users can view their own workout logs" ON public.workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workout logs" ON public.workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout logs" ON public.workout_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workout logs" ON public.workout_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for water_logs
CREATE POLICY "Users can view their own water logs" ON public.water_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own water logs" ON public.water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own water logs" ON public.water_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own water logs" ON public.water_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_streaks
CREATE POLICY "Users can view their own streak" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streak" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streak" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_meal_logs_updated_at BEFORE UPDATE ON public.meal_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workout_logs_updated_at BEFORE UPDATE ON public.workout_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_water_logs_updated_at BEFORE UPDATE ON public.water_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();