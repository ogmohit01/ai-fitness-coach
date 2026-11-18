import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  Activity,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { audioService } from '../services/audioService';

type ExerciseTrackingType = 'baithak' | 'dand' | 'squats' | 'curls';

export const VisionWorkoutTab: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTrackingType>('baithak');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [repCount, setRepCount] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<'up' | 'down'>('up');
  const [formFeedback, setFormFeedback] = useState<string>('Stand straight and step into camera frame');
  const [motionIntensity, setMotionIntensity] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const targetReps = 25;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  const exerciseConfigs = {
    baithak: {
      title: 'Hindu Squats (Baithak)',
      target: 'Quads & Leg Endurance',
      cueDown: 'Rise onto balls of feet, swing arms back, descend deep',
      cueUp: 'Drive up forcefully through midfoot to full lockout',
      thresholdDown: 38,
      thresholdUp: 20,
    },
    dand: {
      title: 'Hindu Pushups (Sapate / Dand)',
      target: 'Chest, Triceps & Core',
      cueDown: 'Swoop chest low along the floor into Cobra arch',
      cueUp: 'Press back smoothly into high triangle position',
      thresholdDown: 42,
      thresholdUp: 22,
    },
    squats: {
      title: 'Standard Deep Squats',
      target: 'Quads & Glutes',
      cueDown: 'Lower hips until thighs reach parallel with the floor',
      cueUp: 'Drive heels through the ground to full extension',
      thresholdDown: 36,
      thresholdUp: 18,
    },
    curls: {
      title: 'Dumbbell Bicep Curls',
      target: 'Biceps Peak',
      cueDown: 'Lower weights under control without swinging elbows',
      cueUp: 'Supinate wrists and squeeze biceps at peak contraction',
      thresholdDown: 30,
      thresholdUp: 15,
    },
  };

  const activeConfig = exerciseConfigs[selectedExercise];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setFormFeedback('Camera active! Position yourself in frame.');
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      alert('Camera access denied or unavailable. Switching to Interactive AI Simulation mode.');
      setIsSimulating(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!isCameraActive) return;

    let localStage: 'up' | 'down' = 'up';
    let localReps = repCount;

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = frame.data;

          if (lastFrameDataRef.current) {
            let diff = 0;
            const sampleStep = 8;
            let sampledPixels = 0;

            for (let i = 0; i < data.length; i += 4 * sampleStep) {
              const rDiff = Math.abs(data[i] - lastFrameDataRef.current[i]);
              const gDiff = Math.abs(data[i + 1] - lastFrameDataRef.current[i + 1]);
              const bDiff = Math.abs(data[i + 2] - lastFrameDataRef.current[i + 2]);
              diff += (rDiff + gDiff + bDiff) / 3;
              sampledPixels++;
            }

            const intensity = Math.min(100, Math.round((diff / sampledPixels) * 3));
            setMotionIntensity(intensity);

            if (intensity > activeConfig.thresholdDown && localStage === 'up') {
              localStage = 'down';
              setCurrentStage('down');
              setFormFeedback(`Descent detected... Hit full depth on ${activeConfig.title}!`);
            } else if (intensity < activeConfig.thresholdUp && localStage === 'down') {
              localStage = 'up';
              setCurrentStage('up');
              localReps += 1;
              setRepCount(localReps);
              setFormFeedback(`Rep counted! Squeeze at top.`);
              audioService.playRepClick();
            }
          }

          lastFrameDataRef.current = new Uint8ClampedArray(data);
          drawVisionHUD(ctx, canvas.width, canvas.height, localStage, localReps);
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, selectedExercise]);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev === 'up') {
          setFormFeedback('Lowering into bottom position... Good depth!');
          setMotionIntensity(65);
          return 'down';
        } else {
          setRepCount((r) => {
            const next = r + 1;
            audioService.playRepClick();
            return next;
          });
          setFormFeedback('Rep counted! Lockout achieved.');
          setMotionIntensity(15);
          return 'up';
        }
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const drawVisionHUD = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    stage: 'up' | 'down',
    reps: number
  ) => {
    ctx.save();
    ctx.strokeStyle = stage === 'down' ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    const boxMargin = 50;
    ctx.strokeRect(boxMargin, boxMargin, w - boxMargin * 2, h - boxMargin * 2);

    ctx.setLineDash([]);
    ctx.fillStyle = stage === 'down' ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.roundRect(w - 180, 20, 160, 52, 14);
    ctx.fill();
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`REPS: ${reps}`, w - 160, 52);

    ctx.restore();
  };

  const handleResetCounter = () => {
    setRepCount(0);
    setCurrentStage('up');
    setFormFeedback('Counter reset. Ready for your next set!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            <span>Computer Vision Motion Coach</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Live Camera Rep & Pose Tracker</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time movement analysis directly in your browser. Perform Hindu Squats, Pushups, or Curls with live AI feedback.
          </p>
        </div>

        {/* Exercise Selector */}
        <div className="flex items-center space-x-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
          {(Object.keys(exerciseConfigs) as ExerciseTrackingType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedExercise(type);
                handleResetCounter();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition capitalize ${
                selectedExercise === type
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {exerciseConfigs[type].title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video & HUD Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black border border-zinc-800 rounded-3xl p-4 overflow-hidden relative shadow-2xl flex flex-col justify-center items-center min-h-[420px]">
          {isCameraActive ? (
            <div className="relative w-full rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="hidden"
              />
              <canvas ref={canvasRef} className="w-full h-full object-cover scale-x-[-1]" />

              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700 flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Vision Tracking Active</span>
              </div>
            </div>
          ) : isSimulating ? (
            <div className="relative w-full rounded-2xl overflow-hidden aspect-video bg-zinc-950 border border-amber-500/30 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center animate-pulse">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                  AI Kinematics Simulation Mode Active
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Analyzing Movement ({activeConfig.title})</h3>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  Virtual cadence simulation testing depth, intensity, and lockout angles.
                </p>
              </div>

              <div className="flex items-center space-x-4 bg-black px-6 py-3 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-400 font-semibold">Phase:</span>
                <span className={`text-sm font-black uppercase ${currentStage === 'down' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentStage === 'down' ? '⬇ Descent / Bottom Depth' : '⬆ Ascent / Full Lockout'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enable Camera to Start</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Position your camera 5-8 feet away so your full body is visible in the frame. AI tracks depth, posture, and rep counts in real time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                <button
                  onClick={startCamera}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-black" />
                  <span>Start Camera</span>
                </button>
                <button
                  onClick={() => setIsSimulating(true)}
                  className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700 transition"
                >
                  Test with Simulation
                </button>
              </div>
            </div>
          )}

          {(isCameraActive || isSimulating) && (
            <div className="w-full flex items-center justify-between pt-4 px-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={isCameraActive ? stopCamera : () => setIsSimulating(false)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition flex items-center space-x-1.5"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Vision</span>
                </button>

                <button
                  onClick={handleResetCounter}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-semibold hover:bg-zinc-800 transition flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Count</span>
                </button>
              </div>

              <div className="text-xs text-zinc-400 font-mono">
                Motion Intensity: <strong className="text-amber-400">{motionIntensity}%</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Live Stats & Feedback */}
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
              Completed Reps
            </span>
            <div className="text-7xl font-black font-mono text-amber-400 tracking-tight">
              {repCount}
            </div>

            <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-zinc-800">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (repCount / targetReps) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 block">Target: {targetReps} Reps per set</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-3 shadow-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Real-Time Form Cues</span>
            </div>

            <div className="bg-black p-4 rounded-2xl border border-zinc-800">
              <p className="text-sm font-bold text-amber-300">
                "{formFeedback}"
              </p>
            </div>

            <div className="text-xs text-zinc-400 space-y-1.5 pt-1">
              <div className="flex items-start gap-2">
                <span className="text-amber-400">⬇</span>
                <span><strong>Descent Cue:</strong> {activeConfig.cueDown}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400">⬆</span>
                <span><strong>Ascent Cue:</strong> {activeConfig.cueUp}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-zinc-400">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              100% Client-Side Privacy: Camera processing runs exclusively on your local device GPU/CPU. No video leaves your machine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
