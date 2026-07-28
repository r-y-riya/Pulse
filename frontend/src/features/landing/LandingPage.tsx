import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, ShieldAlert, Cpu, Heart, CheckCircle2, ShieldCheck, Zap, ArrowRight, Activity } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen text-text-body selection:bg-primary/20">
      {/* Header navbar */}
      <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-sm">
              <Activity size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase">Pulse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-text-muted hover:text-text-heading text-sm font-bold transition-colors">Sign In</Link>
            <Link to="/register" className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/15 transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-white/80 backdrop-blur-md text-xs text-text-muted mb-6 font-bold shadow-sm"
        >
          <Zap size={12} className="text-primary" />
          <span>Biometric Intelligence for Elite Performance</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight text-text-heading"
        >
          Train Smarter. <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Not Just Harder.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-text-muted text-lg md:text-xl max-w-2xl mt-6 leading-relaxed font-medium"
        >
          Pulse leverages real-time CNS recovery analysis and training load models to synthesize personalized workout guides and meal planning. Effortless insight built to optimize your biology.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center mt-10 animate-in fade-in duration-300"
        >
          <Link to="/register" className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/15 transition-all flex items-center gap-2 group">
            Start Your Journey <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="border border-border bg-white hover:bg-zinc-50 text-text-body px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm">
            View Demo Dashboard
          </Link>
        </motion.div>
      </section>

      {/* Simulated Premium Dashboard Image Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative rounded-2xl border border-border bg-white p-4 shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {/* Mock dashboard screenshot container */}
          <div className="rounded-xl overflow-hidden border border-border bg-surface-light aspect-[16/9] p-6 flex flex-col justify-between">
            {/* Header row */}
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">P</div>
                <span className="text-xs font-bold text-text-muted">System Insights Engine</span>
              </div>
              <div className="w-16 h-4 bg-zinc-200 rounded" />
            </div>

            {/* Content preview */}
            <div className="grid grid-cols-3 gap-6 my-auto">
              <div className="p-4 rounded-xl bg-white border border-border flex flex-col gap-2 shadow-sm">
                <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">CNS Recovery Level</span>
                <span className="text-3xl font-extrabold text-primary">88%</span>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[88%]" />
                </div>
                <span className="text-[10px] text-text-muted font-semibold">Optimal readiness for hypertrophic loading</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-border flex flex-col gap-2 shadow-sm">
                <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Daily Muscle Strain</span>
                <span className="text-3xl font-extrabold text-mint">1.2</span>
                <span className="text-[10px] text-text-muted font-semibold">CNS indicates complete tissue alignment</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-border flex flex-col gap-2 shadow-sm">
                <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Plateau Status</span>
                <span className="text-3xl font-extrabold text-text-heading">LOW</span>
                <span className="text-[10px] text-text-muted font-semibold">Accessory exercises generated for stalls</span>
              </div>
            </div>

            {/* Bottom notification */}
            <div className="bg-white p-3 rounded-lg border border-border text-xs text-text-body flex items-center gap-3 shadow-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span>AI Coach: "Your push volume is 42% dominant this week. Tomorrow's planner optimized to pull/legs."</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core AI Grounded Features */}
      <section className="border-t border-border bg-white py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-heading">Scientific Architecture. Explainable Intelligence.</h2>
            <p className="text-text-muted mt-4 font-semibold">We reject the black-box approach. Every AI recommendation matches programmatic equations grounded in your training logs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-border bg-surface-light flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary shadow-sm">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-heading">1. Explainable Recommendations</h3>
              <p className="text-text-body text-sm leading-relaxed font-semibold">The AI Coach receives exact telemetry data (CNS scores, WoW volume trends) to generate workouts and explains the biomechanical justification behind each session.</p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface-light flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center text-mint shadow-sm">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-heading">2. Programmatic Safety Core</h3>
              <p className="text-text-body text-sm leading-relaxed font-semibold">Safety metrics, muscle splits, recovery indexes, and TDEE formulas are calculated deterministically. The LLM only processes these parameters to prevent hallucinations.</p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface-light flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-secondary shadow-sm">
                <Dumbbell size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-heading">3. Plateau & Injury Auditing</h3>
              <p className="text-text-body text-sm leading-relaxed font-semibold">Monitors estimated 1RM velocity trends and flags potential plateaus. Warns users of volume spikes exceeding 15% WoW to protect joints and tendons.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-heading">Simple, Transparent Pricing</h2>
          <p className="text-text-muted mt-4 font-semibold">Start optimizing your biometrics today. Select the plan that matches your training frequency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
          <div className="p-8 rounded-2xl border border-border bg-white flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-text-heading">Basic Lifter</h3>
              <p className="text-text-muted text-sm mt-1 font-semibold">Perfect for casual training logs</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-text-heading">$0</span>
                <span className="text-text-muted text-sm font-semibold"> / forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited workout logging', 'CNS recovery tracking formulas', 'Local history & achievements metrics', 'Basic exercise library access'].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-text-body font-semibold">
                    <CheckCircle2 size={16} className="text-mint shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/register" className="w-full text-center py-3 bg-surface-light hover:bg-surface-hover text-text-body font-bold rounded-xl transition-colors block border border-border">Get Started</Link>
          </div>

          <div className="p-8 rounded-2xl border border-primary bg-white flex flex-col justify-between relative shadow-lg">
            <span className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">Recommended</span>
            <div>
              <h3 className="text-lg font-bold text-primary">Pro Athlete</h3>
              <p className="text-text-muted text-sm mt-1 font-semibold">For serious competitors and analytics buffs</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-text-heading">$19</span>
                <span className="text-text-muted text-sm font-semibold"> / month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['All Basic tier features', 'AI Workout recommender & optimizer', 'AI Meal plan generator & recipes', 'Diet Helpdesk live Q&A chat access', 'Menstrual cycle phase-based suggestions', 'Weekly PDF performance reports download'].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-text-body font-semibold">
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/register" className="w-full text-center py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/15 transition-all block">Unlock Pro Performance</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-surface-light">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-xs shadow-sm">P</div>
            <span className="font-extrabold text-sm tracking-wider text-text-muted uppercase">Pulse</span>
          </div>
          <p className="text-xs text-text-muted font-semibold">&copy; {new Date().getFullYear()} Pulse. All rights reserved. Built with Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
