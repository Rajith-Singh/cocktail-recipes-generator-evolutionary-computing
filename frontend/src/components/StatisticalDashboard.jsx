import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from 'recharts';
import { Zap, FlaskConical, Sparkles, GitBranch, Camera, BarChart2, Download } from 'lucide-react';
import PopulationTimeline from './PopulationTimeline';
import GenealogyTree from './GenealogyTree';
import PopulationAnalysis from './PopulationAnalysis';
import { downloadElementAsPng, downloadJSON } from '../utils/download';

const StatisticalDashboard = ({ data }) => {
  const [subTab, setSubTab] = useState('insights');

  if (!data) {
    return (
      <div className="bio-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <FlaskConical size={64} style={{ color: 'var(--bio-primary)', marginBottom: '1rem', opacity: 0.5 }} />
        <h2>No Specimen Found</h2>
        <p className="subtitle">Run an evolution in the Chamber to view phenotypic statistics.</p>
      </div>
    );
  }

  const { alpha, history, snapshots } = data;

  // Build history data from real backend values
  const historyData = (history.best || []).map((val, i) => ({
    gen: i,
    best: parseFloat((val || 0).toFixed(4)),
    avg: parseFloat((history.avg?.[i] || 0).toFixed(4)),
    worst: parseFloat((history.worst?.[i] || 0).toFixed(4))
  }));

  // Build radar data from real fitness components
  const radarData = [
    { subject: 'Vibe Alignment', A: alpha.fitness_components?.vibe || 0, fullMark: 1 },
    { subject: 'Structural Balance', A: alpha.fitness_components?.structure || 0, fullMark: 1 },
    { subject: 'Novelty Score', A: alpha.fitness_components?.novelty || 0, fullMark: 1 },
  ];

  return (
    <div className="dashboard-container">
      {/* Sub Navigation */}
      <div className="bio-nav" style={{ marginBottom: '2rem', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        {[
          { key: 'insights', icon: <Zap size={15} />, label: 'Insights' },
          { key: 'population', icon: <Camera size={15} />, label: 'Population Snapshots' },
          { key: 'analysis', icon: <BarChart2 size={15} />, label: 'Population Analysis' },
          { key: 'lineage', icon: <GitBranch size={15} />, label: 'Genealogy Tree' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`nav-btn ${subTab === tab.key ? 'active' : ''}`}
            onClick={() => setSubTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── INSIGHTS TAB ─────────────────────────────────────── */}
      {subTab === 'insights' && (
        <>
          {/* Alpha Card */}
          <div className="bio-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--bio-primary)', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{alpha.generated_name || 'Alpha Cocktail'}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <span className="mono" style={{ color: 'var(--bio-secondary)' }}>ABV: {alpha.estimated_abv ?? '—'}%</span>
                  <span className="mono" style={{ color: 'var(--bio-accent)' }}>Fitness: {(alpha.fitness || 0).toFixed(4)}</span>
                  <span className="mono" style={{ color: 'var(--bio-primary)' }}>Method: {alpha.Method || 'Stirred'}</span>
                </div>
              </div>
              <Sparkles className="pulse-glow" style={{ color: 'var(--bio-primary)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 className="stat-label" style={{ marginBottom: '1rem' }}>Genetic Composition</h4>
                <div className="terminal" style={{ height: '200px' }}>
                  {(alpha.Parsed_Ingredients || []).map((ing, i) => (
                    <div key={i} className="log-line">
                      <span style={{ color: 'var(--bio-primary)' }}>{ing.ml?.toFixed(1)}ml</span>{' '}
                      {ing.name}
                      <span className="mono" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>[{ing.category}]</span>
                    </div>
                  ))}
                  {(alpha.Parsed_Ingredients || []).length === 0 && <span style={{ opacity: 0.4 }}>No ingredients found</span>}
                </div>
              </div>
              <div>
                <h4 className="stat-label" style={{ marginBottom: '1rem' }}>Synthesis Instructions</h4>
                <div style={{ lineHeight: '1.7', color: 'var(--bio-text)', fontSize: '0.9rem' }}>
                  {alpha.generated_instructions || '—'}
                </div>
                {/* Fitness score breakdown */}
                <div style={{ marginTop: '1.5rem' }}>
                  {[
                    { label: 'Vibe', val: alpha.fitness_components?.vibe, color: 'var(--bio-secondary)' },
                    { label: 'Structure', val: alpha.fitness_components?.structure, color: 'var(--bio-primary)' },
                    { label: 'Novelty', val: alpha.fitness_components?.novelty, color: 'var(--bio-accent)' }
                  ].map(sc => (
                    <div key={sc.label} style={{ marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="stat-label" style={{ fontSize: '0.7rem' }}>{sc.label}</span>
                        <span className="mono" style={{ fontSize: '0.7rem', color: sc.color }}>{((sc.val || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '4px', height: '6px' }}>
                        <div style={{ width: `${(sc.val || 0) * 100}%`, height: '100%', background: sc.color, borderRadius: '4px', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="stat-grid">
            {/* Convergence Line Chart */}
            <div className="bio-card" id="convergence-chart-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Convergence Dynamics</h3>
                <button className="download-btn" onClick={() => downloadElementAsPng('convergence-chart-wrapper', 'fitness_convergence.png')}>
                  <Download size={14} /> PNG
                </button>
              </div>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer>
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="bestGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00c3ff" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00c3ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.08)" />
                    <XAxis dataKey="gen" stroke="var(--bio-text-muted)" label={{ value: 'Generation', position: 'insideBottom', offset: -5, fill: 'var(--bio-text-muted)', fontSize: 11 }} />
                    <YAxis stroke="var(--bio-text-muted)" domain={[0, 1]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(2,8,4,0.95)', border: '1px solid var(--bio-primary)', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="best" stroke="#00ff88" strokeWidth={3} fill="url(#bestGrad)" name="Best Fitness" />
                    <Area type="monotone" dataKey="avg" stroke="#00c3ff" strokeWidth={2} fill="url(#avgGrad)" name="Avg Fitness" />
                    <Line type="monotone" dataKey="worst" stroke="#ff007f" strokeWidth={1} dot={false} name="Worst Fitness" strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Profile */}
            <div className="bio-card" id="radar-chart-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Bio-Kinetic Profile</h3>
                <button className="download-btn" onClick={() => downloadElementAsPng('radar-chart-wrapper', 'biokinetic_profile.png')}>
                  <Download size={14} /> PNG
                </button>
              </div>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,255,136,0.15)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--bio-text-muted)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} />
                    <Radar name="Alpha" dataKey="A" stroke="var(--bio-accent)" fill="var(--bio-accent)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Raw history data download */}
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button className="download-btn" onClick={() => downloadJSON({ history, alpha: { fitness: alpha.fitness, fitness_components: alpha.fitness_components, name: alpha.generated_name } }, 'evolution_history.json')}>
              <Download size={14} /> Download Raw JSON
            </button>
          </div>
        </>
      )}

      {subTab === 'population' && <PopulationTimeline snapshots={snapshots} />}
      {subTab === 'analysis' && <PopulationAnalysis snapshots={snapshots} />}
      {subTab === 'lineage' && <GenealogyTree snapshots={snapshots} alpha={alpha} />}
    </div>
  );
};

export default StatisticalDashboard;
