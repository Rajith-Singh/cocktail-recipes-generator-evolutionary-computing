import React, { useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Skull, TrendingUp } from 'lucide-react';

const FitnessLandscape = ({ snapshots }) => {
  if (!snapshots || snapshots.length === 0) return null;

  // Flatten all snapshots for global bounds if needed, 
  // but we'll focus on the current/latest generation for clarity
  const currentGen = snapshots.length - 1;
  const currentPop = snapshots[currentGen];

  const data = useMemo(() => {
    return currentPop.map(ind => ({
      x: ind.vibe,
      y: ind.structure,
      z: ind.novelty * 100, // Dot size
      name: ind.name,
      fitness: ind.fitness,
      id: ind.id
    }));
  }, [currentPop]);

  const worstSpecimen = useMemo(() => {
    return [...currentPop].sort((a, b) => a.fitness - b.fitness)[0];
  }, [currentPop]);

  return (
    <div className="fitness-landscape">
      <div className="stat-grid">
        <div className="bio-card" style={{gridColumn: 'span 2'}}>
          <h3>Population Phenotype Map (Gen {currentGen})</h3>
          <p className="subtitle" style={{marginBottom: '1rem'}}>Mapping Vibe Alignment (X) vs Structural Stability (Y). Size represent Novelty.</p>
          <div style={{width: '100%', height: '400px'}}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.1)" />
                <XAxis type="number" dataKey="x" name="Vibe" unit="" domain={[0, 1]} stroke="var(--bio-text-muted)" />
                <YAxis type="number" dataKey="y" name="Structure" unit="" domain={[0, 1]} stroke="var(--bio-text-muted)" />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Novelty" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{backgroundColor: 'var(--bio-bg)', border: '1px solid var(--bio-primary)'}}
                />
                <Scatter name="Population" data={data}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fitness > 0.7 ? 'var(--bio-primary)' : entry.fitness < 0.4 ? 'var(--bio-accent)' : 'var(--bio-secondary)'} 
                      style={{filter: `drop-shadow(0 0 5px ${entry.fitness > 0.7 ? 'var(--bio-primary)' : 'transparent'})`}}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bio-card" style={{border: '1px solid var(--bio-accent)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bio-accent)'}}>
            <Skull size={20} />
            <h3>Hall of Shame</h3>
          </div>
          <p className="subtitle">Worst Case Analysis</p>
          <div style={{marginTop: '1.5rem'}}>
            <div className="stat-value" style={{color: 'var(--bio-accent)', fontSize: '1.5rem'}}>
              {worstSpecimen.fitness.toFixed(4)}
            </div>
            <p className="mono" style={{fontSize: '0.8rem'}}>{worstSpecimen.name}</p>
            <div style={{marginTop: '1rem', fontSize: '0.8rem', opacity: 0.8}}>
              This specimen failed the natural selection filter due to metabolic imbalance or vibe dissonance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessLandscape;
