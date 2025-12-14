import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { supabase } from '@/integrations/supabase/client';

function OnboardingFlow() {
  const navigate = useNavigate();
  const { currentStep, data, setCurrentStep } = useOnboarding();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        // Check if onboarding is already complete
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          navigate("/", { replace: true });
          return;
        }
      }
      
      setIsCheckingAuth(false);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // For authenticated users, we skip the account creation step
  // Steps for authenticated users: 1-8 (welcome, goal, activity, exercise, personal, body, [weight loss rate], hobbies), then 9 (photo), 10 (completion)
  // Steps for unauthenticated users: normal flow with account creation
  
  const renderStep = () => {
    if (isAuthenticated) {
      // Skip account creation for already authenticated users
      switch (currentStep) {
        case 1: return <WelcomeScreen />;
        case 2: return <GoalSelectionScreen />;
        case 3: return <ActivityLevelScreen />;
        case 4: return <ExerciseFrequencyScreen />;
        case 5: return <PersonalDetailsScreen />;
        case 6: return <BodyStatsScreen />;
        case 7: return data.primaryGoal === 'weight_loss' ? <WeightLossRateScreen /> : <HobbiesScreen />;
        case 8: return data.primaryGoal === 'weight_loss' ? <HobbiesScreen /> : <ProfilePhotoScreen isAuthenticated />;
        case 9: return data.primaryGoal === 'weight_loss' ? <ProfilePhotoScreen isAuthenticated /> : <CompletionScreen />;
        case 10: return <CompletionScreen />;
        default: return <WelcomeScreen />;
      }
    } else {
      // Full flow with account creation for new users
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
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuth(!!session?.user);
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <OnboardingProvider isAuthenticated={isAuth}>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}
