import React, { useState } from 'react';
import {
  Flame,
  Award,
  Calendar,
  Zap,
  Clock,
  Scale,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { UserProfile, WorkoutHistoryEntry } from '../types/fitness';
import { storageService } from '../services/storageService';

interface ProgressTabProps {
  profile: UserProfile;
  history: WorkoutHistoryEntry[];
  onUpdateProfile: (profile: UserProfile) => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  profile,
  history,
  onUpdateProfile,
}) => {
  const [newWeight, setNewWeight] = useState(profile.weightKg.toString());

  const heightM = profile.heightCm / 100;
  const bmi = (profile.weightKg / (heightM * heightM)).toFixed(1);

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-400' };
    if (val < 25) return { label: 'Healthy Weight', color: 'text-emerald-400' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-rose-400' };
  };

  const bmiCat = getBmiCategory(Number(bmi));

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 30 && w < 300) {
      const updated = { ...profile, weightKg: w };
      onUpdateProfile(updated);
      storageService.saveProfile(updated);
      alert(`Updated bodyweight to ${w} kg!`);
    }
  };

  const achievements = [
    {
      id: 'first_workout',
      title: 'First Sweat',
      desc: 'Completed your first guided workout session',
      icon: '⚡',
      unlocked: profile.totalWorkoutsCompleted >= 1,
    },
    {
      id: 'streak_3',
      title: '3-Day Fire Streak',
      desc: 'Maintained a 3-day continuous training habit',
      icon: '🔥',
      unlocked: profile.streakDays >= 3,
    },
    {
      id: 'hydration',
      title: 'Hydration Champion',
      desc: 'Logged a full 8 glasses of water in a single day',
      icon: '💧',
      unlocked: profile.waterGlassesToday >= 8,
    },
    {
      id: 'ten_workouts',
      title: 'Iron Discipline',
      desc: 'Completed 10+ full workout sessions',
      icon: '🦾',
      unlocked: profile.totalWorkoutsCompleted >= 10,
    },
    {
      id: 'century_cal',
      title: 'Furnace',
      desc: 'Burned over 500 kcal in a single day',
      icon: '🌋',
      unlocked: profile.caloriesBurnedToday >= 500,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-2 shadow-2xl">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Training Streak</span>
            <span className="text-2xl font-black text-white">{profile.streakDays} Days</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-2 shadow-2xl">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Total Workouts</span>
            <span className="text-2xl font-black text-white">{profile.totalWorkoutsCompleted}</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-2 shadow-2xl">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Current Weight</span>
            <span className="text-2xl font-black text-white">{profile.weightKg} kg</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-2 shadow-2xl">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">BMI Score</span>
            <span className="text-2xl font-black text-white">{bmi}</span>
          </div>
        </div>
      </div>

      {/* Body Composition & Consistency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Body Metric Monitor</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-black border border-zinc-800">
            <div>
              <span className="text-xs text-zinc-400 block">BMI Classification</span>
              <span className={`text-base font-extrabold ${bmiCat.color}`}>{bmiCat.label} ({bmi})</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Height</span>
              <span className="text-sm font-bold text-white font-mono">{profile.heightCm} cm</span>
            </div>
          </div>

          <form onSubmit={handleSaveWeight} className="flex items-center gap-2 pt-2">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Update Weight (kg)"
              className="flex-1 bg-black border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-700 transition"
            >
              Update Weight
            </button>
          </form>
        </div>

        {/* 7-Day Consistency Grid */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>7-Day Consistency Grid</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const isActiveDay = idx < profile.streakDays;
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition ${
                    isActiveDay
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-black border-zinc-800 text-zinc-600'
                  }`}
                >
                  <span className="text-[10px] font-bold">{day}</span>
                  <div className="my-2">
                    {isActiveDay ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-zinc-800" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono">{isActiveDay ? 'Active' : 'Rest'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Milestone Badges & Achievements</span>
          </div>
          <span className="text-xs text-zinc-400 font-bold">
            {achievements.filter((a) => a.unlocked).length} of {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-3xl border flex items-center space-x-3.5 transition ${
                ach.unlocked
                  ? 'bg-black border-amber-500/30 text-white'
                  : 'bg-black/40 border-zinc-900 text-zinc-600 opacity-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  ach.unlocked ? 'bg-amber-500/20' : 'bg-zinc-900'
                }`}
              >
                {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-zinc-700" />}
              </div>
              <div>
                <h4 className="text-sm font-black">{ach.title}</h4>
                <p className="text-xs text-zinc-400">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout History Log */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <h3 className="text-lg font-bold text-white">Completed Workout Log</h3>

        {history.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-xs">
            No workouts logged yet. Navigate to the Workouts tab to launch your first session!
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-black border border-zinc-800 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{entry.title}</h4>
                  <span className="text-zinc-500">{entry.date}</span>
                </div>

                <div className="flex items-center space-x-4 text-zinc-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {entry.durationMinutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> {entry.caloriesBurned} kcal
                  </span>
                  <span className="text-emerald-400 font-bold">
                    ✓ {entry.exercisesCompleted} moves
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
