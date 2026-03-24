import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Zap, Droplets, FlaskConical, Sparkles } from 'lucide-react';

const StatisticalDashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="bio-card" style={{textAlign: 'center', padding: '4rem'}}>
        <FlaskConical size={64} style={{color: 'var(--bio-primary)', marginBottom: '1rem', opacity: 0.5}} />
        <h2>No Specimen Found</h2>
        <p className="subtitle">Run an evolution in the Chamber to view phenotypic statistics.</p>
      </div>
    );
  }

  const { alpha, history } = data;
  
  const historyData = history.best.map((val, i) => ({
    gen: i,
    best: parseFloat(val.toFixed(4)),
    avg: parseFloat(history.avg[i].toFixed(4))
  }));

  const radarData = [
    { subject: 'Vibe Alignment', A: alpha.fitness_components.vibe, fullMark: 1 },
    { subject: 'Structural Balance', A: alpha.fitness_components.structure, fullMark: 1 },
    { subject: 'Novelty Score', A: alpha.fitness_components.novelty, fullMark: 1 },
  ];

  return (
    <div className="dashboard-container">
      <div className="bio-card" style={{marginBottom: '2rem', borderLeft: '4px solid var(--bio-primary)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h2 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{alpha.generated_name}</h2>
            <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1.5rem'}}>
              <span className="mono" style={{color: 'var(--bio-secondary)'}}>ABV: {alpha.estimated_abv}%</span>
              <span className="mono" style={{color: 'var(--bio-accent)'}}>Fitness: {alpha.fitness.toFixed(4)}</span>
            </div>
          </div>
          <Sparkles className="pulse-glow" style={{color: 'var(--bio-primary)'}} />
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
          <div>
            <h4 className="stat-label" style={{marginBottom: '1rem'}}>Genetic Composition</h4>
            <div className="terminal" style={{height: '200px'}}>
              {alpha.Parsed_Ingredients.map((ing, i) => (
                <div key={i} className="log-line">
                  <span style={{color: 'var(--bio-primary)'}}>{ing.ml}ml</span> {ing.name} 
                  <span className="mono" style={{fontSize: '0.7rem', marginLeft: '0.5rem'}}>[{ing.category}]</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="stat-label" style={{marginBottom: '1rem'}}>Synthesis Instructions</h4>
            <div style={{lineHeight: '1.6', color: 'var(--bio-text)'}}>
              {alpha.generated_instructions}
            </div>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="bio-card">
          <h3>Fitness Convergence Timeline</h3>
          <div style={{width: '100%', height: '300px', marginTop: '1rem'}}>
            <ResponsiveContainer>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.1)" />
                <XAxis dataKey="gen" stroke="var(--bio-text-muted)" />
                <YAxis stroke="var(--bio-text-muted)" domain={[0, 1]} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'var(--bio-bg)', border: '1px solid var(--bio-primary)'}}
                  itemStyle={{color: 'var(--bio-primary)'}}
                />
                <Legend />
                <Line type="monotone" dataKey="best" stroke="var(--bio-primary)" strokeWidth={3} dot={false} name="Best Fitness" />
                <Line type="monotone" dataKey="avg" stroke="var(--bio-secondary)" strokeWidth={2} dot={false} name="Avg Fitness" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bio-card">
          <h3>Bio-Kinetic Profile</h3>
          <div style={{width: '100%', height: '300px', marginTop: '1rem', display: 'flex', justifyContent: 'center'}}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--bio-border)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--bio-text-muted)', fontSize: 12}} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} />
                <Radar
                   name="Alpha Specimen"
                   dataKey="A"
                   stroke="var(--bio-accent)"
                   fill="var(--bio-accent)"
                   fillOpacity={0.4}
                 />
                </RadarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticalDashboard;
