import React, { useState } from 'react';
import EvolutionChamber from './components/EvolutionChamber';
import StatisticalDashboard from './components/StatisticalDashboard';
import TheoryCodex from './components/TheoryCodex';
import { Beaker, BarChart2, BookOpen } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('chamber');
  const [evolutionData, setEvolutionData] = useState(null);

  return (
    <div className="app-container">
      <header className="bio-header">
        <div className="logo-container">
          <div className="dna-spinner"></div>
          <h1>Biolixir</h1>
        </div>
        <p className="subtitle">Synthetic Mixology Genesis Engine</p>
        
        <nav className="bio-nav">
          <button 
            className={`nav-btn ${activeTab === 'chamber' ? 'active' : ''}`}
            onClick={() => setActiveTab('chamber')}
          >
            <Beaker size={18} /> Evolution Chamber
          </button>
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart2 size={18} /> Statistics
          </button>
          <button 
            className={`nav-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <BookOpen size={18} /> Theory Codex
          </button>
        </nav>
      </header>

      <main className="bio-main">
        {activeTab === 'chamber' && <EvolutionChamber onDataEvolved={setEvolutionData} />}
        {activeTab === 'dashboard' && <StatisticalDashboard data={evolutionData} />}
        {activeTab === 'theory' && <TheoryCodex />}
      </main>
      
      <div className="bg-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
      </div>
    </div>
  );
}

export default App;
