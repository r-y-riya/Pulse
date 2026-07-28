import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Calendar as CalendarIcon, Flame, Heart, Clock, Play, Sparkles, 
  AlertCircle, ArrowUpRight, TrendingUp, Droplet, User, Activity, Moon, Quote
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../../services/api';
import { Telemetry, WorkoutLog, WorkoutPlan } from '../../types';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [nutrition, setNutrition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [telRes, histRes, planRes, nutrRes] = await Promise.all([
        api.get('/workouts/telemetry'),
        api.get('/workouts/history'),
        api.get('/workouts/plans'),
        api.get(`/nutrition/log/${todayStr}`).catch(() => ({ data: null }))
      ]);
      setTelemetry(telRes.data);
      setHistory(histRes.data);
      setPlans(planRes.data);
      setNutrition(nutrRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const generateAIPerformancePlan = async () => {
    toast.loading("Optimizing tomorrow's workout via AI...");
    try {
      await api.post('/ai/optimize');
      toast.dismiss();
      toast.success("AI Workout Optimized! Check Workout Planner.");
      navigate('/planner');
    } catch (err) {
      toast.dismiss();
      toast.error("AI service optimization failed.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => <div key={n} className="h-28 bg-zinc-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-zinc-100 rounded-2xl col-span-2" />
          <div className="h-80 bg-zinc-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate consistency heatmap cells
  const renderHeatmap = () => {
    const today = new Date();
    const cells = [];
    const dateMap = new Set(
      history.map(log => new Date(log.date).toDateString())
    );

    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const tempDate = new Date(startDate);
    while (tempDate <= today) {
      const dateStr = tempDate.toDateString();
      const trained = dateMap.has(dateStr);
      cells.push({
        date: new Date(tempDate),
        trained
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs text-text-muted mb-2 font-semibold">
          <span>Workout Frequency Heatmap</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-100 border border-border" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/60 border border-primary/10" />
            <span>More</span>
          </div>
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2 scrollbar-none">
          {cells.map((cell, idx) => (
            <div
              key={idx}
              title={`${cell.date.toLocaleDateString()}: ${cell.trained ? 'Logged Workout' : 'No logs'}`}
              className={`w-3 h-3 rounded-sm transition-all duration-300 ${
                cell.trained 
                  ? 'bg-gradient-to-br from-primary to-secondary shadow-sm scale-105 border border-primary/20' 
                  : 'bg-zinc-50 border border-border hover:bg-zinc-100'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Find today's plan
  const todayDayOfWeek = new Date().getDay();
  const todaysPlan = plans.find(p => p.dayOfWeek === todayDayOfWeek || (p.date && new Date(p.date).toDateString() === new Date().toDateString()));

  // Prepare chart data for weekly workout duration
  const chartData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => {
    const dayLogs = history.filter(log => new Date(log.date).getDay() === idx);
    const duration = dayLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    return { name: dayName, minutes: duration };
  });

  const recoveryScore = telemetry?.recovery?.score || 85;
  const sleepScore = telemetry?.recovery?.sleepScore || 80;
  const energyScore = telemetry?.recovery?.energyScore || 75;

  const totalCalsTarget = 2000;
  const currentCals = nutrition?.totalCalories || 0;
  const calPercent = Math.min(100, Math.round((currentCals / totalCalsTarget) * 100));

  const totalProteinTarget = 140;
  const currentProtein = nutrition?.totalProtein || 0;
  const proteinPercent = Math.min(100, Math.round((currentProtein / totalProteinTarget) * 100));

  const totalWaterTarget = 3000;
  const currentWater = nutrition?.waterIntake || 0;
  const waterPercent = Math.min(100, Math.round((currentWater / totalWaterTarget) * 100));

  // BMI Info
  const bmiWeight = 72; // default mock
  const bmiHeight = 178; // default mock
  const bmiVal = ((bmiWeight / ((bmiHeight / 100) * (bmiHeight / 100)))).toFixed(1);
  
  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Daily Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Welcome Back, Athlete!</h2>
          <p className="text-sm text-text-muted mt-1">Here is your biometrics telemetry sync for today.</p>
        </div>
        
        {/* Quick Actions buttons */}
        <div className="flex justify-end gap-2.5">
          <Link to="/active-workout" className="pulse-btn-primary flex items-center gap-1.5">
            <Play size={14} fill="currentColor" /> Start Workout
          </Link>
          <button 
            onClick={generateAIPerformancePlan}
            className="pulse-btn-secondary flex items-center gap-1.5"
          >
            <Sparkles size={14} className="text-primary" /> Optimize Plan
          </button>
        </div>
      </div>

      {/* Quote Widget */}
      <div className="bg-surface border border-border p-4 rounded-[20px] shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-primary-light rounded-xl text-primary shrink-0">
          <Quote size={18} />
        </div>
        <div className="text-xs">
          <span className="font-bold text-text-heading italic">"Continuous improvement is better than delayed perfection."</span>
          <span className="text-text-muted ml-2 font-medium">— Mark Twain</span>
        </div>
      </div>

      {/* KPI Cards Row (Recovery, Streak, Sleep, BMI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Recovery Score with custom CSS Progress Ring */}
        <div className="pulse-card flex items-center justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Recovery Index</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-primary">
                {recoveryScore}%
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-medium">CNS readiness is excellent</p>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#E5EEF7" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="#5CB8FF" strokeWidth="4" fill="transparent" 
                      strokeDasharray="138" strokeDashoffset={138 - (138 * recoveryScore) / 100} />
            </svg>
            <Heart size={16} className="text-primary absolute" />
          </div>
        </div>

        {/* Card 2: Workout Streak */}
        <div className="pulse-card flex items-center justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Workout Streak</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-amber-500">
                {telemetry?.streaks?.currentStreak || 0}
              </span>
              <span className="text-xs text-text-muted font-bold">Days</span>
            </div>
            <p className="text-[10px] text-text-muted font-medium">Record: {telemetry?.streaks?.longestStreak || 0} days</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <Flame size={22} />
          </div>
        </div>

        {/* Card 3: Sleep Score */}
        <div className="pulse-card flex items-center justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Sleep Analysis</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-lavender">
                {sleepScore}%
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-medium">7.5 hrs of deep quality cycles</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-lavender shadow-sm shrink-0">
            <Moon size={22} />
          </div>
        </div>

        {/* Card 4: BMI Tracker */}
        <div className="pulse-card flex items-center justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">BMI Biometrics</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-mint">
                {bmiVal}
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-medium">Weight: {bmiWeight}kg • Healthy Category</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-mint shadow-sm shrink-0">
            <User size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Nutrition progress bars, Workout bar chart, AI suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Weekly Chart & Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Workout progress chart card */}
          <div className="pulse-card flex flex-col justify-between gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Weekly Workout Activity</h3>
                <p className="text-[10px] text-text-muted">Total minutes logged per day</p>
              </div>
              <span className="text-[10px] bg-primary-light text-primary px-2.5 py-0.5 rounded-full font-bold border border-primary/20">
                Live Activity
              </span>
            </div>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#F1F7FF' }} />
                  <Bar dataKey="minutes" fill="#5CB8FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Heatmap Grid */}
          <div className="pulse-card">
            {renderHeatmap()}
          </div>
        </div>

        {/* Right Side: Biometric Rings & AI Coach suggestions */}
        <div className="space-y-6">
          {/* Calorie & Protein Progress card */}
          <div className="pulse-card space-y-4">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Nutrition Integration</h3>
            
            {/* Calories progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-text-body">
                <span>Calories (kcal)</span>
                <span>{currentCals} / {totalCalsTarget}</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${calPercent}%` }} />
              </div>
            </div>

            {/* Protein progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-text-body">
                <span>Protein (g)</span>
                <span>{currentProtein}g / {totalProteinTarget}g</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-mint h-full rounded-full transition-all duration-300" style={{ width: `${proteinPercent}%` }} />
              </div>
            </div>

            {/* Water progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-text-body">
                <span>Water Hydration</span>
                <span>{currentWater}ml / {totalWaterTarget}ml</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all duration-300" style={{ width: `${waterPercent}%` }} />
              </div>
            </div>
          </div>

          {/* AI Suggestions Insight */}
          <div className="pulse-card flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={18} />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">Pulse Coach Suggestions</h3>
              </div>
              
              <div className="bg-surface-light p-4 rounded-xl border border-border space-y-3">
                <p className="text-xs font-bold text-text-heading">CNS Telemetry Analysis</p>
                <p className="text-xs text-text-body leading-relaxed">
                  {telemetry?.balance?.imbalances?.[0] || "Your recovery scoring is optimal. We recommend pushing training intensity on compound lifts today."}
                </p>
                
                {telemetry?.risk?.warnings && telemetry.risk.warnings.length > 0 && (
                  <div className="flex items-start gap-2 text-[10px] text-amber-500 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 font-medium">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{telemetry.risk.warnings[0]}</span>
                  </div>
                )}
              </div>
            </div>

            <Link to="/coach" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-6 font-bold border-t border-border pt-4 group">
              Consult Interactive Coach <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Today's Plan & Upcoming sessions list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Plan */}
        <div className="pulse-card flex flex-col justify-between">
          <h3 className="text-sm font-bold text-text-heading mb-4 flex items-center gap-2 uppercase tracking-wider">
            <CalendarIcon size={16} className="text-primary" /> Today's Target Session
          </h3>

          {todaysPlan ? (
            <div className="p-4 rounded-xl bg-surface-light border border-border flex flex-col justify-between flex-1 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-heading">{todaysPlan.name}</span>
                  <span className="text-[10px] bg-primary-light text-primary px-2.5 py-0.5 rounded-full font-bold border border-primary/20">Active Routine</span>
                </div>
                <p className="text-xs text-text-body">Includes {todaysPlan.exercises?.length || 0} exercises selection</p>
                
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {todaysPlan.exercises?.map((ex, i) => (
                    <span key={i} className="text-[10px] bg-white border border-border text-text-body px-2.5 py-0.5 rounded-lg shadow-sm font-medium">
                      {ex.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-xs text-text-muted font-bold">Est. Duration: {todaysPlan.estimatedDuration} min</span>
                <Link to="/active-workout" className="pulse-btn-primary py-1 px-4 text-xs font-bold shadow-sm">
                  Start Training
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-surface-light border border-dashed border-border text-center flex flex-col items-center justify-center flex-1 gap-2">
              <p className="text-xs text-text-muted font-semibold">No workouts scheduled for today.</p>
              <Link to="/planner" className="text-xs text-primary hover:underline font-bold mt-1">
                Schedule a routine now +
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming plan schedule */}
        <div className="pulse-card flex flex-col justify-between">
          <h3 className="text-sm font-bold text-text-heading mb-4 uppercase tracking-wider">Upcoming Roadmap</h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-48">
            {plans.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">No scheduled routines planned yet.</p>
            ) : (
              plans.filter(p => !p.isCompleted).slice(0, 3).map((plan, idx) => (
                <div key={plan._id} className="p-3 rounded-xl bg-surface-light border border-border flex items-center justify-between text-xs shadow-sm">
                  <div>
                    <p className="font-bold text-text-heading">{plan.name}</p>
                    <p className="text-text-muted text-[10px] mt-0.5 font-semibold">
                      {plan.dayOfWeek !== undefined 
                        ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][plan.dayOfWeek] 
                        : new Date(plan.date || '').toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-primary font-bold">{plan.estimatedDuration} mins</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
