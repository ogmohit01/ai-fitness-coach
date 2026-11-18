import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Flame,
  Play,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  WorkoutRoutine,
  UserProfile,
  AppSettings,
  FitnessGoal,
  FitnessLevel,
  EquipmentOption
} from '../types/fitness';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface WorkoutPlannerTabProps {
  profile: UserProfile;
  settings: AppSettings;
  routines: WorkoutRoutine[];
  onUpdateRoutines: (routines: WorkoutRoutine[]) => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
}

export const WorkoutPlannerTab: React.FC<WorkoutPlannerTabProps> = ({
  profile,
  settings,
  routines,
  onUpdateRoutines,
  onStartWorkout,
}) => {
  const [goal, setGoal] = useState<FitnessGoal>(profile.primaryGoal);
  const [level, setLevel] = useState<FitnessLevel>(profile.fitnessLevel);
  const [equipment, setEquipment] = useState<EquipmentOption>('desi_akhada_bodyweight');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  const handleGenerateWorkout = async () => {
    setIsGenerating(true);
    try {
      const generated = await geminiService.generateWorkoutPlan(
        goal,
        level,
        equipment,
        durationMinutes,
        profile,
        settings.geminiApiKey,
        settings.geminiModel
      );

      const updated = [generated, ...routines];
      onUpdateRoutines(updated);
      storageService.saveRoutines(updated);
      setExpandedRoutineId(generated.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteRoutine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workout routine?')) {
      const updated = routines.filter((r) => r.id !== id);
      onUpdateRoutines(updated);
      storageService.saveRoutines(updated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* AI Routine Generator Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Workout Generator & Planner</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">Design Your Custom Training Split</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select your parameters and FitGuru AI will engineer an optimal routine tailored to your equipment and targets.
            </p>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase">Primary Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as FitnessGoal)}
              className="w-full bg-black border border-zinc-800 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="desi_strength">Athletic Power & Conditioning (Hindu Pushups/Squats)</option>
              <option value="muscle_gain">Hypertrophy & Muscle Mass</option>
              <option value="fat_loss">Metabolic Fat Shred & Conditioning</option>
              <option value="yoga_mobility">Vedic Mobility & Sun Salutations</option>
              <option value="endurance">Endurance & Cardiovascular Stamina</option>
            </select>
          </div>

          {/* Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase">Experience Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as FitnessLevel)}
              className="w-full bg-black border border-zinc-800 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="beginner">Beginner (Foundational)</option>
              <option value="intermediate">Intermediate (6+ Months Consistent)</option>
              <option value="advanced">Advanced (High Volume / Athlete)</option>
            </select>
          </div>

          {/* Equipment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase">Available Equipment</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value as EquipmentOption)}
              className="w-full bg-black border border-zinc-800 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="desi_akhada_bodyweight">Bodyweight (No Equipment / Home)</option>
              <option value="dumbbells_only">Dumbbells Only (Home Gym)</option>
              <option value="full_gym">Full Commercial Gym</option>
              <option value="resistance_bands">Resistance Bands</option>
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase">Session Duration</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-black border border-zinc-800 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value={15}>15 Minutes (Express Blast)</option>
              <option value={30}>30 Minutes (Optimal Conditioning)</option>
              <option value={45}>45 Minutes (Full Session)</option>
              <option value={60}>60 Minutes (Max Hypertrophy)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerateWorkout}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 text-black ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Engineering Custom Routine...' : 'Generate AI Workout Plan'}</span>
          </button>
        </div>
      </div>

      {/* Routine Cards Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Your Saved Workout Routines</h3>
          <p className="text-xs text-zinc-400">Select any routine and click <strong>"Start Workout"</strong> to launch the live guided session.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
          {routines.length} Routines Ready
        </span>
      </div>

      {/* Routines List */}
      <div className="space-y-4">
        {routines.map((routine) => {
          const isExpanded = expandedRoutineId === routine.id;

          return (
            <div
              key={routine.id}
              className="bg-black border border-zinc-800/90 hover:border-zinc-700 rounded-3xl overflow-hidden transition shadow-xl"
            >
              <div
                onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-900 text-amber-400 font-bold border border-amber-500/30 capitalize">
                      {routine.goal.replace('_', ' ')}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 font-semibold border border-zinc-800 capitalize">
                      {routine.level}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800 capitalize">
                      {routine.equipment.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white">{routine.title}</h4>
                  {routine.subtitle && (
                    <span className="text-xs font-semibold text-amber-400/90 block">
                      {routine.subtitle}
                    </span>
                  )}
                  <p className="text-xs text-zinc-400 max-w-2xl">{routine.description}</p>

                  <div className="flex items-center space-x-4 text-xs text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {routine.durationMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" /> ~{routine.estimatedCaloriesBurn} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" /> {routine.exercises.length} Exercises
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={(e) => handleDeleteRoutine(routine.id, e)}
                    className="p-2.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-xl transition"
                    title="Delete Routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartWorkout(routine);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black text-black" />
                    <span>Start Workout</span>
                  </button>

                  <div className="text-zinc-500 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Accordion Exercise Details */}
              {isExpanded && (
                <div className="border-t border-zinc-800 bg-zinc-950 p-5 sm:p-6 space-y-3">
                  <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Exercise Breakdown ({routine.exercises.length} movements)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {routine.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-black border border-zinc-800/80 rounded-2xl p-4 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {ex.name}
                          </span>
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            {ex.sets} sets × {ex.reps}
                          </span>
                        </div>
                        {ex.subtitle && (
                          <span className="text-xs font-semibold text-zinc-400 block">
                            {ex.subtitle}
                          </span>
                        )}
                        <span className="text-xs text-zinc-500 block">
                          Target: <strong className="text-zinc-300">{ex.targetMuscle}</strong> • Rest: {ex.restSecs}s
                        </span>
                        {ex.formTips && ex.formTips.length > 0 && (
                          <p className="text-[11px] text-zinc-400 italic">
                            💡 {ex.formTips[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
