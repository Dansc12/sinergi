import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const FREQUENCY_OPTIONS = [
  { label: '0–1 days', value: '0-1', bump: 0.00 },
  { label: '2–3 days', value: '2-3', bump: 0.05 },
  { label: '4–5 days', value: '4-5', bump: 0.10 },
  { label: '6+ days', value: '6+', bump: 0.15 },
];

export function ExerciseFrequencyScreen() {
  const { data, updateData, goBack, setCurrentStep, isEditingFromTargets, setIsEditingFromTargets } = useOnboarding();
  const [selectedValue, setSelectedValue] = useState<string>(() => {
    return data.exerciseFrequency || '';
  });

  const handleSelect = (value: string, bump: number) => {
    setSelectedValue(value);
    updateData({
      exerciseFrequency: value,
      exerciseBump: bump,
    });
  };

  const handleContinue = async () => {
    if (!selectedValue) return;

    const option = FREQUENCY_OPTIONS.find(o => o.value === selectedValue);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && option) {
      await supabase
        .from('profiles')
        .update({ 
          exercise_frequency: option.value,
        })
        .eq('user_id', user.id);
    }

    if (isEditingFromTargets) {
      setIsEditingFromTargets(false);
      setCurrentStep('calculate_targets');
    } else {
      setCurrentStep('goal_weight');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen"
    >
      <OnboardingProgress />
      
      <div className="flex-1 px-6 py-8">
        {!isEditingFromTargets && (
          <button 
            onClick={goBack}
            className="flex items-center gap-1 text-muted-foreground mb-6 hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
        )}

        <h1 className="text-2xl font-bold mb-2">How many days per week do you usually work out?</h1>
        <p className="text-muted-foreground mb-8">
          Just a typical week — you can change this anytime.
        </p>

        <div className="space-y-3">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value, option.bump)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between",
                selectedValue === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <span className="font-semibold">{option.label}</span>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                selectedValue === option.value ? "border-primary bg-primary" : "border-muted-foreground"
              )}>
                {selectedValue === option.value && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button 
          size="xl" 
          className="w-full"
          disabled={!selectedValue}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
