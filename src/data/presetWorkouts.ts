import { WorkoutRoutine } from '../types/fitness';
import { EXERCISE_DATABASE } from './exerciseLibrary';

export const INITIAL_PRESET_WORKOUTS: WorkoutRoutine[] = [
  {
    id: 'routine-desi-akhada',
    title: 'Indian Athletic Power & Conditioning',
    subtitle: 'High-Volume Hindu Dand & Baithak Flow',
    description: 'Traditional athletic power routine: High-volume Hindu Pushups (Sapate), Hindu Squats (Baithak), and Kumbhak Core Endurance.',
    level: 'intermediate',
    goal: 'desi_strength',
    durationMinutes: 30,
    estimatedCaloriesBurn: 320,
    equipment: 'desi_akhada_bodyweight',
    tags: ['Athletic Power', 'Bodyweight', 'No Equipment', 'Functional Strength'],
    createdAt: new Date().toISOString(),
    exercises: [
      EXERCISE_DATABASE.find((e) => e.id === 'ex-desi-dand')!,
      EXERCISE_DATABASE.find((e) => e.id === 'ex-desi-baithak')!,
      EXERCISE_DATABASE.find((e) => e.id === 'ex-desi-kumbhak-plank')!,
    ]
  },
  {
    id: 'routine-surya-flow',
    title: 'Morning Sun Salutation & Prana Flow',
    subtitle: 'Vedic 12-Step Mobility & Core Activation',
    description: 'Awaken full-body joint mobility, spinal flexibility, and metabolic vitality through synchronized sun salutation cycles.',
    level: 'beginner',
    goal: 'yoga_mobility',
    durationMinutes: 20,
    estimatedCaloriesBurn: 180,
    equipment: 'desi_akhada_bodyweight',
    tags: ['Yoga Flow', 'Sun Salutation', 'Mobility', 'Recovery'],
    createdAt: new Date().toISOString(),
    exercises: [
      EXERCISE_DATABASE.find((e) => e.id === 'ex-surya-namaskar')!,
      EXERCISE_DATABASE.find((e) => e.id === 'ex-desi-kumbhak-plank')!,
    ]
  },
  {
    id: 'routine-desi-hypertrophy',
    title: 'Chest, Arms & Biceps Mass Builder',
    subtitle: 'Home Dumbbell & Bodyweight Hypertrophy',
    description: 'Upper body hypertrophy blast combining strict pushups, dumbbell bicep curls, and deep squats for maximum muscle gain.',
    level: 'intermediate',
    goal: 'muscle_gain',
    durationMinutes: 35,
    estimatedCaloriesBurn: 280,
    equipment: 'dumbbells_only',
    tags: ['Upper Body', 'Biceps', 'Chest', 'Hypertrophy'],
    createdAt: new Date().toISOString(),
    exercises: [
      EXERCISE_DATABASE.find((e) => e.id === 'ex-pushup')!,
      EXERCISE_DATABASE.find((e) => e.id === 'ex-bicep-curl')!,
      EXERCISE_DATABASE.find((e) => e.id === 'ex-squat')!,
      EXERCISE_DATABASE.find((e) => e.id === 'ex-desi-kumbhak-plank')!,
    ]
  }
];
