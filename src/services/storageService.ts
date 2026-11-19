import {
  UserProfile,
  AppSettings,
  WorkoutRoutine,
  WorkoutHistoryEntry,
  ChatMessage,
  DailyMealPlan
} from '../types/fitness';
import { INITIAL_PRESET_WORKOUTS } from '../data/presetWorkouts';
import { PRESET_MEALS } from '../data/presetMeals';

const STORAGE_KEYS = {
  PROFILE: 'fitcoach_user_profile',
  SETTINGS: 'fitcoach_app_settings',
  ROUTINES: 'fitcoach_saved_routines',
  HISTORY: 'fitcoach_workout_history',
  CHAT: 'fitcoach_chat_messages',
  MEALPLAN: 'fitcoach_daily_meal_plan',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Boss',
  age: 20,
  gender: 'male',
  weightKg: 80,
  heightCm: 182,
  fitnessLevel: 'intermediate',
  primaryGoal: 'muscle_gain',
  targetWeightKg: 90,
  activityLevel: 'moderate',
  dietaryPreference: 'high_protein_veg',
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  waterGlassesToday: 5,
  caloriesBurnedToday: 380,
  totalWorkoutsCompleted: 12,
};

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  voiceFeedbackEnabled: true,
  soundEffectsEnabled: true,
  activeCoachId: 'yashvant',
  theme: 'black',
};

export const storageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) return DEFAULT_PROFILE;
      const parsed = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastActiveDate !== today) {
        parsed.waterGlassesToday = 0;
        parsed.caloriesBurnedToday = 0;
        parsed.lastActiveDate = today;
      }
      return { ...DEFAULT_PROFILE, ...parsed };
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getRoutines(): WorkoutRoutine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (!data) {
        this.saveRoutines(INITIAL_PRESET_WORKOUTS);
        return INITIAL_PRESET_WORKOUTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PRESET_WORKOUTS;
    }
  },

  saveRoutines(routines: WorkoutRoutine[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    } catch (e) {
      console.error('Failed to save routines', e);
    }
  },

  getHistory(): WorkoutHistoryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  logCompletedWorkout(entry: WorkoutHistoryEntry): void {
    const history = this.getHistory();
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

    const profile = this.getProfile();
    profile.caloriesBurnedToday += entry.caloriesBurned;
    profile.totalWorkoutsCompleted += 1;
    this.saveProfile(profile);
  },

  getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat', e);
    }
  },

  getMealPlan(): DailyMealPlan {
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEALPLAN);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === today) return parsed;
      }
    } catch {
      // fallback
    }

    const defaultPlan: DailyMealPlan = {
      id: `mealplan-${today}`,
      date: today,
      targetCalories: 2450,
      targetProtein: 155,
      targetCarbs: 270,
      targetFat: 60,
      totalCalories: PRESET_MEALS.reduce((acc, m) => acc + m.calories, 0),
      totalProtein: PRESET_MEALS.reduce((acc, m) => acc + m.proteinG, 0),
      totalCarbs: PRESET_MEALS.reduce((acc, m) => acc + m.carbsG, 0),
      totalFat: PRESET_MEALS.reduce((acc, m) => acc + m.fatG, 0),
      meals: PRESET_MEALS,
    };
    return defaultPlan;
  },

  saveMealPlan(plan: DailyMealPlan): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEALPLAN, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save meal plan', e);
    }
  }
};
