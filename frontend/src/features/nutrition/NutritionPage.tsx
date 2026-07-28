import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, Sparkles, Send, Copy, Bookmark, Scale, Activity, Droplet, CheckCircle2, ChevronRight
} from 'lucide-react';

interface Meal {
  _id?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const NutritionPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'meals' | 'helpdesk' | 'bmi'>('meals');
  
  // Tab 1: Meal Plan States
  const [mealPlan, setMealPlan] = useState<any | null>(null);
  const [dailyLog, setDailyLog] = useState<any | null>(null);
  const [generatingMealPlan, setGeneratingMealPlan] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealType, setNewMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [newMealCals, setNewMealCals] = useState(300);
  const [newMealProt, setNewMealProt] = useState(25);
  const [newMealCarbs, setNewMealCarbs] = useState(35);
  const [newMealFat, setNewMealFat] = useState(8);
  const [waterAmount, setWaterAmount] = useState(250);

  // Tab 2: Helpdesk States
  const [helpMessages, setHelpMessages] = useState<any[]>([]);
  const [helpInput, setHelpInput] = useState('');
  const [helpLoading, setHelpLoading] = useState(false);
  const helpScrollRef = useRef<HTMLDivElement>(null);

  // Tab 3: BMI States
  const [bmiWeight, setBmiWeight] = useState(user?.profile?.weight || 70);
  const [bmiHeight, setBmiHeight] = useState(user?.profile?.height || 175);
  const [bmiAge, setBmiAge] = useState(user?.profile?.age || 25);
  const [bmiWaist, setBmiWaist] = useState(80);
  const [bmiGender, setBmiGender] = useState<'male' | 'female'>(user?.profile?.gender === 'female' ? 'female' : 'male');
  const [bmiResult, setBmiResult] = useState<any | null>(null);
  const [calculatingBmi, setCalculatingBmi] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchNutritionLog();
    if (helpMessages.length === 0) {
      setHelpMessages([
        {
          id: '1',
          sender: 'coach',
          text: "Welcome to the Nutrition Helpdesk. Ask me nutrition-specific questions like 'What should I eat post-workout?' or 'Healthy vegetarian high-protein meals?'. I will explain the metabolic justification for you.",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    helpScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [helpMessages]);

  // Tab 1: Meal Plan & Logs
  const fetchNutritionLog = async () => {
    try {
      const res = await api.get(`/nutrition/log/${todayStr}`);
      setDailyLog(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateMealPlan = async () => {
    setGeneratingMealPlan(true);
    toast.loading("Calculating TDEE & macros recipes...");
    try {
      const res = await api.post('/nutrition/meal-plan');
      setMealPlan(res.data);
      toast.dismiss();
      toast.success("AI Meal Plan Generated!");
    } catch (err) {
      toast.dismiss();
      toast.error("Could not run meal planner");
    } finally {
      setGeneratingMealPlan(false);
    }
  };

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName) return toast.error("Please specify a meal description");

    try {
      const res = await api.post('/nutrition/log', {
        date: todayStr,
        meal: {
          type: newMealType,
          name: newMealName,
          calories: newMealCals,
          protein: newMealProt,
          carbs: newMealCarbs,
          fat: newMealFat
        }
      });
      setDailyLog(res.data);
      setNewMealName('');
      toast.success("Meal logged!");
    } catch (err) {
      toast.error("Failed to log food");
    }
  };

  const handleLogWater = async () => {
    try {
      const res = await api.post('/nutrition/log', {
        date: todayStr,
        water: waterAmount
      });
      setDailyLog(res.data);
      toast.success(`Logged ${waterAmount}ml water!`);
    } catch (err) {
      toast.error("Failed to log water");
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const res = await api.delete(`/nutrition/log/${todayStr}/${mealId}`);
      setDailyLog(res.data);
      toast.success("Meal removed");
    } catch (err) {
      toast.error("Failed to delete meal");
    }
  };

  // Tab 2: Nutrition Helpdesk
  const handleSendHelpQuery = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() };
    setHelpMessages(prev => [...prev, userMsg]);
    setHelpInput('');
    setHelpLoading(true);

    try {
      const res = await api.post('/ai/coach', { question: text }); // answers diet questions
      const coachMsg = { id: (Date.now() + 1).toString(), sender: 'coach', text: res.data.answer, timestamp: new Date() };
      setHelpMessages(prev => [...prev, coachMsg]);
    } catch (err: any) {
      const coachMsg = { id: (Date.now() + 1).toString(), sender: 'coach', text: err.response?.data?.message || "I had trouble replying to that topic.", timestamp: new Date() };
      setHelpMessages(prev => [...prev, coachMsg]);
    } finally {
      setHelpLoading(false);
    }
  };

  // Tab 3: BMI & Health Calculator
  const handleCalculateBMI = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculatingBmi(true);
    try {
      const res = await api.post('/health/calculate', {
        weight: bmiWeight,
        height: bmiHeight,
        age: bmiAge,
        gender: bmiGender,
        waist: bmiWaist
      });
      setBmiResult(res.data);
      toast.success("Health metrics computed!");
    } catch (err) {
      toast.error("Calculation failed");
    } finally {
      setCalculatingBmi(false);
    }
  };

  const calorieTarget = user?.macroTargets?.calories || 2000;
  const loggedCalories = dailyLog?.totalCalories || 0;
  const caloriesRemaining = Math.max(0, calorieTarget - loggedCalories);

  const helpPrompts = [
    "What should I eat after a workout?",
    "Healthy vegetarian breakfast?",
    "Can I eat rice while cutting?",
    "Why am I not losing weight?"
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header and tabs selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-heading">Nutrition Hub</h2>
          <p className="text-xs text-text-muted">Meal planner engine, diet helpdesk, and health calculators</p>
        </div>

        <div className="flex bg-surface-light p-1 rounded-xl border border-border text-xs font-semibold gap-1.5">
          <button
            onClick={() => setActiveTab('meals')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'meals' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-heading'
            }`}
          >
            Meal Planner
          </button>
          <button
            onClick={() => setActiveTab('helpdesk')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'helpdesk' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-heading'
            }`}
          >
            Diet Helpdesk
          </button>
          <button
            onClick={() => setActiveTab('bmi')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'bmi' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-heading'
            }`}
          >
            BMI & Calculator
          </button>
        </div>
      </div>

      {/* TAB 1: MEAL PLANNER & LOGS */}
      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* Calorie Counter & Water Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pulse-card flex flex-col justify-between p-5">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Calorie Tracker</span>
              <div className="my-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-primary">{loggedCalories}</span>
                <span className="text-text-muted text-xs font-semibold">/ {calorieTarget} kcal</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (loggedCalories / calorieTarget) * 100)}%` }}
                />
              </div>
            </div>

            {/* Protein Macro Tracker */}
            <div className="pulse-card flex flex-col justify-between p-5">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Protein Target</span>
              <div className="my-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-mint">{dailyLog?.totalProtein || 0}g</span>
                <span className="text-text-muted text-xs font-semibold">/ {user?.macroTargets?.protein || 140}g</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-mint h-full rounded-full animate-all"
                  style={{ width: `${Math.min(100, ((dailyLog?.totalProtein || 0) / (user?.macroTargets?.protein || 140)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Water Tracker */}
            <div className="pulse-card flex items-center justify-between p-5">
              <div className="space-y-2 flex-1">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Water Intake</span>
                <p className="text-3xl font-extrabold text-secondary">{dailyLog?.waterIntake || 0}ml</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <button 
                    onClick={() => { setWaterAmount(250); }} 
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${waterAmount === 250 ? 'bg-primary-light text-primary border border-primary/20' : 'bg-surface-light hover:bg-surface-hover text-text-body border border-border'}`}
                  >
                    +250ml
                  </button>
                  <button 
                    onClick={() => { setWaterAmount(500); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${waterAmount === 500 ? 'bg-primary-light text-primary border border-primary/20' : 'bg-surface-light hover:bg-surface-hover text-text-body border border-border'}`}
                  >
                    +500ml
                  </button>
                  <button 
                    onClick={handleLogWater}
                    className="p-1 px-2.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg transition-all ml-2"
                  >
                    Log
                  </button>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-light border border-primary/10 flex items-center justify-center text-primary">
                <Droplet size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Log Food Form */}
            <div className="pulse-card flex flex-col gap-4">
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Log Food Item</h3>
              
              <form onSubmit={handleLogMeal} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Meal Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Scrambled eggs + toast"
                    value={newMealName}
                    onChange={(e) => setNewMealName(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Meal Slot</label>
                    <select
                      value={newMealType}
                      onChange={(e) => setNewMealType(e.target.value as any)}
                      className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={newMealCals}
                      onChange={(e) => setNewMealCals(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-text-muted mb-1 text-center uppercase tracking-wider">Protein (g)</label>
                    <input
                      type="number"
                      value={newMealProt}
                      onChange={(e) => setNewMealProt(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-border rounded-xl p-2 text-center text-xs text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-text-muted mb-1 text-center uppercase tracking-wider">Carbs (g)</label>
                    <input
                      type="number"
                      value={newMealCarbs}
                      onChange={(e) => setNewMealCarbs(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-border rounded-xl p-2 text-center text-xs text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-text-muted mb-1 text-center uppercase tracking-wider">Fat (g)</label>
                    <input
                      type="number"
                      value={newMealFat}
                      onChange={(e) => setNewMealFat(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-border rounded-xl p-2 text-center text-xs text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-primary/10 transition-all border-0 shadow-sm mt-2"
                >
                  Log Meal +
                </button>
              </form>
            </div>

            {/* Daily Meals History */}
            <div className="lg:col-span-2 pulse-card flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-text-heading mb-4 uppercase tracking-wider">Logged Intake History</h3>
                
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {!dailyLog || dailyLog.meals.length === 0 ? (
                    <p className="text-xs text-text-muted italic text-center py-12 font-medium">No foods logged for today yet.</p>
                  ) : (
                    dailyLog.meals.map((m: any) => (
                      <div key={m._id} className="p-3 bg-surface-light rounded-xl border border-border flex items-center justify-between text-xs hover:border-primary/20 transition-colors shadow-sm">
                        <div>
                          <p className="font-bold text-text-heading">{m.name}</p>
                          <p className="text-[10px] text-text-muted mt-0.5 capitalize font-semibold">
                            Slot: {m.type} • P: {m.protein}g • C: {m.carbs}g • F: {m.fat}g
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-primary">{m.calories} kcal</span>
                          <button
                            onClick={() => handleDeleteMeal(m._id)}
                            className="p-1 px-2 hover:bg-red-50 text-danger rounded-lg font-bold transition-all text-[10px]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Meal Plan Generator box */}
              <div className="border-t border-border pt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <p className="text-xs text-text-muted font-medium">Generate a custom AI macro plan based on TDEE goals</p>
                  <button
                    onClick={generateMealPlan}
                    disabled={generatingMealPlan}
                    className="pulse-btn-secondary py-2 px-4 text-xs flex items-center gap-1.5"
                  >
                    <Sparkles size={12} /> {generatingMealPlan ? 'Creating Plan...' : 'Generate AI Meal Plan'}
                  </button>
                </div>

                {mealPlan && (
                  <div className="mt-6 p-6 bg-white rounded-2xl border border-border space-y-6 text-xs animate-in zoom-in-95 duration-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
                      <div>
                        <p className="font-extrabold text-lg text-text-heading flex items-center gap-1.5 uppercase tracking-wide">
                          <Sparkles size={16} className="text-primary" />
                          Custom Daily Meal Ledger
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5 font-medium">Calculated target macros and raw ingredients</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-primary-light text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                          {mealPlan.targets?.calories || calorieTarget} kcal
                        </span>
                        <span className="text-[10px] bg-mint/10 text-mint px-2 py-0.5 rounded-full font-bold">
                          {mealPlan.targets?.protein || (user?.macroTargets?.protein || 140)}g Protein
                        </span>
                      </div>
                    </div>

                    {/* Meal cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mealPlan.meals.map((meal: any, idx: number) => (
                        <div key={idx} className="p-4 bg-surface-light rounded-xl border border-border flex flex-col justify-between gap-3 shadow-sm">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-border text-text-body">
                                {meal.type}
                              </span>
                              <span className="font-extrabold text-primary">{meal.calories} kcal</span>
                            </div>
                            <h4 className="font-bold text-text-heading text-sm mt-2">{meal.name}</h4>
                            <p className="text-text-body text-[11px] mt-1 leading-relaxed">{meal.details}</p>
                          </div>

                          {/* Ingredients list */}
                          {meal.ingredients && meal.ingredients.length > 0 && (
                            <div className="border-t border-border pt-2">
                              <p className="text-[9px] uppercase font-bold text-text-muted mb-1">Ingredients:</p>
                              <div className="flex flex-wrap gap-1">
                                {meal.ingredients.map((ing: string, iIndex: number) => (
                                  <span key={iIndex} className="text-[10px] bg-white border border-border text-text-body px-1.5 py-0.5 rounded font-medium shadow-sm">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[10px] text-text-muted border-t border-border pt-2 font-bold uppercase tracking-wider">
                            <span>Protein: {meal.protein}g</span>
                            <span>Carbs: {meal.carbs}g</span>
                            <span>Fat: {meal.fat}g</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shopping list & Prep tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                      {/* Shopping List */}
                      {mealPlan.shoppingList && mealPlan.shoppingList.length > 0 && (
                        <div className="p-4 bg-primary-light rounded-xl border border-primary/20">
                          <h4 className="font-bold text-primary text-xs mb-2 uppercase tracking-wider">Weekly Shopping List</h4>
                          <ul className="space-y-1">
                            {mealPlan.shoppingList.map((item: string, sIndex: number) => (
                              <li key={sIndex} className="flex items-center gap-2 text-text-body font-semibold">
                                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20 w-3.5 h-3.5 bg-white" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Prep Tips */}
                      {mealPlan.prepTips && mealPlan.prepTips.length > 0 && (
                        <div className="p-4 bg-mint/5 rounded-xl border border-mint/20">
                          <h4 className="font-bold text-mint text-xs mb-2 uppercase tracking-wider">Meal Prep Insights</h4>
                          <ul className="space-y-1.5 list-disc pl-4 text-text-body font-semibold">
                            {mealPlan.prepTips.map((tip: string, tIndex: number) => (
                              <li key={tIndex} className="leading-relaxed">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIET HELPDESK CHAT */}
      {activeTab === 'helpdesk' && (
        <div className="h-[calc(100vh-16rem)] flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {helpMessages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${
                    isUser 
                      ? 'bg-gradient-to-br from-primary to-secondary text-white' 
                      : 'bg-zinc-100 text-text-heading border border-border'
                  }`}>
                    {isUser ? 'ME' : 'AI'}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className={`p-4 rounded-[20px] shadow-sm border ${
                      isUser 
                        ? 'bg-primary-light border-primary/20 text-text-heading rounded-tr-none' 
                        : 'bg-white border-border text-text-body rounded-tl-none'
                    }`}>
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {helpLoading && (
              <div className="flex gap-3 mr-auto">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-border text-text-muted flex items-center justify-center font-bold text-xs animate-pulse">AI</div>
                <div className="p-4 rounded-[20px] bg-white border border-border text-text-muted text-xs flex items-center gap-2 shadow-sm">
                  <RefreshCw className="animate-spin text-primary" size={14} />
                  <span>Analyzing macro history...</span>
                </div>
              </div>
            )}
            <div ref={helpScrollRef} />
          </div>

          {/* Prompt options & Input */}
          <div className="space-y-4 pt-4 border-t border-border bg-background">
            {helpMessages.length === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {helpPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendHelpQuery(q)}
                    className="p-3 text-left bg-white hover:bg-zinc-50 border border-border rounded-xl text-xs text-text-body hover:text-text-heading transition-all flex flex-col justify-between gap-2.5 group shadow-sm"
                  >
                    <span className="font-semibold">{q}</span>
                    <span className="text-[9px] text-primary font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Query Hub <ChevronRight size={10} />
                    </span>
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleSendHelpQuery(helpInput); }}
              className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm"
            >
              <input
                type="text"
                placeholder="Ask Nutrition Coach (e.g. 'Can I eat rice while cutting?', 'Vegetarian protein breakfast')..."
                value={helpInput}
                onChange={(e) => setHelpInput(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none placeholder-text-muted text-text-heading font-medium"
              />
              <button
                type="submit"
                disabled={helpLoading || !helpInput.trim()}
                className="p-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg disabled:opacity-40 transition-all border-0 shadow-sm"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: BMI & HEALTH CALCULATOR */}
      {activeTab === 'bmi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Form */}
          <div className="pulse-card flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Biometric Parameters</h3>
            <form onSubmit={handleCalculateBMI} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Height (cm)</label>
                  <input
                    type="number"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={bmiAge}
                    onChange={(e) => setBmiAge(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Waist (cm)</label>
                  <input
                    type="number"
                    value={bmiWaist}
                    onChange={(e) => setBmiWaist(parseFloat(e.target.value) || 80)}
                    className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Gender</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-text-body font-semibold">
                    <input
                      type="radio"
                      name="bmiGender"
                      checked={bmiGender === 'male'}
                      onChange={() => setBmiGender('male')}
                      className="accent-primary"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2 text-xs text-text-body font-semibold">
                    <input
                      type="radio"
                      name="bmiGender"
                      checked={bmiGender === 'female'}
                      onChange={() => setBmiGender('female')}
                      className="accent-primary"
                    />
                    Female
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={calculatingBmi}
                className="w-full py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-primary/10 transition-all border-0 shadow-sm mt-2"
              >
                {calculatingBmi ? 'Computing...' : 'Calculate Health Metrics'}
              </button>
            </form>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-2 space-y-6">
            {bmiResult ? (
              <div className="pulse-card space-y-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold tracking-wider text-text-heading border-b border-border pb-3 uppercase">Biometric Ledger Output</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-surface-light rounded-xl border border-border text-center shadow-sm">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Calculated BMI</p>
                    <p className="text-3xl font-extrabold text-primary mt-1">{bmiResult.bmi}</p>
                    <span className="text-[9px] bg-primary-light text-primary border border-primary/20 px-2 py-0.5 rounded-full mt-1.5 inline-block capitalize font-bold">
                      {bmiResult.bmiCategory}
                    </span>
                  </div>

                  <div className="p-4 bg-surface-light rounded-xl border border-border text-center shadow-sm">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Body Fat Est.</p>
                    <p className="text-3xl font-extrabold text-mint mt-1">{bmiResult.bodyFatEstimate}%</p>
                    <span className="text-[9px] text-text-muted block mt-2 font-semibold">Circumference Formula</span>
                  </div>

                  <div className="p-4 bg-surface-light rounded-xl border border-border text-center shadow-sm">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Ideal Weight Range</p>
                    <p className="text-xs font-extrabold text-text-heading mt-2.5">{bmiResult.idealRange.min} - {bmiResult.idealRange.max} kg</p>
                    <span className="text-[9px] text-text-muted block mt-2 font-semibold">Devine standard limits</span>
                  </div>

                  <div className="p-4 bg-surface-light rounded-xl border border-border text-center shadow-sm">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Water Target</p>
                    <p className="text-3xl font-extrabold text-secondary mt-1">{bmiResult.waterTarget}ml</p>
                    <span className="text-[9px] text-text-muted block mt-2 font-semibold">35ml/kg basis</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-heading flex items-center gap-1.5">
                    <Activity size={14} className="text-primary" /> Actionable Health Guidance:
                  </p>
                  <ul className="space-y-2">
                    {bmiResult.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-text-body font-semibold">
                        <CheckCircle2 size={14} className="text-mint shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-72 border border-dashed border-border rounded-2xl flex items-center justify-center text-text-muted italic text-xs font-semibold bg-white shadow-sm">
                Fill out weight/height parameters and calculate to see analysis.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple placeholder
const RefreshCw = ({ className, size }: any) => (
  <Activity className={className} size={size} />
);
export default NutritionPage;
