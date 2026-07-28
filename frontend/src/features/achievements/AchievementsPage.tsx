import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Achievement } from '../../types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Award, Star, Trophy, Target, Zap, Clock
} from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/workouts/achievements');
        setAchievements(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) {
    return <div className="text-text-muted text-xs italic">Loading achievements locker...</div>;
  }

  // All badge blueprints
  const allBadges = [
    {
      id: 'first_pr',
      title: 'Iron Pioneer',
      description: 'Logged your first official workout session.',
      icon: Target,
      color: 'text-primary bg-primary-light border-primary/20'
    },
    {
      id: 'streak_7',
      title: 'Sustained Pulse',
      description: 'Maintained a workout consistency streak of 7 days.',
      icon: Clock,
      color: 'text-orange-500 bg-amber-50 border-amber-200'
    },
    {
      id: 'streak_30',
      title: 'Unstoppable Pulse',
      description: 'Maintained a workout consistency streak of 30 days.',
      icon: Trophy,
      color: 'text-amber-500 bg-yellow-50 border-yellow-200'
    },
    {
      id: 'workouts_100',
      title: 'Centurion Lifter',
      description: 'Completed 100 recorded workouts!',
      icon: Star,
      color: 'text-lavender bg-indigo-50 border-indigo-100'
    },
    {
      id: 'volume_10000',
      title: 'Titanium Force',
      description: 'Lifting volume exceeded 10,000 kg total volume.',
      icon: Zap,
      color: 'text-primary bg-primary-light border-primary/25'
    },
    {
      id: 'consistency_king',
      title: 'Consistency King',
      description: 'Trained at least 4 days a week for 4 consecutive weeks.',
      icon: Award,
      color: 'text-mint bg-emerald-50 border-mint/25'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Achievements Locker</h2>
        <p className="text-sm text-text-muted mt-1 font-medium">Unlock gamified milestones through consistency and lifting volume</p>
      </div>

      {/* Grid of badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allBadges.map((badge) => {
          const unlockedInfo = achievements.find(a => a.badgeId === badge.id);
          const isUnlocked = !!unlockedInfo;
          const Icon = badge.icon;

          return (
            <motion.div
              key={badge.id}
              initial={isUnlocked ? { scale: 0.95, opacity: 0.85 } : {}}
              animate={isUnlocked ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`p-6 rounded-[20px] border flex flex-col justify-between gap-4 relative overflow-hidden transition-all ${
                isUnlocked 
                  ? 'bg-white border-border shadow-md' 
                  : 'bg-zinc-50/50 border-border/80 opacity-50'
              }`}
            >
              {/* Background gradient flare if unlocked */}
              {isUnlocked && (
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-xs shrink-0 ${badge.color}`}>
                  <Icon size={22} className={!isUnlocked ? "text-text-muted" : ""} />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-text-heading">{badge.title}</h4>
                  <p className="text-xs text-text-body leading-relaxed">{badge.description}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center text-[10px] text-text-muted font-bold">
                <span>XP Reward: +150 XP</span>
                <span className={isUnlocked ? "text-mint font-extrabold" : "text-text-muted"}>
                  {isUnlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
export default AchievementsPage;
