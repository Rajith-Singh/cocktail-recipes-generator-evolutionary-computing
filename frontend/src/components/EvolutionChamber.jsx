import React, { useState, useEffect, useRef } from 'react';
import { Play, Activity, Terminal } from 'lucide-react';
import DNASurgery from './DNASurgery';

const EvolutionChamber = ({ onDataEvolved }) => {
  const [vibe, setVibe] = useState('Smoky, late night, contemplative');
  const [gens, setGens] = useState(20);
  const [pop, setPop] = useState(50);
  const [isEvolving, setIsEvolving] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentLine, setCurrentLine] = useState('');
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const runEvolution = async () => {
    setIsEvolving(true);
    setLogs(["[SYSTEM] Initializing DNA sequences...", "[SYSTEM] Connecting to Mixology Neural Bridge..."]);
    setCurrentLine('');

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

      if (data.exp_log) {
        for (let i = 0; i < data.exp_log.length; i++) {
          await new Promise(r => setTimeout(r, 15));
          const line = data.exp_log[i];
          setCurrentLine(line);
          setLogs(prev => [...prev, line]);
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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <label className="stat-label">Generations</label>
                  <span className="mono" style={{fontSize: '0.65rem', color: 'var(--bio-primary)'}}>{gens} cycles</span>
                </div>
                <input
                  type="number"
                  className="bio-input"
                  value={gens}
                  min={1}
                  max={100}
                  onChange={(e) => setGens(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <div style={{fontSize: '0.65rem', color: 'var(--bio-text-muted)', marginTop: '4px', fontFamily: 'JetBrains Mono'}}>Range: 1 – 100</div>
              </div>
              <div style={{flex: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <label className="stat-label">Population Size</label>
                  <span className="mono" style={{fontSize: '0.65rem', color: 'var(--bio-secondary)'}}>{pop} specimens</span>
                </div>
                <input
                  type="number"
                  className="bio-input"
                  value={pop}
                  min={5}
                  max={200}
                  onChange={(e) => setPop(Math.max(5, parseInt(e.target.value) || 5))}
                />
                <div style={{fontSize: '0.65rem', color: 'var(--bio-text-muted)', marginTop: '4px', fontFamily: 'JetBrains Mono'}}>Range: 5 – 200</div>
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

        <div className="bio-card" style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Terminal size={20} style={{color: 'var(--bio-primary)'}} />
              <h3>Genetic Sequence Synthesis</h3>
            </div>
            {isEvolving && <div className="dna-spinner" style={{width: '20px', height: '20px', animationDuration: '1s'}}></div>}
          </div>

          <DNASurgery currentLogLine={currentLine} />

          <div className="terminal" ref={terminalRef} style={{flex: 1, marginTop: '0.5rem'}}>
            {logs.map((log, i) => (
              <div key={i} className={getLineClass(log)}>
                {log}
              </div>
            ))}
            {logs.length === 0 && <div className="log-line" style={{opacity: 0.4}}>Awaiting sequence initiation...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionChamber;
