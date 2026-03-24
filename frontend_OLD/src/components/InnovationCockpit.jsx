import React, { useState } from 'react';
import axios from 'axios';
import { Sliders, Zap, Loader2, Beaker } from 'lucide-react';
import CocktailCard from './CocktailCard';

export default function InnovationCockpit() {
  const [weights, setWeights] = useState({ harmony: 0.3, practicality: 0.2, novelty: 0.25 });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleEvolve = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/evolve', weights);
      setResults(res.data);
    } catch (error) {
      console.error("Evolution failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (e) => {
    setWeights(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Controls Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl sticky top-24">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <Sliders className="text-fuchsia-400" />
            <h2 className="text-lg font-bold text-white">Creative Controls</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Harmony Focus</label>
                <span className="text-xs text-fuchsia-400 bg-fuchsia-400/10 px-2 py-0.5 rounded">{weights.harmony}</span>
              </div>
              <input type="range" name="harmony" min="0" max="1" step="0.05" value={weights.harmony} onChange={handleWeightChange} className="w-full accent-fuchsia-500" />
              <p className="text-xs text-gray-500 mt-1">Prefers proven ingredient pairings.</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Practicality</label>
                <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">{weights.practicality}</span>
              </div>
              <input type="range" name="practicality" min="0" max="1" step="0.05" value={weights.practicality} onChange={handleWeightChange} className="w-full accent-indigo-500" />
              <p className="text-xs text-gray-500 mt-1">Prefers simpler recipes and standard techniques.</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Novelty Push</label>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{weights.novelty}</span>
              </div>
              <input type="range" name="novelty" min="0" max="1" step="0.05" value={weights.novelty} onChange={handleWeightChange} className="w-full accent-emerald-500" />
              <p className="text-xs text-gray-500 mt-1">Encourages rare combinations and outliers.</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800">
            <button 
              onClick={handleEvolve} 
              disabled={loading}
              className="w-full relative group bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-fuchsia-500/25 flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              <span className="relative z-10">{loading ? 'Evolving Generation...' : 'Run Evolution Sequence'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Results View */}
      <div className="lg:col-span-3">
        {loading && !results && (
          <div className="h-[600px] flex flex-col items-center justify-center text-gray-500">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-t-2 border-fuchsia-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-spin flex items-center justify-center">
                 <Beaker className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">Simulating 1,000+ Combinations</h3>
            <p className="max-w-md text-center">The Genetic Algorithm is exploring the flavor space, applying crossover, and selecting the fittest offspring...</p>
          </div>
        )}
        
        {!loading && !results && (
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl text-gray-500 bg-gray-900/50">
            <Zap className="w-12 h-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No results yet.</h3>
            <p className="mt-2">Adjust your creative constraints and run the evolution sequence.</p>
          </div>
        )}
        
        {results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Evolution Complete</h2>
              <p className="text-gray-400">Showing the top 10 most viable creations from the final generation.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.top_cocktails.map((cocktail, idx) => (
                <div key={idx} className="animate-in fade-in zoom-in" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                  <CocktailCard cocktail={cocktail} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
