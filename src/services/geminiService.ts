import { GoogleGenAI } from '@google/genai';
import {
  CoachPersona,
  UserProfile,
  WorkoutRoutine,
  MealItem,
  FitnessGoal,
  FitnessLevel,
  EquipmentOption
} from '../types/fitness';
import { COACH_PERSONAS } from '../data/coaches';
import { EXERCISE_DATABASE } from '../data/exerciseLibrary';

const SYSTEM_PROMPTS: Record<string, string> = {
  yashvant: `You are FitGuru AI Coach, the Head AI Fitness Coach & Athletic Conditioning Specialist.
Background: Elite AI coaching intelligence combining modern hypertrophy science (progressive overload, mechanical tension, reps in reserve) with Indian athletic power (Hindu squats/Baithak, Hindu pushups/Dand, functional stamina, and high-protein Indian nutrition).
Tone: Highly motivational, energetic, direct, disciplined, brotherly tough love, and scientifically accurate. Use clear, polished English with punchy coaching directives.
Always give actionable advice suitable for real-world training and nutrition (Paneer, Sattu, Soya chunks, Eggs, Chicken, Dal-Roti balancing). Format with clear headings, bold highlights, and numbered steps.`,

  ananya: `You are Ananya Sharma, an expert in Classical Hatha Yoga, Surya Namaskar, Pranayama, and Holistic Mobility.
Tone: Serene, encouraging, mindful, empowering, empathetic, focused on joint longevity, spine decompression, and stress reduction.
Emphasize proper diaphragmatic breathing, functional flexibility, and clean whole-food nutrition. Format with calm cues and structured steps.`,

  dr_rohan: `You are Dr. Rohan Mehta, a Clinical Sports Scientist & Performance Dietitian with a Ph.D. in South Asian Exercise Metabolism.
Tone: Evidence-based, analytical, precise, busting common dietary myths (e.g., "dal alone provides complete protein", "carbs make you fat").
Provide exact macronutrient timing, caloric targets, and high biological value protein strategies for Indian lifestyles. Format cleanly with scientific rationale.`
};

export class GeminiService {
  private getClient(apiKey: string): GoogleGenAI | null {
    if (!apiKey || apiKey.trim().length === 0) return null;
    try {
      return new GoogleGenAI({ apiKey: apiKey.trim() });
    } catch (e) {
      console.warn('Error creating GoogleGenAI client:', e);
      return null;
    }
  }

  // Interactive coach conversation
  async chatWithCoach(
    prompt: string,
    coachId: string,
    profile: UserProfile,
    apiKey?: string,
    modelName = 'gemini-2.5-flash'
  ): Promise<string> {
    const coach = COACH_PERSONAS.find((c) => c.id === coachId) || COACH_PERSONAS[0];
    const systemPrompt = SYSTEM_PROMPTS[coachId] || SYSTEM_PROMPTS.yashvant;

    const userContext = `[Client Profile: Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}, Weight: ${profile.weightKg}kg, Height: ${profile.heightCm}cm, Fitness Level: ${profile.fitnessLevel}, Primary Goal: ${profile.primaryGoal}, Diet: ${profile.dietaryPreference}, Streak: ${profile.streakDays} days]`;

    const client = this.getClient(apiKey || '');

    if (client) {
      try {
        const fullPrompt = `${systemPrompt}\n\n${userContext}\n\nClient Question: "${prompt}"\n\nPlease respond in character as ${coach.name}. Write in crisp, professional English with clear markdown headings, bullet points, and high-impact coaching advice.`;

        const response = await client.models.generateContent({
          model: modelName,
          contents: fullPrompt,
        });

        if (response.text && response.text.trim().length > 0) {
          return response.text.trim();
        }
      } catch (err: unknown) {
        console.warn('Gemini API call failed, switching to smart local engine:', err);
      }
    }

    return this.generateSmartCoachResponse(prompt, coach, profile);
  }

  // Generate tailored workout routine in clean English JSON
  async generateWorkoutPlan(
    goal: FitnessGoal,
    level: FitnessLevel,
    equipment: EquipmentOption,
    durationMinutes: number,
    profile: UserProfile,
    apiKey?: string,
    modelName = 'gemini-2.5-flash'
  ): Promise<WorkoutRoutine> {
    const client = this.getClient(apiKey || '');

    if (client) {
      try {
        const prompt = `Generate a high-yield fitness routine in valid JSON format for a ${level} client with goal ${goal}, using ${equipment}, duration ${durationMinutes} minutes.
Return ONLY valid JSON matching this schema without surrounding markdown code blocks:
{
  "title": "Creative Routine Title",
  "subtitle": "Short descriptive subtitle",
  "description": "2 sentence overview of the workout.",
  "estimatedCaloriesBurn": 300,
  "tags": ["Strength", "Conditioning"],
  "exercises": [
    {
      "name": "Exercise Name",
      "subtitle": "Exercise subtitle or variant",
      "targetMuscle": "Primary muscle group",
      "sets": 3,
      "reps": "12-15 reps",
      "restSecs": 60,
      "formTips": ["Form tip 1", "Form tip 2"],
      "commonMistakes": ["Mistake to avoid"]
    }
  ]
}`;

        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        if (response.text) {
          const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          return {
            id: `ai-routine-${Date.now()}`,
            title: parsed.title || `${goal.toUpperCase()} Power Plan`,
            subtitle: parsed.subtitle || 'Custom AI-Engineered Session',
            description: parsed.description || 'Personalized AI-crafted workout session.',
            level,
            goal,
            durationMinutes,
            estimatedCaloriesBurn: parsed.estimatedCaloriesBurn || Math.round(durationMinutes * 8),
            equipment,
            tags: parsed.tags || [level, goal, `${durationMinutes}m`],
            createdAt: new Date().toISOString(),
            exercises: parsed.exercises.map((ex: any, idx: number) => ({
              id: `ex-gen-${idx}-${Date.now()}`,
              name: ex.name,
              subtitle: ex.subtitle,
              targetMuscle: ex.targetMuscle || 'Full Body',
              sets: ex.sets || 3,
              reps: ex.reps || '10-12 reps',
              restSecs: ex.restSecs || 60,
              formTips: ex.formTips || ['Maintain controlled tempo and full range of motion.'],
              commonMistakes: ex.commonMistakes || ['Do not rush through the repetitions.'],
              difficulty: level,
              equipment
            }))
          };
        }
      } catch (err) {
        console.warn('API workout generation fallback:', err);
      }
    }

    return this.generateLocalWorkoutRoutine(goal, level, equipment, durationMinutes, profile);
  }

  // Generate authentic daily meal plan in clean English
  async generateMealPlan(
    dietaryPreference: string,
    targetCalories: number,
    targetProtein: number,
    profile: UserProfile,
    apiKey?: string,
    modelName = 'gemini-2.5-flash'
  ): Promise<MealItem[]> {
    const client = this.getClient(apiKey || '');

    if (client) {
      try {
        const prompt = `Generate a realistic 4-meal daily meal plan (Breakfast, Lunch, Evening Snack, Dinner) in valid JSON format for a ${profile.fitnessLevel} user targeting ${targetCalories} kcal and ${targetProtein}g protein.
Diet preference: ${dietaryPreference} (Include smart Indian high-protein foods like Paneer, Sattu, Soya Chunks, Moong Sprouts, Rotis, Curd, Eggs).
Return ONLY a valid JSON array without markdown formatting:
[
  {
    "title": "Meal Title",
    "subtitle": "Short subtitle description",
    "mealType": "Breakfast",
    "calories": 450,
    "proteinG": 32,
    "carbsG": 48,
    "fatG": 12,
    "prepTimeMinutes": 15,
    "servingSize": "2 Portions / 1 Plate",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": "Simple prep instructions.",
    "desiSuperfoodTag": "Key nutritional highlight"
  }
]`;

        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        if (response.text) {
          const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const meals = JSON.parse(cleaned);
          return meals.map((m: any, idx: number) => ({
            ...m,
            id: `ai-meal-${idx}-${Date.now()}`
          }));
        }
      } catch (e) {
        console.warn('Meal API fallback:', e);
      }
    }

    return this.generateLocalMeals(dietaryPreference, targetCalories, targetProtein);
  }

  // Smart offline coach responses with FitGuru AI Coach persona
  private generateSmartCoachResponse(prompt: string, coach: CoachPersona, profile: UserProfile): string {
    const q = prompt.toLowerCase();

    // Protein / Indian Vegetarian Diet / Sattu / Paneer
    if (q.includes('protein') || q.includes('veg') || q.includes('sattu') || q.includes('paneer') || q.includes('soya') || q.includes('diet') || q.includes('calories') || q.includes('macros')) {
      const targetProtein = Math.round(profile.weightKg * 1.9);
      return `### 🥗 High-Protein Nutrition Blueprint by ${coach.name}
Welcome **${profile.name}**! For your current bodyweight of **${profile.weightKg}kg** and goal of **${profile.primaryGoal.replace('_', ' ').toUpperCase()}**, your daily target is **${targetProtein}g of protein** (~1.9g per kg of bodyweight).

#### 🏆 Top 5 High-Yield Indian Vegetarian Protein Sources:
1. **Soya Chunks**: 100g unboiled packs an unmatched **~52g of complete protein**. Cook in a spiced curry or stir-fry.
2. **Fresh Low-Fat Paneer / Tofu**: 100g delivers **~18-20g of protein** alongside essential healthy fats.
3. **Roasted Chana Sattu**: 50g sattu in chilled water provides **~13g of plant protein** plus natural electrolytes for post-workout recovery.
4. **Sprouted Moong & Black Chickpeas**: 1 bowl provides **~14g of bioavailable protein** and digestive enzymes.
5. **Thick Greek Yogurt / Probiotic Curd**: Delivers **~10-12g of protein** per katori to maximize gut absorption.

> 💡 **FitGuru Pro Rule**: *"Dal alone is not enough protein because it contains 3x more carbohydrates than protein. Always pair your dal with Paneer, Tofu, Soya chunks, or Curd to hit your daily macro target!"*`;
    }

    // Belly Fat / Fat Loss / Cutting
    if (q.includes('fat') || q.includes('belly') || q.includes('weight loss') || q.includes('cut') || q.includes('shred')) {
      return `### 🔥 FitGuru AI Fat Loss & Midsection Protocol
Listen closely, **${profile.name}**! Spot reduction of abdominal fat is impossible—you drop body fat by creating a clean, consistent caloric deficit while preserving lean muscle mass:

1. **The 50-25-25 Plate Rule**:
   - Fill **50% of your plate** with fibrous vegetables & raw salad (cucumbers, tomatoes, greens).
   - Fill **25%** with dense protein (Paneer, Soya chunks, Eggs, or Chicken).
   - Fill the remaining **25%** with complex carbohydrates (limit to 2 whole wheat rotis or 1 cup brown rice).
2. **Eliminate Liquid Sugar & Refined Maida**:
   - Cut out sweetened chai, sodas, and packaged biscuits. Start your mornings with warm lemon-cumin water.
3. **High-Yield Athletic Movements**:
   - Perform 30 Hindu Squats (Baithak) + 20 Hindu Pushups (Sapate) + 10 Sun Salutations daily to ramp up your 24-hour metabolic rate.
4. **Early Dinner Window**:
   - Finish your last meal at least 2.5 hours before sleep to optimize overnight growth hormone secretion.`;
    }

    // Squats / Baithak / Pushups / Danda / Form Guidance
    if (q.includes('squat') || q.includes('baithak') || q.includes('dand') || q.includes('pushup') || q.includes('bicep') || q.includes('form') || q.includes('knee')) {
      return `### 🦾 Form Cues & Biomechanics with ${coach.name}
Proper execution is non-negotiable for injury-free progression, **${profile.name}**:

- **Hindu Squats (Baithak)**: Descend onto the balls of your feet while swinging your arms back on the inhale. Explode up to full lockout on the exhale. This strengthens the knee ligaments, patellar tendon, and calves.
- **Hindu Pushups (Dand / Sapate)**: Swoop your chest smoothly along the floor from downward dog into upward cobra without letting your lower back sag. Keep your elbows tracking tightly along your ribs.
- **Dumbbell Bicep Curls**: Lock your elbows firmly against your ribcage. Rotate your wrists outward (supination) at the peak to maximize bicep peak contraction. Never use hip swing momentum!

> *"Discipline is choosing what you want most over what you want right now. Lock in that form!"*`;
    }

    // General Motivation / Routine Advice
    return `### ⚡ Coaching Directive: ${coach.name}
Great to connect, **${profile.name}**! You currently hold a **${profile.streakDays}-day training streak** with **${profile.totalWorkoutsCompleted} completed workouts**. That momentum is earned!

- **Today's Core Mission**: Hit your target water intake (at least 3.0 Liters) and complete at least 30 minutes of intentional progressive training.
- **Macro Priority**: Ensure every single meal has an identified protein anchor.
- **Mindset**: Show up every day with purpose. Consistency beats intensity every single time.

Ask me to generate a personalized workout split, calculate your exact macros, or guide you through any exercise!`;
  }

  // Local workout routine generator
  private generateLocalWorkoutRoutine(
    goal: FitnessGoal,
    level: FitnessLevel,
    equipment: EquipmentOption,
    durationMinutes: number,
    _profile: UserProfile
  ): WorkoutRoutine {
    const selected = EXERCISE_DATABASE.filter(
      (e) => equipment === 'full_gym' || e.equipment === equipment || e.equipment === 'desi_akhada_bodyweight'
    ).slice(0, 4);

    return {
      id: `ai-routine-${Date.now()}`,
      title: `${goal === 'desi_strength' ? 'Athletic Conditioning' : goal === 'muscle_gain' ? 'Hypertrophy Mass Builder' : 'Metabolic Shred'} Protocol`,
      subtitle: `Engineered by FitGuru AI Coach`,
      description: `Targeted ${durationMinutes}-minute routine customized for ${level} level focusing on ${goal.replace('_', ' ')}.`,
      level,
      goal,
      durationMinutes,
      estimatedCaloriesBurn: Math.round(durationMinutes * 8.2),
      equipment,
      tags: ['FitGuru Training', level, `${durationMinutes}m`, equipment],
      createdAt: new Date().toISOString(),
      exercises: selected.length > 0 ? selected : EXERCISE_DATABASE.slice(0, 3)
    };
  }

  // Local meal generator in clean English
  private generateLocalMeals(
    preference: string,
    targetCalories: number,
    targetProtein: number
  ): MealItem[] {
    const isPureVeg = preference === 'pure_veg' || preference === 'jain';
    return [
      {
        id: `local-meal-1-${Date.now()}`,
        title: isPureVeg ? 'High-Protein Paneer Besan Chilla with Mint Chutney' : 'Boiled Eggs & Spiced Tofu Scramble with Whole Wheat Toast',
        subtitle: 'Savory High-Protein Morning Fuel',
        mealType: 'Breakfast',
        calories: Math.round(targetCalories * 0.25),
        proteinG: Math.round(targetProtein * 0.25),
        carbsG: 45,
        fatG: 12,
        prepTimeMinutes: 12,
        servingSize: '2 Chillas / 1 Plate',
        ingredients: ['Gram flour (Besan)', 'Low-fat paneer or tofu', 'Carom seeds (Ajwain)', 'Onions & green chillies', 'Mint yogurt chutney'],
        instructions: 'Cook thin chilla on iron griddle with 1 tsp ghee, stuff with spiced grated paneer, and serve hot.',
        desiSuperfoodTag: 'Digestive Carom Seeds + High Protein'
      },
      {
        id: `local-meal-2-${Date.now()}`,
        title: 'Nutri-Soya Chunks Masala with 2 Rotis & Thick Curd',
        subtitle: 'High Biological Value Plant Protein Feast',
        mealType: 'Lunch',
        calories: Math.round(targetCalories * 0.35),
        proteinG: Math.round(targetProtein * 0.35),
        carbsG: 58,
        fatG: 10,
        prepTimeMinutes: 20,
        servingSize: '1 Bowl Soya Curry + 2 Rotis + 150g Curd',
        ingredients: ['Soya Chunks (52% protein)', 'Whole wheat rotis', 'Fresh curd', 'Tomato-onion gravy', 'Cucumber salad'],
        instructions: 'Boil and rinse soya chunks, simmer in mild spices. Pair with 2 light rotis and probiotic curd.',
        desiSuperfoodTag: '52g Protein Density per 100g'
      },
      {
        id: `local-meal-3-${Date.now()}`,
        title: 'Roasted Chana Sattu Energy Drink with Lemon & Cumin',
        subtitle: 'Natural Post-Workout Electrolytes & Amino Acids',
        mealType: 'Post-Workout Fuel',
        calories: Math.round(targetCalories * 0.15),
        proteinG: Math.round(targetProtein * 0.15),
        carbsG: 35,
        fatG: 4,
        prepTimeMinutes: 3,
        servingSize: '1 Tall Glass (350ml)',
        ingredients: ['Roasted Chana Sattu', 'Chilled water', 'Fresh lemon juice', 'Black salt', 'Roasted cumin'],
        instructions: 'Whisk sattu into water with lemon and black salt. Natural glycogen and hydration recharge.',
        desiSuperfoodTag: 'Indigenous Natural Electrolytes'
      },
      {
        id: `local-meal-4-${Date.now()}`,
        title: 'Light Moong Dal Khichdi with Pan-Seared Paneer & Cow Ghee',
        subtitle: 'Nourishing Recovery Dinner with Anti-Inflammatory Spices',
        mealType: 'Dinner',
        calories: Math.round(targetCalories * 0.25),
        proteinG: Math.round(targetProtein * 0.25),
        carbsG: 48,
        fatG: 11,
        prepTimeMinutes: 20,
        servingSize: '1 Warm Bowl Khichdi + 100g Paneer',
        ingredients: ['Yellow split moong dal', 'Brown rice', 'Pan-seared paneer', '1 tsp Pure A2 cow ghee', 'Cumin & Hing tempering'],
        instructions: 'Easy on digestion, provides steady overnight amino acid release for muscle repair.',
        desiSuperfoodTag: 'A2 Cow Ghee (CLA) + Cumin'
      }
    ];
  }
}

export const geminiService = new GeminiService();
