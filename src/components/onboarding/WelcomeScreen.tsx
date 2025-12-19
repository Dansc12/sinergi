import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WelcomeScreen() {
  const { setCurrentStep } = useOnboarding();
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-[80vh] px-6"
    >
      <button
        onClick={() => navigate('/auth')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 mt-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="flex flex-col items-center justify-center flex-1 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-8 glow-primary"
        >
          <Sparkles className="w-12 h-12 text-primary-foreground" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold mb-4"
        >
          Welcome to Sinergi
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground mb-12 max-w-sm"
        >
          Track your fitness and nutrition with a supportive community.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs"
        >
          <Button 
            size="xl" 
            className="w-full"
            onClick={() => setCurrentStep(2)}
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
