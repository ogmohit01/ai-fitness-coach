import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AICoachTab } from './components/AICoachTab';
import { WorkoutPlannerTab } from './components/WorkoutPlannerTab';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { NutritionTab } from './components/NutritionTab';
import { VisionWorkoutTab } from './components/VisionWorkoutTab';
import { ProgressTab } from './components/ProgressTab';
import { SettingsModal } from './components/SettingsModal';
import { UserProfile, AppSettings, WorkoutRoutine, WorkoutHistoryEntry } from './types/fitness';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('coach');
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => storageService.getRoutines());
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>(() => storageService.getHistory());
  const [activeRoutineForWorkout, setActiveRoutineForWorkout] = useState<WorkoutRoutine | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleToggleSound = () => {
    const updated = { ...settings, soundEffectsEnabled: !settings.soundEffectsEnabled };
    setSettings(updated);
    storageService.saveSettings(updated);
    if (updated.soundEffectsEnabled) {
      audioService.playGoPing();
    }
  };

  const handleQuickAddWater = () => {
    const updatedCount = profile.waterGlassesToday >= 8 ? 0 : profile.waterGlassesToday + 1;
    const updated = { ...profile, waterGlassesToday: updatedCount };
    setProfile(updated);
    storageService.saveProfile(updated);
    if (settings.soundEffectsEnabled) {
      audioService.playBeep(1050, 80, 'sine');
    }
  };

  const handleStartWorkout = (routine: WorkoutRoutine) => {
    setActiveRoutineForWorkout(routine);
    if (settings.soundEffectsEnabled) {
      audioService.playGoPing();
    }
  };

  const handleCompleteWorkout = (entry: WorkoutHistoryEntry) => {
    storageService.logCompletedWorkout(entry);
    setHistory(storageService.getHistory());
    setProfile(storageService.getProfile());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={handleToggleSound}
        onQuickAddWater={handleQuickAddWater}
      />

      {/* Main Tab Views */}
      <main className="flex-1 pb-12">
        {activeTab === 'coach' && (
          <AICoachTab
            profile={profile}
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings(newSettings)}
          />
        )}

        {activeTab === 'workouts' && (
          <WorkoutPlannerTab
            profile={profile}
            settings={settings}
            routines={routines}
            onUpdateRoutines={setRoutines}
            onStartWorkout={handleStartWorkout}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab
            profile={profile}
            settings={settings}
            onUpdateProfile={setProfile}
          />
        )}

        {activeTab === 'vision' && <VisionWorkoutTab />}

        {activeTab === 'progress' && (
          <ProgressTab
            profile={profile}
            history={history}
            onUpdateProfile={setProfile}
          />
        )}
      </main>

      {/* Live Interactive Workout Session Modal */}
      {activeRoutineForWorkout && (
        <ActiveWorkoutModal
          routine={activeRoutineForWorkout}
          onClose={() => setActiveRoutineForWorkout(null)}
          onCompleteWorkout={handleCompleteWorkout}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          profile={profile}
          onClose={() => setIsSettingsOpen(false)}
          onSaveSettings={setSettings}
          onSaveProfile={setProfile}
        />
      )}
    </div>
  );
}

export default App;
