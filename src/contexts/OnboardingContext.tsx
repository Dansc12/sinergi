import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
  // Step 2: Primary Goal
  primaryGoal: string;
  
  // Step 3: Activity Level
  activityLevel: string;
  
  // Step 4: Exercise Frequency
  exerciseFrequency: string;
  
  // Step 5: Personal Details
  biologicalSex: 'male' | 'female' | '';
  birthdate: Date | null;
  zipCode: string;
  
  // Step 6: Body Stats
  heightFeet: number;
  heightInches: number;
  currentWeight: number;
  goalWeight: number;
  
  // Step 7: Weight Loss Rate (conditional)
  weightLossRate: string;
  
  // Step 8: Hobbies
  hobbies: string[];
  
  // Step 9: Account Creation
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  
  // Step 10: Profile Photo
  avatarUrl: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const defaultData: OnboardingData = {
  primaryGoal: '',
  activityLevel: '',
  exerciseFrequency: '',
  biologicalSex: '',
  birthdate: null,
  zipCode: '',
  heightFeet: 5,
  heightInches: 6,
  currentWeight: 150,
  goalWeight: 140,
  weightLossRate: '1.0',
  hobbies: [],
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  avatarUrl: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children, isAuthenticated = false }: { children: ReactNode; isAuthenticated?: boolean }) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Total steps depends on authentication status and goal
  // Authenticated users skip account creation step
  const getTotalSteps = () => {
    if (isAuthenticated) {
      return data.primaryGoal === 'weight_loss' ? 10 : 9;
    }
    return data.primaryGoal === 'weight_loss' ? 11 : 10;
  };
  
  const totalSteps = getTotalSteps();

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, currentStep, setCurrentStep, totalSteps }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
