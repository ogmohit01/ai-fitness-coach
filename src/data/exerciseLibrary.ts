import { ExerciseItem } from '../types/fitness';

export const EXERCISE_DATABASE: ExerciseItem[] = [
  {
    id: 'ex-desi-baithak',
    name: 'Hindu Squats (Desi Baithak)',
    subtitle: 'Traditional Indian Deep Squats',
    targetMuscle: 'Quads, Calves & Knee Tendons',
    secondaryMuscles: ['Glutes', 'Core', 'Cardiovascular Stamina'],
    sets: 4,
    reps: '25 - 40 reps',
    restSecs: 45,
    formTips: [
      'Swing arms back on inhalation, then swing forward and up as you descend onto the balls of your feet.',
      'Maintain an upright spine; keep your chest proud and core braced.',
      'Exhale forcefully as you drive up through the balls of your feet to full lockout.',
      'Builds legendary leg endurance and bulletproof knee joint integrity.'
    ],
    commonMistakes: [
      'Rushing the tempo without achieving full bottom depth.',
      'Losing rhythmic breathing — sync breath with arm pendulum swing.',
      'Slamming heels violently into the floor.'
    ],
    difficulty: 'beginner',
    equipment: 'desi_akhada_bodyweight',
    isDesi: true
  },
  {
    id: 'ex-desi-dand',
    name: 'Hindu Pushups (Desi Dand / Sapate)',
    subtitle: 'Full Body Athletic Pushup Flow',
    targetMuscle: 'Chest, Shoulders & Triceps',
    secondaryMuscles: ['Spine Extensors', 'Core Plank', 'Hamstring Flexibility'],
    sets: 4,
    reps: '15 - 20 reps',
    restSecs: 60,
    formTips: [
      'Start in a high downward dog (inverted V) with hips elevated high.',
      'Swoop chest smoothly close along the floor between hands, arching up into Cobra.',
      'Reverse the arc smoothly or push directly back to the starting triangle.',
      'Develops iron shoulder stabilizers and thick tricep/chest density.'
    ],
    commonMistakes: [
      'Flaring elbows outward like a "T" instead of keeping them tracking along the ribs.',
      'Skipping the chest swoop close to the floor.',
      'Sagging the lower back without active core engagement.'
    ],
    difficulty: 'intermediate',
    equipment: 'desi_akhada_bodyweight',
    isDesi: true
  },
  {
    id: 'ex-surya-namaskar',
    name: 'Surya Namaskar (12-Step Sun Salutation)',
    subtitle: 'Vedic Full-Body Energy & Mobility Flow',
    targetMuscle: 'Full Body Mobility & Core Vitality',
    secondaryMuscles: ['Spine', 'Hamstrings', 'Metabolic Circulation'],
    sets: 6,
    reps: '6 - 10 cycles',
    restSecs: 30,
    formTips: [
      'Synchronize every transition with deep, deliberate diaphragmatic breathing.',
      'Flow smoothly through the 12 postures: Prayer, Raised Arms, Hand to Foot, Equestrian, Stick, Eight-Limbed, Cobra, and Mountain.',
      'Keep your movement graceful and controlled.'
    ],
    commonMistakes: [
      'Holding your breath during transitions.',
      'Forcing stiff hamstrings without softening the knees.',
      'Hyperextending the neck in the upward cobra phase.'
    ],
    difficulty: 'beginner',
    equipment: 'desi_akhada_bodyweight',
    isDesi: true
  },
  {
    id: 'ex-squat',
    name: 'Barbell / Dumbbell Deep Squat',
    subtitle: 'Heavy Lower Body Hypertrophy',
    targetMuscle: 'Quadriceps & Gluteus Maximus',
    secondaryMuscles: ['Hamstrings', 'Core Brace', 'Erectors'],
    sets: 4,
    reps: '8 - 12 reps',
    restSecs: 90,
    formTips: [
      'Feet shoulder-width apart, toes flared slightly out at 15-30 degrees.',
      'Take a deep belly breath and brace your core as if taking a punch.',
      'Hit parallel depth with knees tracking directly over your second toe.'
    ],
    commonMistakes: [
      'Knees collapsing inward (valgus) on the ascent.',
      'Heels lifting off the ground — keep weight centered over midfoot.'
    ],
    difficulty: 'intermediate',
    equipment: 'dumbbells_only'
  },
  {
    id: 'ex-pushup',
    name: 'Standard Military Push-Up',
    subtitle: 'Upper Body Chest & Triceps Staple',
    targetMuscle: 'Chest (Pectorals)',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids', 'Core Plank'],
    sets: 3,
    reps: '15 - 20 reps',
    restSecs: 60,
    formTips: [
      'Hands slightly wider than shoulders, elbows tracking at a 45-degree angle.',
      'Keep your entire body rigid like an iron bar from heels to crown.',
      'Lower until your chest hovers one inch above the floor.'
    ],
    commonMistakes: [
      'Hips sagging or piking up into the air.',
      'Flaring elbows straight out to the sides at 90 degrees.'
    ],
    difficulty: 'beginner',
    equipment: 'desi_akhada_bodyweight'
  },
  {
    id: 'ex-bicep-curl',
    name: 'Dumbbell Bicep Curls',
    subtitle: 'Strict Arm Flexion & Peak Contraction',
    targetMuscle: 'Biceps Brachii',
    secondaryMuscles: ['Forearms', 'Brachialis'],
    sets: 3,
    reps: '10 - 12 reps',
    restSecs: 60,
    formTips: [
      'Keep your elbows pinned stationary against your ribcage.',
      'Supinate wrists (turn palms up) as you curl toward shoulder level.',
      'Squeeze biceps hard at the peak for one full second before lowering.'
    ],
    commonMistakes: [
      'Swinging hips or using torso momentum to heave the weights up.',
      'Dropping the weight quickly without controlling the negative phase.'
    ],
    difficulty: 'beginner',
    equipment: 'dumbbells_only'
  },
  {
    id: 'ex-desi-kumbhak-plank',
    name: 'Kumbhak Core Plank',
    subtitle: 'Deep Diaphragmatic Core Hold',
    targetMuscle: 'Transverse Abdominis & Navel Center',
    secondaryMuscles: ['Shoulders', 'Glutes', 'Lats'],
    sets: 3,
    reps: '45 - 60 secs',
    restSecs: 45,
    formTips: [
      'Draw navel firmly into spine while practicing steady nasal breathing.',
      'Push the ground away with your forearms to maintain a strong upper back.'
    ],
    commonMistakes: [
      'Arching lower back and straining lumbar spine.',
      'Holding breath without core control.'
    ],
    difficulty: 'beginner',
    equipment: 'desi_akhada_bodyweight',
    isDesi: true
  }
];
