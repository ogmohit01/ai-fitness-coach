import React, { useState } from 'react';
import {
  X,
  Key,
  Save,
  Trash2,
  Eye,
  EyeOff,
  User,
  Sliders
} from 'lucide-react';
import { AppSettings, UserProfile, IndianDietPreference } from '../types/fitness';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
  settings: AppSettings;
  profile: UserProfile;
  onClose: () => void;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  profile,
  onClose,
  onSaveSettings,
  onSaveProfile,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(settings.geminiModel || 'gemini-2.5-flash');
  const [voiceFeedback, setVoiceFeedback] = useState(settings.voiceFeedbackEnabled);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffectsEnabled);

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [gender, setGender] = useState(profile.gender);
  const [heightCm, setHeightCm] = useState(profile.heightCm.toString());
  const [weightKg, setWeightKg] = useState(profile.weightKg.toString());
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel);
  const [dietaryPreference, setDietaryPreference] = useState<IndianDietPreference>(
    profile.dietaryPreference || 'high_protein_veg'
  );

  const handleSave = () => {
    const updatedSettings: AppSettings = {
      ...settings,
      geminiApiKey: apiKey.trim(),
      geminiModel: selectedModel,
      voiceFeedbackEnabled: voiceFeedback,
      soundEffectsEnabled: soundEffects,
      theme: 'black',
    };
    onSaveSettings(updatedSettings);
    storageService.saveSettings(updatedSettings);

    const updatedProfile: UserProfile = {
      ...profile,
      name: name.trim() || 'Alex Hunter',
      age: parseInt(age) || 25,
      gender,
      heightCm: parseInt(heightCm) || 176,
      weightKg: parseFloat(weightKg) || 72,
      activityLevel,
      dietaryPreference,
    };
    onSaveProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);

    onClose();
  };

  const handleClearAllData = () => {
    if (confirm('Warning: This will clear all logged workouts, chats, and customized meals. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">FitGuru AI Settings</h2>
              <span className="text-xs text-zinc-400">Configure Google Gemini AI & your biometric profile</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini API Key Section */}
        <div className="space-y-3 bg-black p-5 rounded-3xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" /> Google Gemini AI API Key
            </label>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                apiKey.trim()
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {apiKey.trim() ? 'Gemini Live Connected' : 'Smart Offline AI Engine'}
            </span>
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste Google AI Studio Gemini API Key (optional)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            If left blank, the app operates 100% offline with Coach Yashvant Singh's built-in intelligent engine. Adding your API key connects frontier Google Gemini LLM reasoning.
          </p>

          <div className="pt-2">
            <label className="text-xs font-bold text-zinc-400 block mb-1">Gemini Model Architecture</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended - High Speed & Intelligence)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Multi-Step Reasoning & Planning)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (Frontier Multimodal)</option>
            </select>
          </div>
        </div>

        {/* Audio & Feedback Options */}
        <div className="space-y-3 bg-black p-5 rounded-3xl border border-zinc-800">
          <label className="text-xs font-bold text-zinc-300 uppercase block">Audio & Voice Guidance</label>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-white block">Coach Text-To-Speech</span>
              <span className="text-[11px] text-zinc-500 block">Coach speaks responses out loud using browser speech synthesis</span>
            </div>
            <input
              type="checkbox"
              checked={voiceFeedback}
              onChange={(e) => setVoiceFeedback(e.target.checked)}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-white block">Sound Effects & Timers</span>
              <span className="text-[11px] text-zinc-500 block">Rest countdown beeps and workout completion triumph chimes</span>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Profile Biometrics */}
        <div className="space-y-4 bg-black p-5 rounded-3xl border border-zinc-800">
          <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-400" /> Biometric & Dietary Profile
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Dietary Preference</label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-2.5 py-2 text-xs text-white"
              >
                <option value="high_protein_veg">High-Protein Veg (Sattu + Paneer + Soya)</option>
                <option value="pure_veg">Pure Vegetarian</option>
                <option value="eggetarian">Eggetarian (Vegetarian + Eggs)</option>
                <option value="non_veg">Non-Vegetarian</option>
                <option value="jain">Jain Vegetarian</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-2.5 py-2 text-xs text-white"
              >
                <option value="sedentary">Sedentary (Desk Job)</option>
                <option value="light">Light Training (1-2 days/week)</option>
                <option value="moderate">Moderate Training (3-5 days/week)</option>
                <option value="very_active">Intense Training (6-7 days/week)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleClearAllData}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All Data</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-zinc-900 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center space-x-1.5 shadow-xl shadow-amber-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
