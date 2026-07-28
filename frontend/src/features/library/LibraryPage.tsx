import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Exercise } from '../../types';
import toast from 'react-hot-toast';
import { Search, Info, ShieldAlert, CheckCircle2, Heart, Award, ArrowUpRight } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bodyPartFilter, setBodyPartFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await api.get('/workouts/exercises');
        setExercises(res.data);
        if (res.data.length > 0) {
          setSelectedExercise(res.data[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load exercise catalog");
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fid => fid !== id));
      toast.success("Removed from favorites");
    } else {
      setFavorites([...favorites, id]);
      toast.success("Added to favorites!");
    }
  };

  if (loading) {
    return <div className="text-text-muted text-xs italic">Loading exercise catalog...</div>;
  }

  // Get unique filter values
  const bodyParts = ['all', ...Array.from(new Set(exercises.map(ex => ex.bodyPart)))];
  const equipments = ['all', ...Array.from(new Set(exercises.map(ex => ex.equipment)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBody = bodyPartFilter === 'all' || ex.bodyPart === bodyPartFilter;
    const matchesDiff = difficultyFilter === 'all' || ex.difficulty === difficultyFilter;
    const matchesEquip = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
    return matchesSearch && matchesBody && matchesDiff && matchesEquip;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Movement Library</h2>
        <p className="text-sm text-text-muted">Search and filter guidelines for safer execution</p>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-4 rounded-[20px] border border-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pulse-input pl-9 w-full"
          />
        </div>

        <div>
          <select
            value={bodyPartFilter}
            onChange={(e) => setBodyPartFilter(e.target.value)}
            className="pulse-input w-full font-bold text-text-body"
          >
            <option value="all">Body Part: All</option>
            {bodyParts.filter(p => p !== 'all').map(p => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="pulse-input w-full font-bold text-text-body"
          >
            <option value="all">Equipment: All</option>
            {equipments.filter(e => e !== 'all').map(e => (
              <option key={e} value={e}>{e.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="pulse-input w-full font-bold text-text-body"
          >
            <option value="all">Difficulty: All</option>
            {difficulties.filter(d => d !== 'all').map(d => (
              <option key={d} value={d}>{d.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Split layout: catalog list on left, details pane on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Catalog List */}
        <div className="lg:col-span-1 pulse-card flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-heading">Exercises Available</h3>
            <span className="text-[10px] bg-primary-light text-primary px-2 py-0.5 rounded-full font-bold">
              {filteredExercises.length} items
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredExercises.length === 0 ? (
              <p className="text-xs text-text-muted italic text-center py-12">No exercises found.</p>
            ) : (
              filteredExercises.map(ex => {
                const isSelected = selectedExercise?._id === ex._id;
                const isFav = favorites.includes(ex._id);
                return (
                  <div
                    key={ex._id}
                    onClick={() => setSelectedExercise(ex)}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-primary-light border-primary/20 text-primary font-bold shadow-sm' 
                        : 'bg-zinc-50 border-border text-text-body hover:bg-surface-hover'
                    }`}
                  >
                    <div>
                      <p className="text-xs">{ex.name}</p>
                      <p className="text-[9px] text-text-muted capitalize mt-0.5">{ex.bodyPart} • {ex.equipment}</p>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(ex._id);
                      }}
                      className="p-1 hover:bg-pink rounded text-text-muted hover:text-red-500"
                    >
                      <Heart size={14} className={isFav ? "fill-red-500 text-red-500" : ""} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Details Pane */}
        <div className="lg:col-span-2">
          {selectedExercise ? (
            <div className="pulse-card space-y-6">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <h3 className="text-xl font-bold text-text-heading">{selectedExercise.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary-light text-primary border border-primary/10">
                      {selectedExercise.difficulty}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-mint/15 text-emerald-600 border border-mint/20">
                      {selectedExercise.equipment}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-peach/15 text-amber-600 border border-peach/20">
                      {selectedExercise.bodyPart}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleFavorite(selectedExercise._id)}
                    className="p-2 border border-border rounded-xl hover:bg-zinc-50 text-text-muted hover:text-red-500"
                  >
                    <Heart size={16} className={favorites.includes(selectedExercise._id) ? "fill-red-500 text-red-500" : ""} />
                  </button>
                  <button 
                    onClick={() => toast.success("Opening video tutorial demo...")}
                    className="pulse-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                  >
                    Watch Tutorial <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>

              {/* Instructions and tips */}
              <div className="space-y-4 text-xs text-text-body">
                <div>
                  <h4 className="font-bold text-text-heading mb-1.5 uppercase tracking-wider text-[10px]">Step-by-step instructions</h4>
                  <ol className="list-decimal pl-5 space-y-1.5">
                    {selectedExercise.instructions?.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">{step}</li>
                    )) || (
                      <li>Assume the starting position, adjust resistance parameters, perform concentric contractions with correct breathing mechanics, and return smoothly to start position.</li>
                    )}
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex gap-2">
                    <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-700 mb-1 text-[10px]">Avoid Common Mistakes</h4>
                      <p className="text-[11px] text-red-600 leading-relaxed">
                        Do not use inertia/momentum or arch your lower spine. Perform repetitions slowly through full range of motion.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-mint/20 flex gap-2">
                    <CheckCircle2 size={16} className="text-mint shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-800 mb-1 text-[10px]">Safety telemetry tips</h4>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Keep joints aligned. If you feel structural pain (not muscular strain), terminate the exercise sets immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="pulse-card text-center py-12">
              <p className="text-xs text-text-muted italic">Choose an exercise from the catalog list to see instructions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LibraryPage;
