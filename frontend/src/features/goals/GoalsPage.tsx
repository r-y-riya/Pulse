import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Goal } from '../../types';
import toast from 'react-hot-toast';
import { 
  Target, Plus, Calendar, Check, Trash2, Award, ChevronRight, CircleDot, Sparkles
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [type, setType] = useState<'lose_fat' | 'gain_muscle' | 'maintain' | 'strength' | 'custom'>('gain_muscle');
  const [title, setTitle] = useState('');
  const [targetWeight, setTargetWeight] = useState(70);
  const [targetCalories, setTargetCalories] = useState(2500);
  const [targetFrequency, setTargetFrequency] = useState(4);
  const [deadline, setDeadline] = useState('');

  // Local-storage backed state for Goals
  const [localGoals, setLocalGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('pulse_goals');
    if (saved) {
      setLocalGoals(JSON.parse(saved));
    } else {
      const initial: Goal[] = [
        { _id: 'g1', type: 'gain_muscle', title: 'Increase Lean Muscle Mass', targetWeight: 75, targetCalories: 2600, targetWorkoutFrequency: 4, deadline: '2026-12-01', progressPercent: 45, status: 'active', createdAt: new Date().toISOString() },
        { _id: 'g2', type: 'lose_fat', title: 'Reduce Body Fat to 12%', targetWeight: 68, targetCalories: 1800, targetWorkoutFrequency: 4, deadline: '2026-09-01', progressPercent: 20, status: 'active', createdAt: new Date().toISOString() }
      ];
      setLocalGoals(initial);
      localStorage.setItem('pulse_goals', JSON.stringify(initial));
    }
    setLoading(false);
  }, []);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Please enter a goal description");

    const newGoal: Goal = {
      _id: Date.now().toString(),
      type,
      title,
      targetWeight,
      targetCalories,
      targetWorkoutFrequency: targetFrequency,
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progressPercent: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const updated = [...localGoals, newGoal];
    setLocalGoals(updated);
    localStorage.setItem('pulse_goals', JSON.stringify(updated));
    toast.success("Goal established!");
    setShowBuilder(false);
    setTitle('');
  };

  const handleIncrementProgress = (id: string) => {
    const updated = localGoals.map(g => {
      if (g._id === id) {
        const nextProg = Math.min(100, g.progressPercent + 10);
        return {
          ...g,
          progressPercent: nextProg,
          status: nextProg === 100 ? 'completed' as const : 'active' as const
        };
      }
      return g;
    });
    setLocalGoals(updated);
    localStorage.setItem('pulse_goals', JSON.stringify(updated));
    toast.success("Progress index synced!");
  };

  const handleDeleteGoal = (id: string) => {
    const updated = localGoals.filter(g => g._id !== id);
    setLocalGoals(updated);
    localStorage.setItem('pulse_goals', JSON.stringify(updated));
    toast.success("Goal removed");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Pulse Goals</h2>
          <p className="text-sm text-text-muted mt-1 font-medium">Establish and monitor bio-targets, frequencies, and milestones</p>
        </div>
        
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="pulse-btn-primary flex items-center gap-1.5"
        >
          <Plus size={14} /> {showBuilder ? 'Cancel Builder' : 'Establish Goal'}
        </button>
      </div>

      {/* Goal Builder Form */}
      {showBuilder && (
        <div className="pulse-card max-w-2xl mx-auto animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-bold text-text-heading mb-4 uppercase tracking-wider">Goal Configuration Builder</h3>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Goal Strategy</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="pulse-input w-full font-bold text-text-body"
                >
                  <option value="gain_muscle">Muscle Hypertrophy</option>
                  <option value="lose_fat">Fat Cut / Caloric Deficit</option>
                  <option value="maintain">Biometric Maintenance</option>
                  <option value="strength">Absolute Strength</option>
                  <option value="custom">Custom Goal</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Goal Description</label>
                <input
                  type="text"
                  placeholder="e.g. Reach 72kg with 12% body fat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="pulse-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Target Weight (kg)</label>
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(parseInt(e.target.value) || 70)}
                  className="pulse-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Target Calorie Target</label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(parseInt(e.target.value) || 2000)}
                  className="pulse-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Weekly frequency</label>
                <input
                  type="number"
                  value={targetFrequency}
                  onChange={(e) => setTargetFrequency(parseInt(e.target.value) || 4)}
                  className="pulse-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="pulse-input w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full pulse-btn-primary py-2.5"
            >
              Establish Goal Profile
            </button>
          </form>
        </div>
      )}

      {/* Goals Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {localGoals.map(goal => {
          const isComplete = goal.status === 'completed';
          return (
            <div key={goal._id} className="pulse-card flex flex-col justify-between gap-4">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl shrink-0 ${isComplete ? 'bg-emerald-50 text-mint' : 'bg-primary-light text-primary'}`}>
                      <Target size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-heading">{goal.title}</h4>
                      <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">{goal.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="text-text-muted hover:text-danger p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs font-semibold text-text-body">
                  <div className="flex justify-between">
                    <span>Deadline Forecast:</span>
                    <span className="text-text-heading">{new Date(goal.deadline || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Calories:</span>
                    <span className="text-text-heading">{goal.targetCalories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lifting Frequency:</span>
                    <span className="text-text-heading">{goal.targetWorkoutFrequency} sessions / week</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-text-body">
                    <span>Progress completed</span>
                    <span>{goal.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-mint' : 'bg-primary'}`} 
                      style={{ width: `${goal.progressPercent}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border pt-3">
                <span className="text-[10px] text-text-muted font-bold">Status: {goal.status.toUpperCase()}</span>
                {!isComplete && (
                  <button
                    onClick={() => handleIncrementProgress(goal._id)}
                    className="pulse-btn-secondary py-1 px-3 text-xs flex items-center gap-1"
                  >
                    Increment 10% <Check size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default GoalsPage;
