import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Check, Sparkles, AlertCircle, Info, ChevronRight, Save
} from 'lucide-react';
import api from '../../services/api';
import { Exercise, WorkoutPlan } from '../../types';
import toast from 'react-hot-toast';

export const ActiveWorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  
  // Gym timer states
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<any>(null);

  // Rest timer states
  const [restSeconds, setRestSeconds] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const restTimerRef = useRef<any>(null);

  // Active workout structure
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([]);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [sleepHours, setSleepHours] = useState(8);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/workouts/plans');
        setPlans(res.data);
        if (res.data.length > 0) {
          loadPlan(res.data[0]);
        } else {
          loadDefaultPlan();
        }
      } catch (err) {
        console.error(err);
        loadDefaultPlan();
      }
    };
    fetchPlans();
    return () => {
      stopTimer();
      stopRestTimer();
    };
  }, []);

  const startTimer = () => {
    if (isActive) return;
    setIsActive(true);
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(0);
  };

  const startRestTimer = (duration: number = 90) => {
    stopRestTimer();
    setRestSeconds(duration);
    setIsRestActive(true);
    
    restTimerRef.current = setInterval(() => {
      setRestSeconds(prev => {
        if (prev <= 1) {
          stopRestTimer();
          toast.success("Rest complete! Start your next set.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    setIsRestActive(false);
  };

  const loadPlan = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    const exercisesMapped = plan.exercises.map(ex => {
      const sets = [];
      for (let i = 0; i < (ex.setsCount || 3); i++) {
        sets.push({
          weight: 60,
          reps: 10,
          rpe: ex.targetRpe || 8,
          completed: false
        });
      }
      return {
        name: ex.name,
        category: ex.category || 'strength',
        sets
      };
    });
    setWorkoutExercises(exercisesMapped);
    resetTimer();
    startTimer();
  };

  const loadDefaultPlan = () => {
    const defaultPlan: WorkoutPlan = {
      _id: 'default',
      name: 'Push Protocol (Hypertrophy)',
      exercises: [
        { name: 'Incline Dumbbell Press', setsCount: 4, repsRange: '10', targetRpe: 8 },
        { name: 'Cable Lateral Raise', setsCount: 3, repsRange: '15', targetRpe: 8 },
        { name: 'Tricep Rope Pushdowns', setsCount: 3, repsRange: '12', targetRpe: 8 }
      ],
      estimatedDuration: 45,
      estimatedCalories: 300,
      isCompleted: false
    };
    loadPlan(defaultPlan);
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    const updated = [...workoutExercises];
    const isCompletedNow = !updated[exIdx].sets[setIdx].completed;
    updated[exIdx].sets[setIdx].completed = isCompletedNow;
    setWorkoutExercises(updated);

    if (isCompletedNow) {
      toast.success(`Set ${setIdx + 1} completed! Rest timer activated.`);
      startRestTimer(90);
    }
  };

  const updateSetMetric = (exIdx: number, setIdx: number, field: 'weight' | 'reps' | 'rpe', val: any) => {
    const updated = [...workoutExercises];
    updated[exIdx].sets[setIdx][field] = val;
    setWorkoutExercises(updated);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleFinishWorkout = async () => {
    const completedExercises = workoutExercises.map(ex => ({
      name: ex.name,
      category: ex.category,
      sets: ex.sets.filter((s: any) => s.completed)
    })).filter(ex => ex.sets.length > 0);

    if (completedExercises.length === 0) {
      return toast.error("Please complete at least one exercise set before saving!");
    }

    setSaving(true);
    try {
      const payload = {
        name: selectedPlan?.name || "Push Protocol",
        exercises: completedExercises,
        duration: Math.round(seconds / 60) || 1,
        calories: Math.round(seconds / 60) * 6,
        mood,
        energy,
        soreness,
        sleepHours,
        notes
      };

      await api.post('/workouts/log', payload);
      toast.success("Workout logged successfully! Streak updated!");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync log to database");
    } finally {
      setSaving(false);
    }
  };

  const activeExercise = workoutExercises[currentExerciseIdx];

  return (
    <div className="space-y-6 pb-16">
      {/* Session Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">{selectedPlan?.name || 'Active Session'}</h2>
          <p className="text-xs text-text-muted">CNS tracking and rest interval timers active</p>
        </div>

        {/* Switch dropdown */}
        <select
          onChange={(e) => {
            const plan = plans.find(p => p._id === e.target.value);
            if (plan) loadPlan(plan);
          }}
          className="pulse-input font-bold text-text-body"
        >
          <option value="">Switch Routine...</option>
          {plans.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Gym timer and navigator */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Gym Timer Box */}
          <div className="pulse-card flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Total Elapsed Time</span>
            <span className="text-4xl font-mono font-extrabold text-primary tracking-wider">{formatTime(seconds)}</span>
            
            {/* Timer control buttons */}
            <div className="flex gap-3 mt-4">
              <button 
                onClick={isActive ? stopTimer : startTimer}
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-text-heading transition-colors"
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-text-heading transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Rest Timer Box */}
          {isRestActive && (
            <div className="pulse-card border-mint bg-emerald-50/40 flex flex-col items-center justify-center text-center animate-bounce">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Rest Interval Timer</span>
              <span className="text-3xl font-mono font-extrabold text-mint">{restSeconds}s</span>
              <button 
                onClick={stopRestTimer}
                className="mt-3 text-[10px] bg-white border border-mint text-emerald-600 font-bold px-3 py-1 rounded-full shadow-sm hover:bg-zinc-50"
              >
                Skip Rest
              </button>
            </div>
          )}

          {/* Exercise navigation list */}
          <div className="pulse-card space-y-3">
            <h3 className="text-xs font-bold text-text-heading uppercase tracking-wider">Exercise roadmap</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {workoutExercises.map((ex, idx) => {
                const isCurrent = idx === currentExerciseIdx;
                const completedSets = ex.sets.filter((s: any) => s.completed).length;
                const totalSets = ex.sets.length;
                const isFullyComplete = completedSets === totalSets && totalSets > 0;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentExerciseIdx(idx)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isCurrent 
                        ? 'bg-primary-light border-primary/20 text-primary font-bold shadow-sm' 
                        : isFullyComplete
                          ? 'bg-emerald-50/50 border-mint/20 text-text-body font-semibold'
                          : 'bg-white border-border text-text-muted hover:bg-surface-hover hover:text-text-heading'
                    }`}
                  >
                    <div>
                      <p className="text-xs truncate">{ex.name}</p>
                      <p className="text-[9px] mt-0.5">{completedSets} of {totalSets} sets logged</p>
                    </div>
                    {isFullyComplete && <Check size={14} className="text-mint shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Current exercise set logger & biometrics logs */}
        <div className="lg:col-span-2 space-y-6">
          {activeExercise ? (
            <div className="pulse-card space-y-6">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{activeExercise.category}</span>
                  <h3 className="text-lg font-bold text-text-heading">{activeExercise.name}</h3>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-light border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Step {currentExerciseIdx + 1} of {workoutExercises.length}
                </span>
              </div>

              {/* Set tracking inputs list */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4 text-center text-[10px] font-bold text-text-muted uppercase tracking-wider pb-1 border-b border-border">
                  <span>Set</span>
                  <span>Weight (kg)</span>
                  <span>Reps</span>
                  <span>RPE</span>
                </div>

                <div className="space-y-2">
                  {activeExercise.sets.map((set: any, sIdx: number) => (
                    <div 
                      key={sIdx} 
                      className={`grid grid-cols-4 gap-4 items-center p-2 rounded-xl transition-colors ${
                        set.completed ? 'bg-emerald-50/30' : 'bg-surface-light border border-border'
                      }`}
                    >
                      <span className="text-xs font-bold text-center text-text-heading">Set {sIdx + 1}</span>
                      
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => updateSetMetric(currentExerciseIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)}
                        className="pulse-input text-center py-1 text-xs"
                      />
                      
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSetMetric(currentExerciseIdx, sIdx, 'reps', parseInt(e.target.value) || 0)}
                        className="pulse-input text-center py-1 text-xs"
                      />
                      
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="number"
                          value={set.rpe}
                          min="1"
                          max="10"
                          onChange={(e) => updateSetMetric(currentExerciseIdx, sIdx, 'rpe', parseInt(e.target.value) || 8)}
                          className="pulse-input text-center py-1 text-xs w-full"
                        />
                        
                        <button
                          onClick={() => toggleSetComplete(currentExerciseIdx, sIdx)}
                          className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                            set.completed 
                              ? 'bg-mint border-mint text-white' 
                              : 'bg-white border-border text-text-muted hover:border-primary/40'
                          }`}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Set Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  disabled={currentExerciseIdx === 0}
                  onClick={() => setCurrentExerciseIdx(prev => prev - 1)}
                  className="pulse-btn-secondary py-1.5 px-4 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={currentExerciseIdx === workoutExercises.length - 1}
                  onClick={() => setCurrentExerciseIdx(prev => prev + 1)}
                  className="pulse-btn-secondary py-1.5 px-4 disabled:opacity-40"
                >
                  Next Exercise
                </button>
              </div>
            </div>
          ) : (
            <div className="pulse-card text-center py-12">
              <p className="text-xs text-text-muted italic">Configure a schedule routine split to load tracker details.</p>
            </div>
          )}

          {/* Biometrics telemetry form */}
          <div className="pulse-card space-y-4">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Log Post-Workout Telemetry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Mood Index (1-5)</label>
                  <input
                    type="range" min="1" max="5" value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Energy Index (1-5)</label>
                  <input
                    type="range" min="1" max="5" value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Soreness Level (1-5)</label>
                  <input
                    type="range" min="1" max="5" value={soreness}
                    onChange={(e) => setSoreness(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Sleep Hours (WoW)</label>
                  <input
                    type="number" step="0.5" value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value) || 8)}
                    className="pulse-input w-full"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Notes / Telemetry observations</label>
              <textarea
                placeholder="RPE felt higher on squats. Bench press progression looks clean today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="pulse-input w-full h-20 resize-none"
              />
            </div>

            <button
              onClick={handleFinishWorkout}
              disabled={saving}
              className="w-full pulse-btn-primary flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{saving ? "Saving Logs..." : "Finish and Save Workout"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActiveWorkoutPage;
