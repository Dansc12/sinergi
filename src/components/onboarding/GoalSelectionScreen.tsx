import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { motion } from 'framer-motion';
import { Target, Dumbbell, Zap, Heart, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const goals = [
  {
    id: 'weight_loss',
    title: 'Weight / Fat Loss',
    description: 'Lose weight and reduce body fat while maintaining muscle',
    icon: Target,
  },
  {
    id: 'muscle_gain',
    title: 'Muscle Gain / Toning',
    description: 'Build lean muscle mass and improve body composition',
    icon: Dumbbell,
  },
  {
    id: 'strength',
    title: 'Increase Strength',
    description: 'Get stronger and improve your lifting performance',
    icon: Zap,
  },
  {
    id: 'health',
    title: 'Improve Overall Health',
    description: 'Focus on general wellness, energy, and feeling better',
    icon: Heart,
  },
];

export function GoalSelectionScreen() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleSelect = (goalId: string) => {
    updateData({ primaryGoal: goalId });
  };

  const handleContinue = () => {
    if (data.primaryGoal) {
      setCurrentStep(3);
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
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-1 text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-2">What's your primary goal?</h1>
        <p className="text-muted-foreground mb-8">Choose the goal that matters most to you right now.</p>

        <div className="space-y-3">
          {goals.map((goal, index) => {
            const Icon = goal.icon;
            const isSelected = data.primaryGoal === goal.id;
            
            return (
              <motion.button
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(goal.id)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all",
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button 
          size="xl" 
          className="w-full"
          disabled={!data.primaryGoal}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
