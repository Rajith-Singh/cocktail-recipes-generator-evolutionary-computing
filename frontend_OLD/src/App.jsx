import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import InnovationCockpit from './components/InnovationCockpit';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-fuchsia-900 selection:text-fuchsia-50">
        <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-fuchsia-500/20">
                   A
                 </div>
                 <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                    Bartender AI Studio
                 </span>
              </div>
              <div className="flex gap-6">
                <Link to="/" className="text-sm font-medium text-gray-400 hover:text-fuchsia-400 transition-colors">Dashboard</Link>
                <Link to="/studio" className="text-sm font-medium text-gray-400 hover:text-fuchsia-400 transition-colors">Innovation Studio</Link>
                <Link to="/network" className="text-sm font-medium text-gray-400 hover:text-fuchsia-400 transition-colors">Ingredient Network</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/studio" element={<InnovationCockpit />} />
            <Route path="/network" element={<div className="text-center mt-20 text-gray-500">Network View Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
