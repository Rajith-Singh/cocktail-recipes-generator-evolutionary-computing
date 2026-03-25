import React, { useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Download, Camera, Clock, Info } from 'lucide-react';
import { downloadElementAsPng, downloadJSON } from '../utils/download';

function getFitColor(fitness) {
  if (fitness >= 0.7) return '#00ff88';
  if (fitness >= 0.5) return '#00c3ff';
  if (fitness >= 0.3) return '#facc15';
  return '#ff007f';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: 'rgba(2,8,4,0.95)',
      border: '1px solid var(--bio-primary)',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontFamily: 'JetBrains Mono'
    }}>
      <div style={{ color: '#fff', marginBottom: '4px' }}>{d?.name}</div>
      <div style={{ color: '#00ff88' }}>ID: {d?.id}</div>
      <div>Fitness: <span style={{ color: getFitColor(d?.fitness) }}>{d?.fitness?.toFixed(4)}</span></div>
      <div>Vibe: {d?.vibe?.toFixed(3)}</div>
      <div>Structure: {d?.structure?.toFixed(3)}</div>
      <div>Novelty: {d?.novelty?.toFixed(3)}</div>
    </div>
  );
};

const PopulationTimeline = ({ snapshots }) => {
  const [selectedGen, setSelectedGen] = useState(0);

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="bio-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
        <Clock size={48} style={{ marginBottom: '1rem' }} />
        <p>Run an evolution to view population snapshots.</p>
      </div>
    );
  }

  const totalGens = snapshots.length;

  const currentPop = (snapshots[selectedGen] || []).map(ind => ({
    x: parseFloat((ind.vibe || 0).toFixed(4)),
    y: parseFloat((ind.structure || 0).toFixed(4)),
    z: Math.max(20, (ind.novelty || 0) * 300),
    fitness: ind.fitness || 0,
    id: ind.id,
    name: ind.name || 'Unknown',
    vibe: ind.vibe,
    structure: ind.structure,
    novelty: ind.novelty
  }));

  const bestInGen = [...currentPop].sort((a, b) => b.fitness - a.fitness)[0];
  const worstInGen = [...currentPop].sort((a, b) => a.fitness - b.fitness)[0];
  const avgFit = currentPop.reduce((s, i) => s + i.fitness, 0) / (currentPop.length || 1);

  const handleDownloadPng = () => downloadElementAsPng('pop-timeline-chart', `gen_${selectedGen}_population.png`);
  const handleDownloadJSON = () => downloadJSON(snapshots[selectedGen], `gen_${selectedGen}_population.json`);

  return (
    <div className="bio-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Camera size={22} style={{ color: 'var(--bio-secondary)' }} />
          <h3>Spatio-Temporal Population Snapshot</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="download-btn" onClick={handleDownloadPng}><Download size={14} /> PNG</button>
          <button className="download-btn" onClick={handleDownloadJSON}><Download size={14} /> JSON</button>
        </div>
      </div>

      <div className="info-badge" style={{ marginBottom: '1.5rem' }}>
        <Info size={14} />
        <span>X-axis = Vibe Alignment. Y-axis = Structural Balance. Dot size = Novelty score. Color = fitness grade (green = elite, red = rejected).</span>
      </div>

      {/* Generation Slider */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="stat-label">Generation: <span style={{ color: 'var(--bio-primary)' }}>{selectedGen}</span></label>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--bio-text-muted)' }}>
            Pop: {currentPop.length} | Avg Fit: {avgFit.toFixed(3)}
          </span>
        </div>
        <input
          type="range"
          min={0} max={totalGens - 1}
          value={selectedGen}
          onChange={e => setSelectedGen(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--bio-primary)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--bio-text-muted)' }}>Gen 0</span>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--bio-text-muted)' }}>Gen {totalGens - 1}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'BEST SPECIMEN', value: bestInGen?.fitness?.toFixed(4), name: bestInGen?.name, color: 'var(--bio-primary)' },
          { label: 'AVG FITNESS', value: avgFit.toFixed(4), name: `${currentPop.length} individuals`, color: 'var(--bio-secondary)' },
          { label: 'HALL OF SHAME', value: worstInGen?.fitness?.toFixed(4), name: worstInGen?.name, color: 'var(--bio-accent)' }
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${s.color}33`,
            borderRadius: '8px',
            padding: '0.75rem',
            textAlign: 'center'
          }}>
            <div className="stat-label" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ color: s.color, fontFamily: 'JetBrains Mono', fontSize: '1.3rem', fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--bio-text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
          </div>
        ))}
      </div>

      {/* Scatter Plot */}
      <div id="pop-timeline-chart" style={{ width: '100%', height: '360px' }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.08)" />
            <XAxis type="number" dataKey="x" name="Vibe" domain={[0, 1]} stroke="var(--bio-text-muted)"
              label={{ value: 'Vibe Alignment →', position: 'insideBottom', offset: -15, fill: 'var(--bio-text-muted)', fontSize: 11 }} />
            <YAxis type="number" dataKey="y" name="Structure" domain={[0, 1]} stroke="var(--bio-text-muted)"
              label={{ value: '← Structural Balance', angle: -90, position: 'insideLeft', fill: 'var(--bio-text-muted)', fontSize: 11 }} />
            <ZAxis type="number" dataKey="z" range={[40, 350]} name="Novelty" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Population" data={currentPop}>
              {currentPop.map((entry, i) => (
                <Cell
                  key={i}
                  fill={getFitColor(entry.fitness)}
                  style={{ filter: entry.fitness > 0.7 ? `drop-shadow(0 0 6px ${getFitColor(entry.fitness)})` : 'none' }}
                  fillOpacity={0.85}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['#00ff88', '≥0.7 Elite'], ['#00c3ff', '≥0.5 Good'], ['#facc15', '≥0.3 Weak'], ['#ff007f', '<0.3 Rejected']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--bio-text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopulationTimeline;
