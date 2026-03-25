import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { Download, TrendingUp, Award, Skull, FlaskConical, Info } from 'lucide-react';
import { downloadElementAsPng, downloadJSON } from '../utils/download';

function getFitColor(f) {
  if (f >= 0.7) return '#00ff88';
  if (f >= 0.5) return '#00c3ff';
  if (f >= 0.3) return '#facc15';
  return '#ff007f';
}

const CustomBarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: 'rgba(2,8,4,0.97)', border: '1px solid var(--bio-primary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'JetBrains Mono' }}>
      <div style={{ color: '#fff', marginBottom: 4, fontSize: '0.8rem' }}>{d?.name}</div>
      <div>Fitness: <span style={{ color: getFitColor(d?.fitness) }}>{d?.fitness?.toFixed(4)}</span></div>
      <div>Vibe: <span style={{ color: 'var(--bio-secondary)' }}>{d?.vibe?.toFixed(3)}</span></div>
      <div>Structure: <span style={{ color: 'var(--bio-primary)' }}>{d?.structure?.toFixed(3)}</span></div>
      <div>Novelty: <span style={{ color: 'var(--bio-accent)' }}>{d?.novelty?.toFixed(3)}</span></div>
    </div>
  );
};

const PopulationAnalysis = ({ snapshots }) => {
  const [activePanel, setActivePanel] = useState('ranking');

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="bio-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
        <FlaskConical size={48} style={{ marginBottom: '1rem', color: 'var(--bio-primary)' }} />
        <p className="subtitle">Run an evolution to view population analysis.</p>
      </div>
    );
  }

  const lastGen = snapshots[snapshots.length - 1] || [];
  const sorted = [...lastGen].sort((a, b) => b.fitness - a.fitness);
  const top10 = sorted.slice(0, 10);
  const bottom10 = sorted.slice(-10).reverse();
  const avgFit = sorted.reduce((s, v) => s + v.fitness, 0) / (sorted.length || 1);

  // Histogram buckets for distribution
  const buckets = [
    { range: '0.0–0.1', min: 0.0, max: 0.1, count: 0, color: '#ff007f' },
    { range: '0.1–0.2', min: 0.1, max: 0.2, count: 0, color: '#ff4466' },
    { range: '0.2–0.3', min: 0.2, max: 0.3, count: 0, color: '#ff6644' },
    { range: '0.3–0.4', min: 0.3, max: 0.4, count: 0, color: '#facc15' },
    { range: '0.4–0.5', min: 0.4, max: 0.5, count: 0, color: '#e0dd00' },
    { range: '0.5–0.6', min: 0.5, max: 0.6, count: 0, color: '#88dd44' },
    { range: '0.6–0.7', min: 0.6, max: 0.7, count: 0, color: '#44cc88' },
    { range: '0.7–0.8', min: 0.7, max: 0.8, count: 0, color: '#00ff88' },
    { range: '0.8–0.9', min: 0.8, max: 0.9, count: 0, color: '#00ffaa' },
    { range: '0.9–1.0', min: 0.9, max: 1.01, count: 0, color: '#00ffcc' },
  ];
  sorted.forEach(ind => {
    const bucket = buckets.find(b => ind.fitness >= b.min && ind.fitness < b.max);
    if (bucket) bucket.count++;
  });

  // Gen-by-gen evolution of best fitness
  const genProgression = snapshots.map((gen, i) => ({
    gen: i,
    best: parseFloat(Math.max(...gen.map(n => n.fitness)).toFixed(4)),
    worst: parseFloat(Math.min(...gen.map(n => n.fitness)).toFixed(4)),
    avg: parseFloat((gen.reduce((s, n) => s + n.fitness, 0) / (gen.length || 1)).toFixed(4)),
  }));

  const panels = [
    { key: 'ranking', label: 'Top vs Worst', icon: <Award size={14} /> },
    { key: 'distribution', label: 'Fitness Distribution', icon: <TrendingUp size={14} /> },
    { key: 'shame', label: 'Hall of Shame', icon: <Skull size={14} /> },
  ];

  return (
    <div className="bio-card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={22} style={{ color: 'var(--bio-accent)' }} />
          <h3>Population Analysis — Final Generation</h3>
        </div>
        <button className="download-btn" onClick={() => downloadJSON(lastGen, 'final_population.json')}>
          <Download size={14} /> JSON
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'POPULATION', val: sorted.length, color: 'var(--bio-secondary)' },
          { label: 'BEST FITNESS', val: sorted[0]?.fitness?.toFixed(4), color: 'var(--bio-primary)' },
          { label: 'AVG FITNESS', val: avgFit.toFixed(4), color: '#facc15' },
          { label: 'WORST FITNESS', val: sorted[sorted.length-1]?.fitness?.toFixed(4), color: 'var(--bio-accent)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${s.color}33`, borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
            <div className="stat-label" style={{ fontSize: '0.6rem' }}>{s.label}</div>
            <div style={{ color: s.color, fontFamily: 'JetBrains Mono', fontSize: '1.1rem', fontWeight: 800 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Panel tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {panels.map(p => (
          <button
            key={p.key}
            className={`nav-btn ${activePanel === p.key ? 'active' : ''}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            onClick={() => setActivePanel(p.key)}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* ── RANKING PANEL ── */}
      {activePanel === 'ranking' && (
        <div>
          <div className="info-badge" style={{ marginBottom: '1rem' }}>
            <Info size={13} />
            <span>Top 10 elite specimens vs Bottom 10 in this generation. Each bar shows the cocktail name and its overall fitness score.</span>
          </div>
          <div id="ranking-chart" style={{ width: '100%', height: '340px' }}>
            <ResponsiveContainer>
              <BarChart data={top10} layout="vertical" margin={{ left: 100, right: 40, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.08)" horizontal={false} />
                <XAxis type="number" domain={[0, 1]} stroke="var(--bio-text-muted)" fontSize={11} />
                <YAxis type="category" dataKey="name" width={95} stroke="var(--bio-text-muted)" fontSize={8.5}
                  tickFormatter={v => v.length > 14 ? v.substring(0, 13) + '…' : v} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="fitness" radius={[0, 6, 6, 0]}>
                  {top10.map((e, i) => <Cell key={i} fill={getFitColor(e.fitness)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button className="download-btn" style={{ marginTop: '0.5rem' }} onClick={() => downloadElementAsPng('ranking-chart', 'top10_ranking.png')}>
            <Download size={13} /> Download PNG
          </button>
        </div>
      )}

      {/* ── DISTRIBUTION PANEL ── */}
      {activePanel === 'distribution' && (
        <div>
          <div className="info-badge" style={{ marginBottom: '1rem' }}>
            <Info size={13} />
            <span>Histogram of the entire population fitness in the final generation. Bars toward the right (green) mean healthy evolution. Bars on the left (red) indicate specimens that failed selection.</span>
          </div>
          <div id="dist-chart" style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={buckets} margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.06)" />
                <XAxis dataKey="range" stroke="var(--bio-text-muted)" fontSize={10}
                  label={{ value: 'Fitness Range →', position: 'insideBottom', offset: -15, fill: 'var(--bio-text-muted)', fontSize: 11 }} />
                <YAxis stroke="var(--bio-text-muted)" allowDecimals={false}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: 'var(--bio-text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(2,8,4,0.95)', border: '1px solid #00ff88', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {buckets.map((b, i) => <Cell key={i} fill={b.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button className="download-btn" style={{ marginTop: '0.5rem' }} onClick={() => downloadElementAsPng('dist-chart', 'fitness_distribution.png')}>
            <Download size={13} /> Download PNG
          </button>
        </div>
      )}

      {/* ── HALL OF SHAME PANEL ── */}
      {activePanel === 'shame' && (
        <div>
          <div className="info-badge" style={{ marginBottom: '1rem' }}>
            <Info size={13} />
            <span>The 10 worst-performing specimens in this generation. These individuals had poor vibe alignment, structural imbalance, or redundancy. The GA will likely discard them next generation.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
            {bottom10.map((ind, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'rgba(255,0,127,0.06)', border: '1px solid rgba(255,0,127,0.2)',
                borderRadius: '8px', padding: '0.75rem 1rem',
                animation: 'slideIn 0.3s ease'
              }}>
                <span style={{ color: 'var(--bio-accent)', fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 800, minWidth: 24 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '2px' }}>{ind.name || 'Unknown Specimen'}</div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: 'var(--bio-text-muted)' }}>
                    Vibe: {ind.vibe?.toFixed(3)} · Struct: {ind.structure?.toFixed(3)} · Novelty: {ind.novelty?.toFixed(3)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: getFitColor(ind.fitness), fontFamily: 'JetBrains Mono', fontSize: '1.1rem', fontWeight: 800 }}>
                    {ind.fitness?.toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--bio-text-muted)' }}>fitness</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PopulationAnalysis;
