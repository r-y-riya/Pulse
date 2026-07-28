import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../services/api';
import { Exercise, WorkoutPlan } from '../../types';
import toast from 'react-hot-toast';
import { 
  Sparkles, Plus, Trash2, Search, Calendar, Clock, Flame, BookOpen, Activity
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [aiOptimization, setAiOptimization] = useState<{ plan: string; explanation: string } | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      dayOfWeek: 1,
      notes: '',
      estimatedDuration: 45,
      estimatedCalories: 300,
      exercises: [] as { exerciseId: string; name: string; category: string; setsCount: number; repsRange: string; targetRpe: number }[]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises"
  });

  const fetchPlannerData = async () => {
    try {
      const [exRes, planRes] = await Promise.all([
        api.get('/workouts/exercises'),
        api.get('/workouts/plans')
      ]);
      setExercises(exRes.data);
      setPlans(planRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load planner assets");
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const handleAddExerciseToForm = (ex: Exercise) => {
    append({
      exerciseId: ex._id,
      name: ex.name,
      category: ex.category,
      setsCount: 3,
      repsRange: '8-12',
      targetRpe: 8
    });
    toast.success(`Added ${ex.name}`);
  };

  const handleOptimizeWorkout = async () => {
    setOptimizing(true);
    try {
      const res = await api.post('/ai/optimize');
      setAiOptimization(res.data);
      toast.success("Pulse AI Planner optimization completed!");
    } catch (err) {
      console.error(err);
      toast.error("AI optimization failed.");
    } finally {
      setOptimizing(false);
    }
  };

  const applyAIOptimization = () => {
    if (!aiOptimization) return;

    reset({
      name: 'AI Optimized Routine',
      dayOfWeek: new Date().getDay(),
      notes: aiOptimization.explanation.substring(0, 100) + '...',
      estimatedDuration: 50,
      estimatedCalories: 350,
      exercises: [
        { exerciseId: exercises.find(e => e.category === 'strength')?._id || '', name: 'Barbell Deadlift', category: 'strength', setsCount: 4, repsRange: '5', targetRpe: 8 },
        { exerciseId: exercises.find(e => e.category === 'hypertrophy')?._id || '', name: 'Lat Pulldowns', category: 'hypertrophy', setsCount: 3, repsRange: '10', targetRpe: 8 },
        { exerciseId: exercises.find(e => e.name.toLowerCase().includes('row'))?._id || '', name: 'Chest-Supported Row', category: 'hypertrophy', setsCount: 3, repsRange: '12', targetRpe: 9 }
      ]
    });
    setAiOptimization(null);
    setShowBuilder(true);
    toast.success("AI Routine loaded into Planner builder!");
  };

  const handleFormSubmit = async (data: any) => {
    if (data.exercises.length === 0) {
      return toast.error("Please add at least one exercise to the routine");
    }

    try {
      const res = await api.post('/workouts/plan', data);
      setPlans(prev => [...prev, res.data]);
      toast.success("Routine scheduled successfully!");
      setShowBuilder(false);
      reset({
        name: '',
        dayOfWeek: 1,
        notes: '',
        estimatedDuration: 45,
        estimatedCalories: 300,
        exercises: []
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule plan");
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await api.delete(`/workouts/plan/${id}`);
      setPlans(prev => prev.filter(p => p._id !== id));
      toast.success("Routine removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ex.bodyPart.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Routine Planner</h2>
          <p className="text-xs text-text-muted">Design custom splits or optimize with Pulse AI telemetry</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOptimizeWorkout}
            disabled={optimizing}
            className="pulse-btn-secondary flex items-center gap-1.5"
          >
            <Sparkles size={14} /> {optimizing ? 'Analyzing CNS...' : 'AI Optimize Routine'}
          </button>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="pulse-btn-primary"
          >
            {showBuilder ? 'Close Builder' : 'Create Custom Split +'}
          </button>
        </div>
      </div>

      {/* AI Recommendation Box */}
      {aiOptimization && (
        <div className="pulse-card border-primary bg-white animate-in zoom-in-95 duration-200">
          <h3 className="text-sm font-bold text-primary uppercase mb-3 flex items-center gap-1.5">
            <Sparkles size={16} /> Pulse AI Recommendation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-light p-4 rounded-xl border border-border space-y-2">
              <p className="text-xs font-bold text-text-heading">Optimized Plan Split</p>
              <pre className="text-xs text-text-body font-sans whitespace-pre-wrap leading-relaxed">{aiOptimization.plan}</pre>
            </div>
            <div className="bg-surface-light p-4 rounded-xl border border-border flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-text-heading">CNS Rationale Explanation</p>
                <p className="text-xs text-text-body leading-relaxed mt-2">{aiOptimization.explanation}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyAIOptimization}
                  className="flex-1 pulse-btn-primary"
                >
                  Load in Builder
                </button>
                <button
                  onClick={() => setAiOptimization(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-text-body text-xs font-bold rounded-xl"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Builder */}
      {showBuilder && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Builder Form */}
          <div className="lg:col-span-2 pulse-card space-y-4">
            <h3 className="text-sm font-bold text-text-heading">Custom Routine Details</h3>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Routine Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Posterior Pull Protocol"
                    {...register('name', { required: true })}
                    className="pulse-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Scheduling Day</label>
                  <select
                    {...register('dayOfWeek')}
                    className="pulse-input w-full font-bold text-text-body"
                  >
                    {weekdays.map((day, idx) => (
                      <option key={idx} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exercises inside routine */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Exercises included</p>
                {fields.length === 0 ? (
                  <p className="text-xs text-text-muted italic text-center py-6 border border-dashed border-border rounded-xl">
                    Select exercises from the library on the right to start building your routine.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-3 bg-surface-light rounded-xl border border-border flex items-center justify-between gap-4 text-xs shadow-sm">
                        <div className="flex-1">
                          <span className="font-bold text-text-heading">{field.name}</span>
                          <span className="text-[9px] text-text-muted bg-white border border-border px-2 py-0.5 rounded ml-2 uppercase font-semibold">
                            {field.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Sets"
                            {...register(`exercises.${index}.setsCount` as const, { valueAsNumber: true })}
                            className="pulse-input w-16 text-center"
                          />
                          <input
                            type="text"
                            placeholder="Reps"
                            {...register(`exercises.${index}.repsRange` as const)}
                            className="pulse-input w-20 text-center"
                          />
                          <input
                            type="number"
                            placeholder="RPE"
                            {...register(`exercises.${index}.targetRpe` as const, { valueAsNumber: true })}
                            className="pulse-input w-16 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-danger hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Est. Duration (mins)</label>
                  <input
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    className="pulse-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Est. Burned (kcal)</label>
                  <input
                    type="number"
                    {...register('estimatedCalories', { valueAsNumber: true })}
                    className="pulse-input w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full pulse-btn-primary py-3"
              >
                Schedule Routine
              </button>
            </form>
          </div>

          {/* Exercise selector drawer */}
          <div className="pulse-card flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-heading">Choose Exercises</h3>
            
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pulse-input pl-9 w-full"
              />
            </div>

            {/* List */}
            <div className="space-y-2 overflow-y-auto max-h-96 pr-1">
              {filteredExercises.map(ex => (
                <div key={ex._id} className="p-3 bg-surface-light border border-border rounded-xl flex items-center justify-between text-xs shadow-sm">
                  <div>
                    <p className="font-bold text-text-heading">{ex.name}</p>
                    <p className="text-[10px] text-text-muted capitalize mt-0.5">{ex.bodyPart} • {ex.equipment}</p>
                  </div>
                  <button
                    onClick={() => handleAddExerciseToForm(ex)}
                    className="p-1.5 bg-primary-light text-primary hover:bg-primary/20 rounded-lg"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Routine list grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Your Weekly Schedule Split</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan._id} className="pulse-card flex flex-col justify-between gap-4">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-primary bg-primary-light border border-primary/20 px-2.5 py-0.5 rounded-full capitalize">
                    {plan.dayOfWeek !== undefined ? weekdays[plan.dayOfWeek] : 'Scheduled'}
                  </span>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="text-text-muted hover:text-danger p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <h4 className="text-sm font-bold text-text-heading mt-3">{plan.name}</h4>
                <p className="text-xs text-text-body mt-1">{plan.exercises?.length || 0} exercises configured</p>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {plan.exercises?.map((e, idx) => (
                    <span key={idx} className="text-[9px] bg-zinc-50 border border-border text-text-body px-2 py-0.5 rounded-lg shadow-sm font-semibold">
                      {e.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-text-muted border-t border-border pt-3 font-semibold">
                <span className="flex items-center gap-1"><Clock size={12} /> {plan.estimatedDuration} min</span>
                <span className="flex items-center gap-1"><Flame size={12} /> {plan.estimatedCalories} kcal</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PlannerPage;
