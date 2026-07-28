import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Heart, Calendar as CalendarIcon, Sparkles, TrendingUp, 
  PlusCircle, Activity, ChevronLeft, ChevronRight, Moon, Coffee, AlertCircle
} from 'lucide-react';

interface DailyLog {
  date: string;
  symptoms: string[];
  flow: 'light' | 'medium' | 'heavy' | 'spotting' | 'none';
  mood: 'calm' | 'happy' | 'anxious' | 'irritable' | 'sad' | 'tired';
  energy: number;
  painLevel: number;
}

interface CycleAnalytics {
  hasData: boolean;
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  phase: 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';
  phaseTitle: string;
  recommendation: string;
  nextPeriod: string;
  daysUntilNext: number;
  ovulationDate: string;
  dailyLogs: DailyLog[];
}

export const WomensHealthPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CycleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFlow, setSelectedFlow] = useState<'light' | 'medium' | 'heavy' | 'spotting' | 'none'>('none');
  const [selectedMood, setSelectedMood] = useState<'calm' | 'happy' | 'anxious' | 'irritable' | 'sad' | 'tired'>('calm');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [periodLength, setPeriodLength] = useState<number>(5);
  const [cycleLength, setCycleLength] = useState<number>(28);

  const symptomOptions = ['Cramps', 'Bloating', 'Headache', 'Backache', 'Fatigue', 'Acne', 'Breast Tenderness', 'Nausea'];

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/cycle/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cycle telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleToggleSymptom = (symptom: string) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleRegisterCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading("Registering cycle start...");
    try {
      await api.post('/cycle/log', {
        startDate,
        cycleLength,
        periodLength,
        date: startDate,
        flow: 'medium', // Default starting flow
        mood: 'calm',
        energy: 3,
        painLevel: 1
      });
      toast.dismiss();
      toast.success("New cycle registered!");
      fetchAnalytics();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to register cycle");
    }
  };

  const handleLogDay = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading("Logging cycle parameters...");
    try {
      await api.post('/cycle/log', {
        date: logDate,
        flow: selectedFlow,
        mood: selectedMood,
        energy: energyLevel,
        painLevel,
        symptoms
      });
      toast.dismiss();
      toast.success("Cycle parameters logged!");
      fetchAnalytics();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to log symptoms");
    }
  };

  // Fertile window calculation helper (5 days before ovulation to 1 day after)
  const getFertileWindowStr = () => {
    if (!analytics?.ovulationDate) return '';
    const ov = new Date(analytics.ovulationDate);
    const start = new Date(ov);
    start.setDate(ov.getDate() - 5);
    const end = new Date(ov);
    end.setDate(ov.getDate() + 1);
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-100 rounded w-1/4" />
        <div className="h-44 bg-zinc-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-zinc-100 rounded-2xl" />
          <div className="h-80 bg-zinc-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const phaseColors: Record<string, string> = {
    menstruation: 'bg-pink text-red-500 border-pink',
    follicular: 'bg-primary-light text-primary border-primary/20',
    ovulation: 'bg-mint/20 text-emerald-600 border-mint/30',
    luteal: 'bg-peach/20 text-amber-600 border-peach/30',
    unknown: 'bg-zinc-100 text-zinc-500 border-zinc-200'
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Pulse Cycle Ledger</h2>
        <p className="text-sm text-text-muted mt-1">Hormonal phase synchronization, symptoms telemetry, and workout adaptors.</p>
      </div>

      {analytics && analytics.hasData ? (
        <>
          {/* Top Banner: Predicted metrics & predictions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phase info card */}
            <div className="pulse-card flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Current Cycle Status</span>
                <h3 className="text-2xl font-extrabold text-text-heading">{analytics.phaseTitle}</h3>
                <p className="text-xs text-text-muted">Day {analytics.currentDay} of {analytics.cycleLength}-day cycle</p>
              </div>
              <div className={`mt-4 px-3 py-1.5 rounded-full text-xs font-bold text-center border ${phaseColors[analytics.phase || 'unknown']}`}>
                {analytics.phase?.toUpperCase()} Phase Active
              </div>
            </div>

            {/* Next Period Prediction */}
            <div className="pulse-card flex flex-col justify-between group">
              <div className="space-y-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Next Period Forecast</span>
                <h3 className="text-3xl font-extrabold text-red-400">
                  {analytics.daysUntilNext} <span className="text-xs text-text-muted font-bold">Days Away</span>
                </h3>
                <p className="text-xs text-text-muted">Expected: {new Date(analytics.nextPeriod).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="text-[10px] text-text-muted font-semibold bg-surface-light border border-border px-3 py-1.5 rounded-xl flex items-center gap-1">
                <CalendarIcon size={12} className="text-primary" /> Est. Ovulation: {new Date(analytics.ovulationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Fertile window */}
            <div className="pulse-card flex flex-col justify-between group">
              <div className="space-y-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Estimated Fertile Window</span>
                <h3 className="text-2xl font-extrabold text-mint">
                  {getFertileWindowStr()}
                </h3>
                <p className="text-xs text-text-muted">6-day peak fertility slot</p>
              </div>
              <div className="text-[10px] text-text-muted font-semibold bg-surface-light border border-border px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Sparkles size={12} className="text-mint" /> High biological readiness
              </div>
            </div>
          </div>

          {/* AI recommendations panel */}
          <div className="pulse-card flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-red-400">
              <Sparkles size={18} />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Pulse Phase-based suggestions</h3>
            </div>
            <div className="bg-surface-light p-4 rounded-xl border border-border space-y-3">
              <p className="text-xs text-text-body leading-relaxed">{analytics.recommendation}</p>
            </div>
          </div>

          {/* Log metrics form & calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form logger */}
            <div className="pulse-card lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Log Daily Cycle Telemetry</h3>
              
              <form onSubmit={handleLogDay} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="pulse-input w-full shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Period Flow</label>
                    <select
                      value={selectedFlow}
                      onChange={(e) => setSelectedFlow(e.target.value as any)}
                      className="pulse-input w-full text-text-body font-bold"
                    >
                      <option value="none">No Flow (Dry)</option>
                      <option value="spotting">Spotting</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Energy Index (1-5)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-xs font-extrabold text-primary px-2 py-0.5 rounded bg-primary-light">{energyLevel}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Cramps / Pain Level (0-5)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={painLevel}
                        onChange={(e) => setPainLevel(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-400"
                      />
                      <span className="text-xs font-extrabold text-red-500 px-2 py-0.5 rounded bg-pink">{painLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Dominant Mood</label>
                    <select
                      value={selectedMood}
                      onChange={(e) => setSelectedMood(e.target.value as any)}
                      className="pulse-input w-full text-text-body font-bold"
                    >
                      <option value="calm">Calm & Balanced</option>
                      <option value="happy">Happy & High Energy</option>
                      <option value="anxious">Anxious / Overthinking</option>
                      <option value="irritable">Irritable / Short Temper</option>
                      <option value="sad">Sad / Low Motivation</option>
                      <option value="tired">Tired / Exhausted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Select Symptoms</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                      {symptomOptions.map(sym => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => handleToggleSymptom(sym)}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold text-left transition-all ${
                            symptoms.includes(sym)
                              ? 'bg-pink text-red-500 border-pink'
                              : 'bg-white text-text-body border-border hover:bg-zinc-50'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full pulse-btn-primary py-2.5 mt-2"
                  >
                    Save Daily Log
                  </button>
                </div>
              </form>
            </div>

            {/* Previous history list */}
            <div className="pulse-card space-y-4">
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Cycle Daily Ledger</h3>
              
              <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
                {analytics.dailyLogs.length === 0 ? (
                  <p className="text-xs text-text-muted italic text-center py-12">No logs saved for this cycle.</p>
                ) : (
                  [...analytics.dailyLogs].reverse().map((log, idx) => (
                    <div key={idx} className="p-3 bg-surface-light border border-border rounded-xl space-y-2 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-heading">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[10px] bg-pink text-red-500 px-2 py-0.5 rounded font-bold capitalize">Flow: {log.flow}</span>
                      </div>
                      <p className="text-[10px] text-text-body font-semibold">Mood: <span className="capitalize">{log.mood}</span> • Energy: {log.energy}/5 • Pain: {log.painLevel}/5</p>
                      {log.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {log.symptoms.map(s => (
                            <span key={s} className="text-[9px] bg-white border border-border px-1.5 py-0.5 rounded text-text-muted">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Setup / Welcome view if no data exists yet */
        <div className="pulse-card max-w-xl mx-auto p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink flex items-center justify-center text-red-500 mx-auto shadow-sm">
            <Heart size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-text-heading">Initialize Your Cycle Telemetry</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Log your last period start date to calculate predicted ovulation, fertile windows, next cycle forecasts, and unlock phase-synchronized wellness, strength training, and recovery recommendations.
            </p>
          </div>

          <form onSubmit={handleRegisterCycle} className="space-y-4 text-left border-t border-border pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Start Date of Last Period</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pulse-input w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Typical Period Length (Days)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(parseInt(e.target.value))}
                  className="pulse-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Average Cycle Length (Days)</label>
              <input
                type="number"
                min="20"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value))}
                className="pulse-input w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full pulse-btn-primary py-3 font-bold text-sm"
            >
              Start Cycle Forecasting
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default WomensHealthPage;
