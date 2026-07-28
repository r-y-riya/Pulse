import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Telemetry, WorkoutLog } from '../../types';
import toast from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts';
import { 
  LineChart as LineChartIcon, Activity, Sparkles, TrendingUp, HelpCircle
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [telRes, histRes] = await Promise.all([
        api.get('/workouts/telemetry'),
        api.get('/workouts/history')
      ]);
      setTelemetry(telRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics charts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-text-muted text-xs italic">Loading analytics dashboard...</div>;
  }

  // Map history logs into charts format (chronological order)
  const chartData = [...history].reverse().map(log => {
    let volume = 0;
    log.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) volume += (s.weight * s.reps);
      });
    });

    return {
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume,
      duration: log.duration || 0,
      calories: log.calories || 0,
    };
  });

  // Radar chart data for muscle balance
  const radarData = telemetry ? [
    { subject: 'Push', A: telemetry.balance.push, fullMark: 20 },
    { subject: 'Pull', A: telemetry.balance.pull, fullMark: 20 },
    { subject: 'Legs', A: telemetry.balance.legs, fullMark: 20 },
    { subject: 'Core', A: telemetry.balance.core, fullMark: 10 },
    { subject: 'Cardio', A: telemetry.balance.cardio, fullMark: 10 },
    { subject: 'Mobility', A: telemetry.balance.mobility, fullMark: 10 },
  ] : [];

  // Custom Light Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-border rounded-xl text-xs shadow-lg">
          <p className="font-bold text-text-heading mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }} className="font-bold">
              {item.name}: {item.value.toLocaleString()} {item.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Progress Analytics</h2>
        <p className="text-sm text-text-muted">CNS telemetry charts and progressive volume metrics</p>
      </div>

      {/* Muscle Balance Radar & Insight Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 pulse-card flex flex-col justify-between">
          <h3 className="text-sm font-bold text-text-heading mb-4 uppercase tracking-wider">Muscle Group Balance</h3>
          
          <div className="w-full h-64">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#E5EEF7" />
                  <PolarAngleAxis dataKey="subject" stroke="#4B5563" fontSize={10} fontWeight="bold" />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} stroke="#94A3B8" fontSize={9} />
                  <Radar name="Active Balance" dataKey="A" stroke="#5CB8FF" fill="#8FD3FF" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-text-muted italic text-center py-12">Log workouts to compute muscle strain balance.</p>
            )}
          </div>
        </div>

        {/* Insight Banner details */}
        <div className="lg:col-span-2 pulse-card flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={20} />
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Pulse Biometrics Analysis</h3>
            </div>
            
            <div className="bg-surface-light p-4 rounded-xl border border-border space-y-3">
              <p className="text-xs font-bold text-text-heading">Plateau Detection status</p>
              {telemetry?.plateaus && telemetry.plateaus.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-text-body">
                    Our plateau algorithm indicates stalling on: <span className="font-bold text-primary">{telemetry.plateaus.join(', ')}</span>.
                  </p>
                  <p className="text-xs text-text-muted">
                    We recommend decreasing target RPE or introducing minor accessory variants to kickstart muscle adaptation cycles.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-text-body">
                  No exercise plateau trends detected! Your estimated 1RM velocity output looks stable. Keep executing progressive overload.
                </p>
              )}
            </div>

            <div className="bg-surface-light p-4 rounded-xl border border-border space-y-2">
              <p className="text-xs font-bold text-text-heading">Muscle Strain Balance Indicators</p>
              <p className="text-xs text-text-body">
                {telemetry?.balance?.imbalances && telemetry.balance.imbalances.length > 0 ? (
                  `Alert: ${telemetry.balance.imbalances[0]}`
                ) : (
                  "Imbalance Index is below critical levels. Muscle loading split matches target frequency perfectly."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold mt-4 border-t border-border pt-3">
            <Activity size={14} className="text-primary" />
            <span>Biometrics calculation refreshed in real-time</span>
          </div>
        </div>
      </div>

      {/* Volume & Calories Progress graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Volume progress */}
        <div className="pulse-card flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Progressive Volume Load</h3>
              <p className="text-[10px] text-text-muted">Lifting load trends (kg) over logged workouts</p>
            </div>
            <TrendingUp size={16} className="text-primary" />
          </div>

          <div className="h-60 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5CB8FF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#5CB8FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="volume" name="Lifting Volume" unit="kg" stroke="#5CB8FF" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-text-muted italic text-center py-12">Log workouts to generate volume graphs.</p>
            )}
          </div>
        </div>

        {/* Card 2: Duration progress */}
        <div className="pulse-card flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Duration & Energy Spend</h3>
              <p className="text-[10px] text-text-muted font-semibold">Active workout duration in minutes</p>
            </div>
            <Activity size={16} className="text-mint" />
          </div>

          <div className="h-60 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="duration" name="Workout Duration" unit="mins" fill="#8CE6C9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-text-muted italic text-center py-12">Log workouts to generate duration bar charts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsPage;
