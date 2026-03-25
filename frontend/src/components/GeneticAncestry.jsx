import React from 'react';
import { GitBranch, Fingerprint } from 'lucide-react';

const GeneticAncestry = ({ snapshots, alpha }) => {
  if (!snapshots || !alpha) return null;

  // We'll trace the lineage of the alpha cocktail back through snapshots
  const traceLineage = () => {
    let lineage = [];
    let currentId = alpha.id;
    
    // Work backwards from last gen
    for (let g = snapshots.length - 1; g >= 0; g--) {
      const specimen = snapshots[g].find(s => s.id === currentId);
      if (specimen) {
        lineage.unshift({ gen: g, ...specimen });
        if (specimen.parents && specimen.parents.length > 0) {
          // Simplification: trace just the first parent for the main spine
          currentId = specimen.parents[0];
        } else {
          break;
        }
      }
    }
    return lineage;
  };

  const lineageNodes = traceLineage();

  return (
    <div className="genetic-ancestry">
      <div className="bio-card">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
          <GitBranch size={24} style={{color: 'var(--bio-secondary)'}} />
          <h3>Genetic Lineage Trace: {alpha.generated_name}</h3>
        </div>
        
        <div className="ancestry-tree" style={{display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem'}}>
          {lineageNodes.map((node, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
              <div className="mono" style={{minWidth: '80px', color: 'var(--bio-text-muted)'}}>Gen {node.gen}</div>
              
              <div style={{
                background: 'rgba(0,195,255,0.1)',
                border: '1px solid var(--bio-secondary)',
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                flex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Fingerprint size={14} style={{color: 'var(--bio-secondary)'}} />
                  <span>{node.name}</span>
                </div>
                <div className="mono" style={{fontSize: '0.8rem'}}>Fit: {node.fitness.toFixed(3)}</div>
                
                {i < lineageNodes.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-1rem',
                    left: '50%',
                    width: '2px',
                    height: '1rem',
                    background: 'var(--bio-secondary)',
                    opacity: 0.5
                  }}></div>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="subtitle" style={{marginTop: '2rem', textAlign: 'center'}}>
          The "North Star" algorithm traced these phenotypes as best-fit vectors in the semantic space.
        </p>
      </div>
    </div>
  );
};

export default GeneticAncestry;
