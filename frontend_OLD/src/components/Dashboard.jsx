import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FlavorUniverseMap from './FlavorUniverseMap';
import { Activity, Beaker, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from FastAPI
    axios.get('http://localhost:8000/api/data/clusters')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching cluster data", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">Dashboard</h1>
        <p className="text-gray-400 mt-2">Explore the knowledge base of {data.length > 0 ? data.length : '...'} cocktails.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4 text-fuchsia-400 mb-4">
            <Beaker />
            <h3 className="font-semibold text-gray-200">Total Recipes</h3>
          </div>
          <p className="text-4xl font-bold text-white">{loading ? '-' : data.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4 text-indigo-400 mb-4">
            <MapPin />
            <h3 className="font-semibold text-gray-200">Flavor Clusters</h3>
          </div>
          <p className="text-4xl font-bold text-white">{loading ? '-' : new Set(data.map(d => d.cluster)).size}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4 text-emerald-400 mb-4">
            <Activity />
            <h3 className="font-semibold text-gray-200">Avg Success</h3>
          </div>
          <p className="text-4xl font-bold text-white">
            {loading ? '-' : Math.round(data.reduce((acc, d) => acc + d.success_score, 0) / data.length)}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6">Flavor Universe Map</h2>
        {loading ? (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-950 rounded-2xl animate-pulse">
            <p className="text-fuchsia-400 font-medium">Loading dimension vectors...</p>
          </div>
        ) : (
          <FlavorUniverseMap data={data} />
        )}
      </div>
    </div>
  );
}
