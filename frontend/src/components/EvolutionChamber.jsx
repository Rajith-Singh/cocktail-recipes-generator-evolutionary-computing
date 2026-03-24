import React, { useState, useEffect, useRef } from 'react';
import { Play, Beaker, Zap, Activity } from 'lucide-react';

const EvolutionChamber = ({ onDataEvolved }) => {
  const [vibe, setVibe] = useState('Smoky, late night, contemplative');
  const [gens, setGens] = useState(10);
  const [pop, setPop] = useState(20);
  const [isEvolving, setIsEvolving] = useState(false);
  const [logs, setLogs] = useState([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const runEvolution = async () => {
    setIsEvolving(true);
    setLogs(["[SYSTEM] Initializing DNA sequences...", "[SYSTEM] Connecting to Mixology Neural Bridge..."]);
    
    try {
      const response = await fetch('http://localhost:8000/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_vibe: vibe,
          generations: gens,
          pop_size: pop
        })
      });
      
      const data = await response.json();
      
      // Simulate real-time logging for effect
      if (data.exp_log) {
        for (let i = 0; i < data.exp_log.length; i++) {
          await new Promise(r => setTimeout(r, 20)); // High speed simulation
          setLogs(prev => [...prev, data.exp_log[i]]);
        }
      }
      
      onDataEvolved(data);
      setLogs(prev => [...prev, "[SUCCESS] Evolution complete. Alpha specimen captured."]);
    } catch (error) {
      setLogs(prev => [...prev, `[ERROR] Bridge failure: ${error.message}`]);
    } finally {
      setIsEvolving(false);
    }
  };

  const getLineClass = (line) => {
    if (line.includes('--- GENERATION')) return 'log-generation';
    if (line.includes('Mutation')) return 'log-mutation';
    if (line.includes('Crossover')) return 'log-crossover';
    if (line.includes('Selection')) return 'log-selection';
    return 'log-line';
  };

  return (
    <div className="evolution-chamber">
      <div className="stat-grid" style={{marginBottom: '2rem'}}>
        <div className="bio-card">
          <h3>Ectogenetic Parameters</h3>
          <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label className="stat-label">Target Vibe (Genotype)</label>
              <input 
                className="bio-input" 
                value={vibe} 
                onChange={(e) => setVibe(e.target.value)}
                placeholder="e.g. Tropical, vibrant, energetic"
              />
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div style={{flex: 1}}>
                <label className="stat-label">Generations</label>
                <input 
                  type="number" 
                  className="bio-input" 
                  value={gens} 
                  onChange={(e) => setGens(parseInt(e.target.value))}
                />
              </div>
              <div style={{flex: 1}}>
                <label className="stat-label">Population</label>
                <input 
                  type="number" 
                  className="bio-input" 
                  value={pop} 
                  onChange={(e) => setPop(parseInt(e.target.value))}
                />
              </div>
            </div>
            <button 
              className="bio-button" 
              onClick={runEvolution}
              disabled={isEvolving}
              style={{marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
            >
              {isEvolving ? <Activity className="spin" size={20} /> : <Play size={20} />}
              {isEvolving ? 'Synthesizing...' : 'Initiate Genesis'}
            </button>
          </div>
        </div>

        <div className="bio-card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h3>Live Sequence Log</h3>
            <div className="dna-spinner" style={{width: '20px', height: '20px', animationDuration: '1s'}}></div>
          </div>
          <div className="terminal" ref={terminalRef}>
            {logs.map((log, i) => (
              <div key={i} className={getLineClass(log)}>
                {log}
              </div>
            ))}
            {logs.length === 0 && <div className="log-line muted">Awaiting sequence initiation...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionChamber;
