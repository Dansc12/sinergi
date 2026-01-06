import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const ACTIVITY_OPTIONS = [
  {
    label: 'Mostly sitting',
    multiplier: 1.20,
    examples: 'Software/office desk job, accountant, call center rep, driver with long sitting hours',
  },
  {
    label: 'Sitting + some walking',
    multiplier: 1.29,
    examples: 'Office job with regular walking/errands, school admin, store manager, healthcare admin',
  },
  {
    label: 'On your feet a lot',
    multiplier: 1.375,
    examples: 'Teacher, retail associate, server/bartender, nurse, line cook',
  },
  {
    label: 'Active day',
    multiplier: 1.46,
    examples: 'Warehouse picker, mail/package delivery, stocker, mechanic, hospitality with constant movement',
  },
  {
    label: 'Very physical job',
    multiplier: 1.55,
    examples: 'Construction laborer, landscaper, mover, farm work, roofing',
  },
];

export function DailyActivityScreen() {
  const { data, updateData, goBack, setCurrentStep, isEditingFromTargets, setIsEditingFromTargets } = useOnboarding();
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    // Find existing selection by multiplier
    if (data.activityMultiplier) {
      const idx = ACTIVITY_OPTIONS.findIndex(o => o.multiplier === data.activityMultiplier);
      return idx >= 0 ? idx : -1;
    }
    return -1;
  });

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    const option = ACTIVITY_OPTIONS[index];
    updateData({
      activityMultiplier: option.multiplier,
      activityLevelLabel: option.label,
    });
  };

  const handleContinue = async () => {
    if (selectedIndex < 0) return;

    const option = ACTIVITY_OPTIONS[selectedIndex];
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ 
          activity_level: option.label,
        })
        .eq('user_id', user.id);
    }

    if (isEditingFromTargets) {
      setIsEditingFromTargets(false);
      setCurrentStep('calculate_targets');
    } else {
      setCurrentStep('exercise_frequency');
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

        <h1 className="text-2xl font-bold mb-2">How active are you on a typical day?</h1>
        <p className="text-muted-foreground mb-6">
          Think about your normal day outside of workouts — this helps us estimate calories more accurately.
        </p>

        <div className="space-y-3">
          {ACTIVITY_OPTIONS.map((option, index) => (
            <button
              key={option.label}
              onClick={() => handleSelect(index)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                selectedIndex === index
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{option.label}</span>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  selectedIndex === index ? "border-primary bg-primary" : "border-muted-foreground"
                )}>
                  {selectedIndex === index && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{option.examples}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button 
          size="xl" 
          className="w-full"
          disabled={selectedIndex < 0}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
