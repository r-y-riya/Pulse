import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import api from '../../services/api';
import { WorkoutLog } from '../../types';
import toast from 'react-hot-toast';
import { 
  History, Clock, Flame, Smile, Zap, MessageSquare, Trash2, Award, Calendar as CalendarIcon
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/workouts/history');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load workout history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this workout log? This cannot be undone.")) return;

    try {
      await api.delete(`/workouts/log/${id}`);
      setLogs(prev => prev.filter(log => log._id !== id));
      toast.success("Workout log removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete log");
    }
  };

  // Find workouts logged on selected date
  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date).toDateString();
    return logDate === selectedDate.toDateString();
  });

  // Calculate day-tile class names to highlight logged days
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasWorkout = logs.some(log => new Date(log.date).toDateString() === date.toDateString());
      if (hasWorkout) {
        return 'bg-primary-light text-primary font-bold border border-primary/20 scale-105';
      }
    }
    return '';
  };

  // Calculate volume per log
  const calculateVolume = (log: WorkoutLog) => {
    let volume = 0;
    log.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) volume += (s.weight * s.reps);
      });
    });
    return volume;
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Workout History</h2>
        <p className="text-sm text-text-muted">Review completed workouts, volume telemetry, and historical stats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monthly Calendar View */}
        <div className="lg:col-span-1 pulse-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-heading mb-4 flex items-center gap-2 uppercase tracking-wider">
              <CalendarIcon size={16} className="text-primary" /> Monthly Overview
            </h3>
            <div className="p-1 bg-surface rounded-xl border border-border">
              <Calendar
                onChange={(val) => setSelectedDate(val as Date)}
                value={selectedDate}
                tileClassName={tileClassName}
              />
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-surface-light border border-border space-y-2 text-xs font-semibold">
            <div className="flex justify-between items-center text-text-muted">
              <span>Total Logged Sessions:</span>
              <span className="font-bold text-text-heading">{logs.length}</span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>Selected Date:</span>
              <span className="font-bold text-primary">{selectedDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Workouts Logged for Selected Date */}
        <div className="lg:col-span-2 pulse-card flex flex-col gap-4">
          <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">
            Logs for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>

          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border bg-surface-light rounded-2xl">
                <History className="text-text-muted w-10 h-10 mx-auto opacity-40 mb-2" />
                <p className="text-xs text-text-muted font-bold">No workouts logged on this date.</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log._id} className="p-5 bg-surface border border-border rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-text-heading">{log.name}</h4>
                      <p className="text-[10px] text-text-muted font-bold uppercase mt-1">Logged session telemetry</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteLog(log._id)}
                      className="text-text-muted hover:text-danger p-2 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete log"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center p-3 bg-surface-light rounded-xl border border-border">
                    <div>
                      <p className="text-[9px] text-text-muted font-bold uppercase">Duration</p>
                      <p className="text-xs font-bold text-text-heading flex items-center justify-center gap-1 mt-0.5">
                        <Clock size={12} className="text-primary" /> {log.duration} mins
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-text-muted font-bold uppercase">Est. Calories</p>
                      <p className="text-xs font-bold text-text-heading flex items-center justify-center gap-1 mt-0.5">
                        <Flame size={12} className="text-orange-500" /> {log.calories} kcal
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-text-muted font-bold uppercase">Lifting Volume</p>
                      <p className="text-xs font-bold text-text-heading flex items-center justify-center gap-1 mt-0.5">
                        <Zap size={12} className="text-primary" /> {calculateVolume(log).toLocaleString()} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-text-muted font-bold uppercase">CNS Recovery</p>
                      <p className="text-xs font-bold text-text-heading flex items-center justify-center gap-1 mt-0.5">
                        <Smile size={12} className="text-mint" /> {log.energy}/5 Energy
                      </p>
                    </div>
                  </div>

                  {/* Exercises and sets log */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border pb-1">Exercise selections</p>
                    {log.exercises.map((ex, idx) => (
                      <div key={idx} className="p-3 bg-surface-light border border-border rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-text-heading">{ex.name}</span>
                          <span className="text-[9px] bg-white border border-border text-text-muted px-2 py-0.5 rounded font-bold uppercase">{ex.category || 'exercise'}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {ex.sets.map((set, sIdx) => (
                            <span key={sIdx} className="text-[10px] bg-white border border-border rounded-lg px-2.5 py-1 text-text-body font-semibold shadow-xs">
                              S{sIdx+1}: <span className="font-bold text-text-heading">{set.weight}kg</span> x {set.reps} <span className="text-[9px] text-text-muted">(RPE {set.rpe})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {log.notes && (
                    <div className="p-3 bg-primary-light border border-primary/10 rounded-xl flex gap-2 text-xs">
                      <MessageSquare size={14} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-text-body italic">"{log.notes}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HistoryPage;
