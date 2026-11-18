import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Flame,
  Clock,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { WorkoutRoutine, WorkoutHistoryEntry } from '../types/fitness';
import { audioService } from '../services/audioService';

interface ActiveWorkoutModalProps {
  routine: WorkoutRoutine;
  onClose: () => void;
  onCompleteWorkout: (entry: WorkoutHistoryEntry) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  routine,
  onClose,
  onCompleteWorkout,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSetsCount, setCompletedSetsCount] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(60);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentExercise = routine.exercises[currentExerciseIndex];
  const totalSetsInRoutine = routine.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  useEffect(() => {
    if (isPaused || isFinished) return;
    const interval = setInterval(() => {
      setTotalSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isFinished]);

  useEffect(() => {
    if (!isResting || isPaused || isFinished) return;

    if (restSecondsLeft <= 3 && restSecondsLeft > 0) {
      audioService.playCountdownPing();
    }

    if (restSecondsLeft <= 0) {
      audioService.playGoPing();
      setIsResting(false);
      return;
    }

    const timer = setInterval(() => {
      setRestSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isResting, restSecondsLeft, isPaused, isFinished]);

  const handleCompleteSet = () => {
    audioService.playRepClick();
    setCompletedSetsCount((prev) => prev + 1);

    if (currentSet < currentExercise.sets) {
      setCurrentSet((prev) => prev + 1);
      setRestSecondsLeft(currentExercise.restSecs || 60);
      setIsResting(true);
    } else {
      if (currentExerciseIndex < routine.exercises.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSet(1);
        setRestSecondsLeft(75);
        setIsResting(true);
      } else {
        handleFinishRoutine();
      }
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
  };

  const handleFinishRoutine = () => {
    setIsFinished(true);
    setIsResting(false);
    audioService.playVictoryFanfare();

    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ffffff']
      });
    } catch {
      // ignore
    }

    const durationMinutes = Math.max(1, Math.round(totalSecondsElapsed / 60));
    const caloriesBurned = Math.round(
      (routine.estimatedCaloriesBurn / routine.durationMinutes) * durationMinutes || 280
    );

    const historyEntry: WorkoutHistoryEntry = {
      id: `history-${Date.now()}`,
      workoutId: routine.id,
      title: routine.title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      durationMinutes,
      caloriesBurned,
      exercisesCompleted: routine.exercises.length,
      totalExercises: routine.exercises.length,
    };

    onCompleteWorkout(historyEntry);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl shadow-amber-500/10">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
            <Award className="w-10 h-10 text-black" />
          </div>

          <div>
            <span className="text-xs uppercase font-black tracking-widest text-amber-400">
              Session Completed
            </span>
            <h2 className="text-2xl font-black text-white mt-1">Outstanding Effort! 🔥</h2>
            <p className="text-xs text-zinc-400 mt-2">
              You completely conquered <strong className="text-zinc-200">{routine.title}</strong>. Your consistency is building real results.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-4 rounded-2xl bg-black border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Time Elapsed</span>
              <span className="text-xl font-bold text-white flex items-center justify-center gap-1.5 font-mono">
                <Clock className="w-4 h-4 text-amber-400" /> {formatTime(totalSecondsElapsed)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Calories Burned</span>
              <span className="text-xl font-bold text-white flex items-center justify-center gap-1.5 font-mono">
                <Flame className="w-4 h-4 text-orange-400" /> {Math.round((routine.estimatedCaloriesBurn / routine.durationMinutes) * (totalSecondsElapsed / 60)) || 300} kcal
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 transition cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Live Guided Workout Session
          </span>
          <h2 className="text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
            {routine.title}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-sm font-mono text-amber-400 bg-black px-3.5 py-1.5 rounded-xl border border-zinc-800">
            <Clock className="w-4 h-4" />
            <span>{formatTime(totalSecondsElapsed)}</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-5 h-5 text-amber-400" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
            title="Exit Workout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 h-1.5">
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 transition-all duration-300"
          style={{ width: `${(completedSetsCount / totalSetsInRoutine) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {isResting ? (
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Rest & Recovery Interval
            </span>

            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
              <div className="text-center">
                <span className="text-6xl font-black font-mono text-amber-400">{restSecondsLeft}</span>
                <span className="block text-xs uppercase text-zinc-400 tracking-wider font-semibold mt-1">Seconds</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-zinc-400 block">Up Next</span>
              <h3 className="text-xl font-bold text-white mt-1">
                {currentSet > 1 ? `${currentExercise.name} (Set ${currentSet} of ${currentExercise.sets})` : currentExercise.name}
              </h3>
            </div>

            <button
              onClick={handleSkipRest}
              className="px-6 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center space-x-2 mx-auto transition"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip Rest & Resume Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                      Exercise {currentExerciseIndex + 1} of {routine.exercises.length}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-black text-zinc-300 font-semibold border border-zinc-800">
                      {currentExercise.targetMuscle}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    {currentExercise.name}
                  </h1>
                  {currentExercise.subtitle && (
                    <span className="text-sm font-semibold text-amber-400/90 block mt-0.5">
                      {currentExercise.subtitle}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 bg-black p-3 rounded-2xl border border-zinc-800">
                  <div className="text-center px-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Current Set</span>
                    <span className="text-xl font-black text-amber-400">
                      {currentSet} <span className="text-xs text-zinc-600">/ {currentExercise.sets}</span>
                    </span>
                  </div>
                  <div className="w-[1px] h-8 bg-zinc-800" />
                  <div className="text-center px-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Target Reps</span>
                    <span className="text-lg font-black text-white">{currentExercise.reps}</span>
                  </div>
                </div>
              </div>

              {/* Form Guidance & Common Mistakes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-black border border-zinc-800/80 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle className="w-4 h-4" /> Form Cues
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1.5">
                    {currentExercise.formTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black border border-zinc-800/80 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4" /> Mistakes to Avoid
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1.5">
                    {currentExercise.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Complete Set Action Button */}
              <button
                onClick={handleCompleteSet}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 fill-black text-amber-400" />
                <span>COMPLETE SET {currentSet} OF {currentExercise.sets}</span>
              </button>
            </div>

            {/* Routine Queue */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                Full Routine Lineup ({routine.exercises.length} Movements)
              </span>
              <div className="space-y-2">
                {routine.exercises.map((ex, idx) => {
                  const isCurrent = idx === currentExerciseIndex;
                  const isDone = idx < currentExerciseIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : isDone
                          ? 'bg-zinc-900/40 border-zinc-900 text-zinc-600 line-through'
                          : 'bg-black border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                          {idx + 1}
                        </span>
                        <span>{ex.name}</span>
                      </div>
                      <span>
                        {ex.sets} sets × {ex.reps}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
