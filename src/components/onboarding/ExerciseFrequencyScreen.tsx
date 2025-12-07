import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const frequencies = [
  { id: '0-1', label: '0–1 days', description: 'Rarely or never' },
  { id: '2-3', label: '2–3 days', description: 'A few times per week' },
  { id: '4-5', label: '4–5 days', description: 'Most days of the week' },
  { id: '6-7', label: '6–7 days', description: 'Almost every day' },
];

export function ExerciseFrequencyScreen() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleSelect = (frequencyId: string) => {
    updateData({ exerciseFrequency: frequencyId });
  };

  const handleContinue = () => {
    if (data.exerciseFrequency) {
      setCurrentStep(5);
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
        <button 
          onClick={() => setCurrentStep(3)}
          className="flex items-center gap-1 text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-2">How often do you exercise?</h1>
        <p className="text-muted-foreground mb-8">Tell us about your typical week of workouts.</p>

        <div className="space-y-3">
          {frequencies.map((freq, index) => {
            const isSelected = data.exerciseFrequency === freq.id;
            
            return (
              <motion.button
                key={freq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(freq.id)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all",
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <h3 className="font-semibold mb-1">{freq.label}</h3>
                <p className="text-sm text-muted-foreground">{freq.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button 
          size="xl" 
          className="w-full"
          disabled={!data.exerciseFrequency}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
