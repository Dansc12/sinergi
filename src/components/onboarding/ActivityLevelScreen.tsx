import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const activityLevels = [
  {
    id: 'not_very_active',
    title: 'Not very active',
    description: 'Mostly sitting throughout the day (desk job, minimal movement)',
  },
  {
    id: 'lightly_active',
    title: 'Lightly active',
    description: 'Light movement during the day (occasional walking, light chores)',
  },
  {
    id: 'active',
    title: 'Active',
    description: 'On your feet most of the day (retail, teaching, moderate activity)',
  },
  {
    id: 'very_active',
    title: 'Very active',
    description: 'Physically demanding job or lots of movement throughout the day',
  },
];

export function ActivityLevelScreen() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleSelect = (levelId: string) => {
    updateData({ activityLevel: levelId });
  };

  const handleContinue = () => {
    if (data.activityLevel) {
      setCurrentStep(4);
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
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-1 text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-2">How active is your daily life?</h1>
        <p className="text-muted-foreground mb-8">Not including intentional exercise—just your baseline activity.</p>

        <div className="space-y-3">
          {activityLevels.map((level, index) => {
            const isSelected = data.activityLevel === level.id;
            
            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(level.id)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all",
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <h3 className="font-semibold mb-1">{level.title}</h3>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button 
          size="xl" 
          className="w-full"
          disabled={!data.activityLevel}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
