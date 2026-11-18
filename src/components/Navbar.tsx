import React from 'react';
import {
  Flame,
  Droplets,
  Zap,
  Settings,
  Volume2,
  VolumeX,
  Dumbbell,
  MessageSquareText,
  Utensils,
  Video,
  TrendingUp,
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types/fitness';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile;
  settings: AppSettings;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onQuickAddWater: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  settings,
  onOpenSettings,
  onToggleSound,
  onQuickAddWater,
}) => {
  const navItems = [
    { id: 'coach', label: 'AI Coach', icon: MessageSquareText },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition & Macros', icon: Utensils },
    { id: 'vision', label: 'Live Rep Counter', icon: Video, badge: 'Vision AI' },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo: FitGuru AI */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('coach')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition">
              <Zap className="w-6 h-6 text-black fill-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
                  FitGuru AI
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[11px] block text-zinc-400 font-medium">
                Elite AI Fitness & Nutrition Coach
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black bg-gradient-to-r from-amber-500 to-orange-500 text-black uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Top Quick Stats & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Streak Counter */}
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold"
              title="Daily Training Streak"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>{profile.streakDays}d Streak</span>
            </div>

            {/* Quick Water Button */}
            <button
              onClick={onQuickAddWater}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition"
              title="Click to log 1 glass of water (250ml)"
            >
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>{profile.waterGlassesToday}/8 Glasses</span>
            </button>

            {/* Calories Burned Today */}
            <div
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold"
              title="Calories burned today from training"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{profile.caloriesBurnedToday} kcal</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition"
              title={settings.soundEffectsEnabled ? 'Mute Audio Cues' : 'Enable Audio Cues'}
            >
              {settings.soundEffectsEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition"
              title="Settings & Profile"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-zinc-900 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
