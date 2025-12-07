// Mifflin-St Jeor Equation for BMR calculation
export interface CalorieCalculationInput {
  biologicalSex: 'male' | 'female';
  weightLbs: number;
  heightFeet: number;
  heightInches: number;
  birthdate: Date;
  activityLevel: string;
  primaryGoal: string;
  weightLossRate?: string;
}

// Activity level multipliers
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  'not_very_active': 1.2,
  'lightly_active': 1.375,
  'active': 1.55,
  'very_active': 1.725,
};

// Weight loss calorie deficits (per week rate)
const WEIGHT_LOSS_DEFICITS: Record<string, number> = {
  '0.5': 250,  // 0.5 lbs/week
  '1.0': 500,  // 1.0 lbs/week
  '1.5': 750,  // 1.5 lbs/week
  '2.0': 1000, // 2.0 lbs/week
};

export function calculateAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  
  return age;
}

export function calculateBMR(input: CalorieCalculationInput): number {
  // Convert weight from lbs to kg
  const weightKg = input.weightLbs * 0.453592;
  
  // Convert height to cm
  const totalInches = (input.heightFeet * 12) + input.heightInches;
  const heightCm = totalInches * 2.54;
  
  // Calculate age
  const age = calculateAge(input.birthdate);
  
  // Mifflin-St Jeor Equation
  // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  
  if (input.biologicalSex === 'male') {
    return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
  } else {
    return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateDailyCalorieTarget(input: CalorieCalculationInput): number {
  const bmr = calculateBMR(input);
  const tdee = calculateTDEE(bmr, input.activityLevel);
  
  let calorieTarget = tdee;
  
  switch (input.primaryGoal) {
    case 'weight_loss':
      const deficit = WEIGHT_LOSS_DEFICITS[input.weightLossRate || '1.0'] || 500;
      calorieTarget = tdee - deficit;
      break;
    case 'muscle_gain':
      calorieTarget = tdee + 250;
      break;
    case 'strength':
    case 'health':
    default:
      // Maintenance - keep at TDEE
      break;
  }
  
  // Ensure minimum safe calorie intake
  const minimumCalories = input.biologicalSex === 'male' ? 1500 : 1200;
  return Math.max(calorieTarget, minimumCalories);
}
