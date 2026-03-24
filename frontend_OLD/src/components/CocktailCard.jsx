import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Sparkles, BarChart2, Beaker } from 'lucide-react';

export default function CocktailCard({ cocktail }) {
  const chartData = [
    { subject: 'Harmony', A: cocktail.scores.harmony * 100, fullMark: 100 },
    { subject: 'Practicality', A: cocktail.scores.practicality * 10, fullMark: 100 },
    { subject: 'Novelty', A: cocktail.scores.novelty * 100, fullMark: 100 },
    { subject: 'Fitness', A: cocktail.fitness * 20, fullMark: 100 }
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-fuchsia-500/50 transition-all duration-300 shadow-xl group">
      <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-950 relative overflow-hidden flex items-center justify-center">
        {/* Placeholder for 3D render */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-500 via-gray-900 to-black pointer-events-none"></div>
        <div className="z-10 text-center">
          <Beaker className="w-16 h-16 text-fuchsia-400 mx-auto mb-2 opacity-80 group-hover:scale-110 transition-transform duration-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{cocktail.technique} / {cocktail.glass}</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-fuchsia-400 transition-colors">{cocktail.name}</h3>
          <span className="flex items-center gap-1 bg-fuchsia-500/10 text-fuchsia-400 text-xs font-bold px-2 py-1 rounded-full border border-fuchsia-500/20">
            <Sparkles className="w-3 h-3" />
            {(cocktail.fitness).toFixed(2)}
          </span>
        </div>
        
        <div className="mb-6">
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Base Spirit</h4>
          <p className="text-md text-gray-200 capitalize">{cocktail.base_spirit}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Ingredients</h4>
          <ul className="space-y-1">
            {cocktail.ingredients.map((ing, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-indigo-300 capitalize">{ing.ingredient}</span>
                <span className="text-gray-500">{ing.measure}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="h-48 border-t border-gray-800 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-gray-400" />
            <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Fitness Profile</h4>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Scoring" dataKey="A" stroke="#d946ef" fill="#d946ef" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6">
           <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
             Save to Collection
           </button>
        </div>
      </div>
    </div>
  );
}
