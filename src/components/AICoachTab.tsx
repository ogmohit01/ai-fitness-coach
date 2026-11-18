import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  ChatMessage,
  UserProfile,
  AppSettings,
  CoachPersonaId
} from '../types/fitness';
import { COACH_PERSONAS } from '../data/coaches';
import { geminiService } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

interface AICoachTabProps {
  profile: UserProfile;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const AICoachTab: React.FC<AICoachTabProps> = ({
  profile,
  settings,
  onUpdateSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = storageService.getChatMessages();
    if (saved && saved.length > 0) return saved;

    const initialCoach = COACH_PERSONAS.find((c) => c.id === settings.activeCoachId) || COACH_PERSONAS[0];
    return [
      {
        id: 'msg-welcome-fitguru',
        sender: 'coach',
        coachId: initialCoach.id,
        text: `**Welcome, ${profile.name}!** I am your **${initialCoach.name}**. 🦾\n\nI see your current target is **${profile.primaryGoal.replace('_', ' ').toUpperCase()}** and your bodyweight is **${profile.weightKg}kg**. Whether you want a customized workout split, biomechanical form checks (Squats, Hindu Pushups, Curls), high-protein Indian diet strategies (Sattu, Paneer, Soya Chunks), or relentless accountability—I am in your corner.\n\n*"${initialCoach.mantra}"*\n\nWhat are we conquering today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeCoach = COACH_PERSONAS.find((c) => c.id === settings.activeCoachId) || COACH_PERSONAS[0];

  const quickPrompts = [
    '🥗 High-Protein Vegetarian Indian Diet (120g+ protein without meat)',
    '🦾 Proper form & rep scheme for Hindu Squats (Baithak) and Hindu Pushups (Sapate)',
    '🧘‍♀️ 15-Minute Morning Sun Salutation & Breathing Flow',
    '🥛 Sattu vs Whey Protein: Exact macro breakdown and timing',
    '🔥 How to lose stubborn belly fat while retaining lean muscle',
    '💪 Home Dumbbell Chest & Biceps Hypertrophy Workout',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    storageService.saveChatMessages(messages);
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isLoading) return;

    audioService.stopSpeaking();
    setCurrentlySpeakingId(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const replyText = await geminiService.chatWithCoach(
        prompt,
        settings.activeCoachId,
        profile,
        settings.geminiApiKey,
        settings.geminiModel
      );

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        coachId: settings.activeCoachId,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, coachMsg]);

      if (settings.voiceFeedbackEnabled) {
        audioService.speakCoach(replyText, activeCoach);
        setCurrentlySpeakingId(coachMsg.id);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `coach-err-${Date.now()}`,
        sender: 'coach',
        coachId: settings.activeCoachId,
        text: 'Encountered a momentary connection issue. Please try again!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = (msg: ChatMessage) => {
    if (currentlySpeakingId === msg.id) {
      audioService.stopSpeaking();
      setCurrentlySpeakingId(null);
    } else {
      audioService.speakCoach(msg.text, activeCoach);
      setCurrentlySpeakingId(msg.id);
    }
  };

  const handleSwitchCoach = (coachId: CoachPersonaId) => {
    onUpdateSettings({ ...settings, activeCoachId: coachId });
    audioService.stopSpeaking();
    setCurrentlySpeakingId(null);

    const newCoach = COACH_PERSONAS.find((c) => c.id === coachId);
    if (newCoach) {
      const switchNotice: ChatMessage = {
        id: `switch-${Date.now()}`,
        sender: 'system',
        text: `Switched active coach to **${newCoach.name}** (${newCoach.title}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, switchNotice]);
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear your chat conversation?')) {
      audioService.stopSpeaking();
      const initialCoach = COACH_PERSONAS.find((c) => c.id === settings.activeCoachId) || COACH_PERSONAS[0];
      const resetMsg: ChatMessage = {
        id: `msg-welcome-${Date.now()}`,
        sender: 'coach',
        coachId: initialCoach.id,
        text: `Chat cleared! Ready when you are, **${profile.name}**. What goal are we attacking today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([resetMsg]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Coach Header Card with Yashvant Singh */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 mb-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <span className="text-4xl p-2.5 rounded-2xl bg-black border border-zinc-800 shadow-inner">
              {activeCoach.avatar}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide">{activeCoach.name}</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
                  {activeCoach.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">{activeCoach.description}</p>
              <span className="text-[11px] text-amber-400/90 font-medium italic mt-0.5 block">
                "{activeCoach.mantra}"
              </span>
            </div>
          </div>

          {/* Coach Switcher Buttons */}
          <div className="flex items-center space-x-1.5 self-end sm:self-center bg-black p-1.5 rounded-2xl border border-zinc-800">
            {COACH_PERSONAS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSwitchCoach(c.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  settings.activeCoachId === c.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span>{c.avatar}</span>
                <span className="hidden lg:inline">{c.name.split(' ')[1] || c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pitch Black Chat Messages Box */}
      <div className="flex-1 bg-black border border-zinc-900 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 mb-4 shadow-2xl">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isUser = msg.sender === 'user';
          const coach = COACH_PERSONAS.find((c) => c.id === msg.coachId) || activeCoach;

          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-black font-black'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                }`}
              >
                {isUser ? <User className="w-5 h-5 text-black" /> : <span>{coach.avatar}</span>}
              </div>

              <div className="max-w-[85%] sm:max-w-[78%] space-y-1">
                <div className={`flex items-center space-x-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs font-bold text-zinc-400">
                    {isUser ? profile.name : coach.name}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">{msg.timestamp}</span>
                </div>

                <div
                  className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-xl border ${
                    isUser
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500/40 rounded-tr-none'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-2">
                    {msg.text.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h4 key={i} className="text-base font-extrabold text-amber-400 mt-2 mb-1 flex items-center gap-1.5">
                            {line.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('#### ')) {
                        return (
                          <h5 key={i} className="text-sm font-bold text-emerald-400 mt-2 mb-1">
                            {line.replace('#### ', '')}
                          </h5>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote key={i} className="border-l-2 border-amber-500 pl-3 italic text-zinc-300 my-1 bg-amber-500/5 py-1 rounded-r">
                            {line.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return (
                        <p key={i} className="leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {!isUser && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-900">
                      <button
                        onClick={() => handleToggleSpeak(msg)}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                          currentlySpeakingId === msg.id
                            ? 'bg-amber-500 text-black'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                        title="Listen to Coach Voice"
                      >
                        {currentlySpeakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> AI Coach Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg">
              {activeCoach.avatar}
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl rounded-tl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs text-zinc-300 font-semibold">
                  {activeCoach.name} is engineering your personalized coaching answer...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="text-xs px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-amber-300 border border-zinc-800 whitespace-nowrap shrink-0 transition flex items-center space-x-1.5 shadow-sm"
          >
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-2.5 flex items-center gap-2 shadow-2xl">
        <button
          onClick={handleClearChat}
          className="p-2.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-2xl transition"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Speech-To-Text */}
        <button
          onClick={handleToggleVoiceInput}
          className={`p-2.5 rounded-2xl transition ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title={isRecording ? 'Listening... click to stop' : 'Talk hands-free to FitGuru AI Coach'}
        >
          {isRecording ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder={`Ask ${activeCoach.name} anything about workouts, diet, form, or macros...`}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};
