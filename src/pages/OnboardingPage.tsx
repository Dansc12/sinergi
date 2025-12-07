import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { GoalSelectionScreen } from '@/components/onboarding/GoalSelectionScreen';
import { ActivityLevelScreen } from '@/components/onboarding/ActivityLevelScreen';
import { ExerciseFrequencyScreen } from '@/components/onboarding/ExerciseFrequencyScreen';
import { PersonalDetailsScreen } from '@/components/onboarding/PersonalDetailsScreen';
import { BodyStatsScreen } from '@/components/onboarding/BodyStatsScreen';
import { WeightLossRateScreen } from '@/components/onboarding/WeightLossRateScreen';
import { HobbiesScreen } from '@/components/onboarding/HobbiesScreen';
import { AccountCreationScreen } from '@/components/onboarding/AccountCreationScreen';
import { ProfilePhotoScreen } from '@/components/onboarding/ProfilePhotoScreen';
import { CompletionScreen } from '@/components/onboarding/CompletionScreen';
import { AnimatePresence } from 'framer-motion';

function OnboardingFlow() {
  const { currentStep, data } = useOnboarding();

  const getActualStep = () => {
    // If not weight loss goal and we're past step 6, adjust step numbers
    if (data.primaryGoal !== 'weight_loss' && currentStep >= 7) {
      return currentStep + 1; // Skip weight loss rate screen
    }
    return currentStep;
  };

  const renderStep = () => {
    const step = getActualStep();
    
    switch (currentStep) {
      case 1: return <WelcomeScreen />;
      case 2: return <GoalSelectionScreen />;
      case 3: return <ActivityLevelScreen />;
      case 4: return <ExerciseFrequencyScreen />;
      case 5: return <PersonalDetailsScreen />;
      case 6: return <BodyStatsScreen />;
      case 7: return data.primaryGoal === 'weight_loss' ? <WeightLossRateScreen /> : <HobbiesScreen />;
      case 8: return data.primaryGoal === 'weight_loss' ? <HobbiesScreen /> : <AccountCreationScreen />;
      case 9: return data.primaryGoal === 'weight_loss' ? <AccountCreationScreen /> : <ProfilePhotoScreen />;
      case 10: return data.primaryGoal === 'weight_loss' ? <ProfilePhotoScreen /> : <CompletionScreen />;
      case 11: return <CompletionScreen />;
      default: return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}
