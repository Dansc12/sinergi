import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { calculateDailyCalorieTarget } from '@/lib/calorieCalculations';

export function CompletionScreen() {
  const { data } = useOnboarding();
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(true);
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);

  useEffect(() => {
    const calculateAndSave = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Calculate daily calorie target
        const target = calculateDailyCalorieTarget({
          biologicalSex: data.biologicalSex as 'male' | 'female',
          weightLbs: data.currentWeight,
          heightFeet: data.heightFeet,
          heightInches: data.heightInches,
          birthdate: data.birthdate!,
          activityLevel: data.activityLevel,
          primaryGoal: data.primaryGoal,
          weightLossRate: data.weightLossRate,
        });

        setCalorieTarget(target);

        // Save to database and mark onboarding as complete
        const { error } = await supabase
          .from('profiles')
          .update({
            daily_calorie_target: target,
            onboarding_completed: true,
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error: any) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save your profile');
      } finally {
        setIsCalculating(false);
      }
    };

    calculateAndSave();
  }, [data]);

  const handleGoToDashboard = () => {
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
    >
      {isCalculating ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-8"
          >
            <Loader2 className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Calculating your targets...</h1>
          <p className="text-muted-foreground">We're personalizing your experience.</p>
        </>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8"
          >
            <CheckCircle className="w-14 h-14 text-green-500" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-3"
          >
            You're all set!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Welcome to Sinergi, {data.firstName}!
          </motion.p>

          {calorieTarget && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 mb-8 w-full max-w-sm"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles size={20} className="text-primary" />
                <span className="text-sm text-muted-foreground">Your Daily Calorie Target</span>
              </div>
              <p className="text-4xl font-bold text-primary">{calorieTarget.toLocaleString()}</p>
              <p className="text-muted-foreground text-sm">calories per day</p>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-xs"
          >
            <Button 
              size="xl" 
              className="w-full"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </Button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
