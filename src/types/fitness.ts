export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type FitnessGoal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'desi_strength'
  | 'endurance'
  | 'yoga_mobility';

export type EquipmentOption =
  | 'desi_akhada_bodyweight'
  | 'dumbbells_only'
  | 'full_gym'
  | 'resistance_bands'
  | 'home_household';

export type CoachPersonaId = 'yashvant' | 'ananya' | 'dr_rohan';

export interface CoachPersona {
  id: CoachPersonaId;
  name: string;
  title: string;
  avatar: string;
  style: string;
  badge: string;
  voicePitch: number;
  voiceRate: number;
  description: string;
  mantra: string;
}

export type IndianDietPreference =
  | 'high_protein_veg'
  | 'pure_veg'
  | 'eggetarian'
  | 'non_veg'
  | 'jain';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weightKg: number;
  heightCm: number;
  fitnessLevel: FitnessLevel;
  primaryGoal: FitnessGoal;
  targetWeightKg?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  dietaryPreference: IndianDietPreference;
  streakDays: number;
  lastActiveDate: string;
  waterGlassesToday: number;
  caloriesBurnedToday: number;
  totalWorkoutsCompleted: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  subtitle?: string;
  targetMuscle: string;
  secondaryMuscles?: string[];
  sets: number;
  reps: string;
  restSecs: number;
  formTips: string[];
  commonMistakes: string[];
  difficulty: FitnessLevel;
  equipment: EquipmentOption;
  isDesi?: boolean;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  level: FitnessLevel;
  goal: FitnessGoal;
  durationMinutes: number;
  estimatedCaloriesBurn: number;
  equipment: EquipmentOption;
  exercises: ExerciseItem[];
  tags: string[];
  createdAt: string;
}

export interface MealItem {
  id: string;
  title: string;
  subtitle?: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Evening Snack' | 'Post-Workout Fuel';
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  prepTimeMinutes: number;
  servingSize?: string;
  ingredients: string[];
  instructions: string;
  desiSuperfoodTag?: string;
}

export interface DailyMealPlan {
  id: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: MealItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach' | 'system';
  coachId?: CoachPersonaId;
  text: string;
  timestamp: string;
  actionablePlan?: WorkoutRoutine;
  actionableMeal?: MealItem;
}

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  voiceFeedbackEnabled: boolean;
  soundEffectsEnabled: boolean;
  activeCoachId: CoachPersonaId;
  theme: 'black';
}

export interface WorkoutHistoryEntry {
  id: string;
  workoutId: string;
  title: string;
  date: string;
  durationMinutes: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  totalExercises: number;
}
