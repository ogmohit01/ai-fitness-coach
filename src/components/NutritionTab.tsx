import React, { useState } from 'react';
import {
  Sparkles,
  Droplets,
  Flame,
  PieChart,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  UserProfile,
  AppSettings,
  DailyMealPlan,
  MealItem,
} from '../types/fitness';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface NutritionTabProps {
  profile: UserProfile;
  settings: AppSettings;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  profile,
  settings,
  onUpdateProfile,
}) => {
  const [mealPlan, setMealPlan] = useState<DailyMealPlan>(() => storageService.getMealPlan());
  const [dietGoalMode, setDietGoalMode] = useState<'cut' | 'maintain' | 'bulk'>('bulk');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [newMealTitle, setNewMealTitle] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');
  const [newMealProtein, setNewMealProtein] = useState('');

  // Mifflin-St Jeor metabolic computation
  const bmr = Math.round(
    profile.gender === 'male'
      ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
      : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161
  );

  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  }[profile.activityLevel] || 1.55;

  const tdee = Math.round(bmr * activityMultiplier);

  const targetCalories =
    dietGoalMode === 'cut'
      ? Math.round(tdee * 0.82)
      : dietGoalMode === 'bulk'
      ? Math.round(tdee * 1.12)
      : tdee;

  // High-Protein target: ~1.9g per kg
  const targetProteinG = Math.round(profile.weightKg * 1.9);
  const targetFatG = Math.round((targetCalories * 0.25) / 9);
  const targetCarbsG = Math.max(50, Math.round((targetCalories - targetProteinG * 4 - targetFatG * 9) / 4));

  const totalLoggedCalories = mealPlan.meals.reduce((sum, m) => sum + m.calories, 0);
  const totalLoggedProtein = mealPlan.meals.reduce((sum, m) => sum + m.proteinG, 0);
  const totalLoggedCarbs = mealPlan.meals.reduce((sum, m) => sum + m.carbsG, 0);
  const totalLoggedFat = mealPlan.meals.reduce((sum, m) => sum + m.fatG, 0);

  const handleDrinkWater = (index: number) => {
    const updatedCount = index < profile.waterGlassesToday ? index : index + 1;
    const updatedProfile = { ...profile, waterGlassesToday: updatedCount };
    onUpdateProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
  };

  const handleGenerateAIMeals = async () => {
    setIsGenerating(true);
    try {
      const generatedMeals = await geminiService.generateMealPlan(
        profile.dietaryPreference,
        targetCalories,
        targetProteinG,
        profile,
        settings.geminiApiKey,
        settings.geminiModel
      );

      const updatedPlan: DailyMealPlan = {
        ...mealPlan,
        targetCalories,
        targetProtein: targetProteinG,
        targetCarbs: targetCarbsG,
        targetFat: targetFatG,
        totalCalories: generatedMeals.reduce((s, m) => s + m.calories, 0),
        totalProtein: generatedMeals.reduce((s, m) => s + m.proteinG, 0),
        totalCarbs: generatedMeals.reduce((s, m) => s + m.carbsG, 0),
        totalFat: generatedMeals.reduce((s, m) => s + m.fatG, 0),
        meals: generatedMeals,
      };

      setMealPlan(updatedPlan);
      storageService.saveMealPlan(updatedPlan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealTitle.trim()) return;

    const cal = Number(newMealCalories) || 280;
    const pro = Number(newMealProtein) || 18;

    const customMeal: MealItem = {
      id: `custom-meal-${Date.now()}`,
      title: newMealTitle,
      mealType: 'Evening Snack',
      calories: cal,
      proteinG: pro,
      carbsG: Math.round(cal * 0.4 / 4),
      fatG: Math.round(cal * 0.25 / 9),
      prepTimeMinutes: 5,
      ingredients: ['Custom logged food'],
      instructions: 'Self-logged entry.'
    };

    const updatedMeals = [...mealPlan.meals, customMeal];
    const updatedPlan: DailyMealPlan = {
      ...mealPlan,
      meals: updatedMeals,
      totalCalories: updatedMeals.reduce((s, m) => s + m.calories, 0),
      totalProtein: updatedMeals.reduce((s, m) => s + m.proteinG, 0),
    };

    setMealPlan(updatedPlan);
    storageService.saveMealPlan(updatedPlan);
    setNewMealTitle('');
    setNewMealCalories('');
    setNewMealProtein('');
  };

  const handleDeleteMeal = (id: string) => {
    const updatedMeals = mealPlan.meals.filter((m) => m.id !== id);
    const updatedPlan: DailyMealPlan = {
      ...mealPlan,
      meals: updatedMeals,
      totalCalories: updatedMeals.reduce((s, m) => s + m.calories, 0),
      totalProtein: updatedMeals.reduce((s, m) => s + m.proteinG, 0),
    };
    setMealPlan(updatedPlan);
    storageService.saveMealPlan(updatedPlan);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Nutrition & Macro Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <PieChart className="w-4 h-4" />
              <span>Nutrition Intelligence & Macro Targets</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">Daily Macro & Calorie Breakdown</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Calibrated for your {profile.weightKg}kg bodyweight using the Mifflin-St Jeor metabolic formula.
            </p>
          </div>

          {/* Goal Mode Switcher */}
          <div className="flex items-center space-x-1.5 bg-black p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setDietGoalMode('cut')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                dietGoalMode === 'cut'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Deficit (Fat Loss)
            </button>
            <button
              onClick={() => setDietGoalMode('maintain')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                dietGoalMode === 'maintain'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setDietGoalMode('bulk')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                dietGoalMode === 'bulk'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Surplus (Muscle Gain)
            </button>
          </div>
        </div>

        {/* Macro Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories
              </span>
              <span>{Math.round((totalLoggedCalories / targetCalories) * 100)}%</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {totalLoggedCalories}{' '}
              <span className="text-xs font-normal text-zinc-600">/ {targetCalories} kcal</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalLoggedCalories / targetCalories) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1 text-amber-400">Protein Target</span>
              <span>{Math.round((totalLoggedProtein / targetProteinG) * 100)}%</span>
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {totalLoggedProtein}g{' '}
              <span className="text-xs font-normal text-zinc-600">/ {targetProteinG}g</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalLoggedProtein / targetProteinG) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1 text-cyan-400">Carbohydrates</span>
              <span>{Math.round((totalLoggedCarbs / targetCarbsG) * 100)}%</span>
            </div>
            <div className="text-xl font-black text-cyan-400 font-mono">
              {totalLoggedCarbs}g{' '}
              <span className="text-xs font-normal text-zinc-600">/ {targetCarbsG}g</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalLoggedCarbs / targetCarbsG) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400">Healthy Fats</span>
              <span>{Math.round((totalLoggedFat / targetFatG) * 100)}%</span>
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {totalLoggedFat}g{' '}
              <span className="text-xs font-normal text-zinc-600">/ {targetFatG}g</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalLoggedFat / targetFatG) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hydration Tracker */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Droplets className="w-4 h-4" />
            <span>Hydration Station</span>
          </div>
          <h3 className="text-xl font-bold text-white">Daily Water Tracker</h3>
          <p className="text-xs text-zinc-400">
            {profile.waterGlassesToday} of 8 glasses logged ({profile.waterGlassesToday * 250} ml / 2000 ml). Click any glass to toggle!
          </p>
        </div>

        {/* 8 Clickable Glasses */}
        <div className="flex items-center space-x-2 bg-black p-3 rounded-2xl border border-zinc-800">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((glassIndex) => {
            const isFilled = glassIndex < profile.waterGlassesToday;
            return (
              <button
                key={glassIndex}
                onClick={() => handleDrinkWater(glassIndex)}
                className={`w-9 h-11 rounded-xl border flex items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 border-cyan-300 shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-zinc-900 border-zinc-800 hover:border-cyan-500/40 text-zinc-600'
                }`}
                title={`Glass ${glassIndex + 1} (250ml)`}
              >
                <Droplets className={`w-4 h-4 ${isFilled ? 'text-black' : 'text-zinc-600'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal Plan & AI Generator Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Daily Meal Schedule</h3>
            <p className="text-xs text-zinc-400">
              Dietary Preference: <strong className="text-amber-400 capitalize">{profile.dietaryPreference.replace('_', ' ')}</strong>
            </p>
          </div>

          <button
            onClick={handleGenerateAIMeals}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-black ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Meal Plan...' : 'Generate AI Meal Plan'}</span>
          </button>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealPlan.meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-black border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {meal.mealType}
                </span>
                <button
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="text-xs text-zinc-500 hover:text-rose-400 transition"
                  title="Remove Meal"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{meal.title}</h4>
                {meal.subtitle && (
                  <span className="text-xs font-semibold text-amber-400/90 block mt-0.5">
                    {meal.subtitle}
                  </span>
                )}
                <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-1 font-mono">
                  <span className="text-orange-400 font-bold">{meal.calories} kcal</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{meal.proteinG}g Protein</span>
                  <span>•</span>
                  <span>{meal.carbsG}g Carbs</span>
                  <span>•</span>
                  <span>{meal.fatG}g Fat</span>
                </div>
              </div>

              {meal.desiSuperfoodTag && (
                <div className="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                  ✨ {meal.desiSuperfoodTag}
                </div>
              )}

              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <span className="font-bold text-zinc-400 block text-[10px] uppercase">Ingredients</span>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                  {meal.ingredients.slice(0, 3).map((ing, idx) => (
                    <li key={idx} className="truncate">
                      {ing}
                    </li>
                  ))}
                  {meal.ingredients.length > 3 && (
                    <li className="text-zinc-600 italic">+{meal.ingredients.length - 3} more</li>
                  )}
                </ul>
              </div>

              <p className="text-[11px] text-zinc-400 italic">💡 {meal.instructions}</p>
            </div>
          ))}
        </div>

        {/* Quick Food Logger Form */}
        <form
          onSubmit={handleAddCustomMeal}
          className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-xl"
        >
          <input
            type="text"
            placeholder="Log food item (e.g., 2 Rotis, Paneer Bhurji, Sattu Drink, Boiled Eggs)..."
            value={newMealTitle}
            onChange={(e) => setNewMealTitle(e.target.value)}
            className="flex-1 bg-black border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 w-full"
          />
          <input
            type="number"
            placeholder="Calories"
            value={newMealCalories}
            onChange={(e) => setNewMealCalories(e.target.value)}
            className="w-full sm:w-24 bg-black border border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="number"
            placeholder="Protein (g)"
            value={newMealProtein}
            onChange={(e) => setNewMealProtein(e.target.value)}
            className="w-full sm:w-28 bg-black border border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-zinc-700 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Food Entry</span>
          </button>
        </form>
      </div>
    </div>
  );
};
