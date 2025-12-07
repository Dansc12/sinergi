import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const rates = [
  { id: '0.5', label: '0.5 lbs/week', description: 'Easy & sustainable pace', tag: 'Slow' },
  { id: '1.0', label: '1.0 lbs/week', description: 'Balanced approach', tag: 'Recommended' },
  { id: '1.5', label: '1.5 lbs/week', description: 'Faster results', tag: 'Moderate' },
  { id: '2.0', label: '2.0 lbs/week', description: 'Maximum safe rate', tag: 'Aggressive' },
];

export function WeightLossRateScreen() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleSelect = (rateId: string) => {
    updateData({ weightLossRate: rateId });
  };

  const handleContinue = () => {
    if (data.weightLossRate) {
      setCurrentStep(8);
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
          onClick={() => setCurrentStep(6)}
          className="flex items-center gap-1 text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-2">Your weight loss pace</h1>
        <p className="text-muted-foreground mb-8">Choose a sustainable rate that works for your lifestyle.</p>

        <div className="space-y-3">
          {rates.map((rate, index) => {
            const isSelected = data.weightLossRate === rate.id;
            const isRecommended = rate.id === '1.0';
            
            return (
              <motion.button
                key={rate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(rate.id)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all relative",
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{rate.label}</h3>
                    <p className="text-sm text-muted-foreground">{rate.description}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    isRecommended 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {rate.tag}
                  </span>
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
          disabled={!data.weightLossRate}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
