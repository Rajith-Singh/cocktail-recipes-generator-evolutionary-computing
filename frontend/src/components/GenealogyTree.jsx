import React, { useMemo, useRef, useState } from 'react';
import { Download, GitBranch, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { downloadSvgElementAsPng } from '../utils/download';

const NODE_W = 160;
const NODE_H = 62;
const GEN_GAP_Y = 130;
const NODE_GAP_X = 180;
const MAX_NODES_PER_GEN = 8; // cap display to avoid visual clutter

function getFitColor(fitness) {
  if (fitness >= 0.7) return '#00ff88';
  if (fitness >= 0.5) return '#00c3ff';
  if (fitness >= 0.3) return '#facc15';
  return '#ff007f';
}

const GenealogyTree = ({ snapshots, alpha }) => {
  const svgRef = useRef(null);
  const [showAll, setShowAll] = useState(false);

  const { treeNodes, edgeList, positions, svgW, svgH, alphaId } = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      return { treeNodes: [], edgeList: [], positions: {}, svgW: 700, svgH: 200, alphaId: null };
    }

    // Build ID → full node map
    const idMap = {};
    snapshots.forEach((gen, gi) => {
      gen.forEach(ind => { idMap[ind.id] = { ...ind, gen: gi }; });
    });

    // Identify best-fitness individual in last gen
    const lastGen = snapshots[snapshots.length - 1] || [];
    const bestNode = lastGen.reduce((b, c) => (c.fitness > (b?.fitness ?? -1) ? c : b), null);
    const alphaId = bestNode?.id ?? null;

    // Collect nodes to display:
    // Strategy: Show last 3 gens (or all if showAll), keeping top MAX_NODES_PER_GEN each (sorted by fitness desc)
    const genLimit = showAll ? snapshots.length : Math.min(3, snapshots.length);
    const startGenIdx = snapshots.length - genLimit;

    const selectedNodes = [];
    const selectedIds = new Set();

    for (let gi = startGenIdx; gi < snapshots.length; gi++) {
      const gen = snapshots[gi];
      const sorted = [...gen].sort((a, b) => b.fitness - a.fitness);
      const take = sorted.slice(0, MAX_NODES_PER_GEN);
      take.forEach(ind => {
        const node = idMap[ind.id] || { ...ind, gen: gi };
        selectedNodes.push(node);
        selectedIds.add(ind.id);
      });
    }

    // Group by generation
    const genGroups = {};
    selectedNodes.forEach(n => {
      if (!genGroups[n.gen]) genGroups[n.gen] = [];
      genGroups[n.gen].push(n);
    });

    const gKeys = Object.keys(genGroups).sort((a, b) => +a - +b);
    const maxPer = Math.max(...gKeys.map(g => genGroups[g].length), 1);
    const sw = Math.max(maxPer * NODE_GAP_X + 80, 750);
    const sh = gKeys.length * GEN_GAP_Y + 100;

    // Assign positions
    const pos = {};
    gKeys.forEach((gk, gi) => {
      const grp = genGroups[gk];
      const startX = (sw - grp.length * NODE_GAP_X) / 2 + NODE_GAP_X / 2;
      grp.forEach((n, ni) => {
        pos[n.id] = { x: startX + ni * NODE_GAP_X, y: gi * GEN_GAP_Y + 60 };
      });
    });

    // Build edges: only between nodes that are both displayed
    const edges = [];
    selectedNodes.forEach(node => {
      (node.parents || []).forEach(pid => {
        if (selectedIds.has(pid) && pos[pid] && pos[node.id]) {
          edges.push({ from: pid, to: node.id });
        }
      });
    });

    return { treeNodes: selectedNodes, edgeList: edges, positions: pos, svgW: sw, svgH: sh, alphaId };
  }, [snapshots, alpha, showAll]);

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="bio-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
        <GitBranch size={48} style={{ marginBottom: '1rem', color: 'var(--bio-secondary)' }} />
        <p className="subtitle">Run an evolution to generate the Genealogy Tree.</p>
      </div>
    );
  }

  const handleDownload = () => downloadSvgElementAsPng(svgRef.current, 'genealogy_tree.png');

  const total = treeNodes.length;
  const genCount = [...new Set(treeNodes.map(n => n.gen))].length;
  const avgFit = total > 0 ? (treeNodes.reduce((s, n) => s + n.fitness, 0) / total).toFixed(3) : '—';

  return (
    <div className="bio-card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GitBranch size={22} style={{ color: 'var(--bio-secondary)' }} />
          <h3>Genetic Genealogy Tree</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="download-btn" onClick={() => setShowAll(s => !s)}>
            {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showAll ? 'Collapse' : 'Show All Gens'}
          </button>
          <button className="download-btn" onClick={handleDownload}>
            <Download size={14} /> PNG
          </button>
        </div>
      </div>

      <div className="info-badge" style={{ marginBottom: '1.5rem' }}>
        <Info size={14} />
        <span>
          Shows the top {MAX_NODES_PER_GEN} specimens per generation (sorted by fitness).
          Dashed lines = parent→child breeding. <strong style={{ color: 'var(--bio-primary)' }}>★ = Alpha (best overall).</strong>
          {!showAll && snapshots.length > 3 && <> Showing last 3 of {snapshots.length} generations. Click <em>Show All Gens</em> to expand.</>}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'NODES SHOWN', val: total, color: 'var(--bio-primary)' },
          { label: 'GENERATIONS', val: genCount, color: 'var(--bio-secondary)' },
          { label: 'AVG FITNESS', val: avgFit, color: 'var(--bio-accent)' },
          { label: 'BREEDING LINKS', val: edgeList.length, color: '#facc15' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div className="stat-label" style={{ fontSize: '0.6rem', marginBottom: '2px' }}>{s.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono', color: s.color, fontSize: '1.2rem', fontWeight: 800 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* SVG Tree */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '540px', border: '1px solid var(--bio-border)', borderRadius: '10px' }}>
        <svg
          ref={svgRef}
          width={svgW}
          height={svgH}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', background: 'rgba(0,5,2,0.8)', minWidth: svgW }}
        >
          <defs>
            <filter id="alphaGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <marker id="arrowTip" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="rgba(0,195,255,0.55)" />
            </marker>
          </defs>

          {/* Edges */}
          {edgeList.map((e, i) => {
            const f = positions[e.from];
            const t = positions[e.to];
            if (!f || !t) return null;
            const x1 = f.x, y1 = f.y + NODE_H / 2 + 3;
            const x2 = t.x, y2 = t.y - NODE_H / 2 - 3;
            const my = (y1 + y2) / 2;
            return (
              <path
                key={`e${i}`}
                d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`}
                stroke="rgba(0,195,255,0.4)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="5 3"
                markerEnd="url(#arrowTip)"
              />
            );
          })}

          {/* Nodes */}
          {treeNodes.map(node => {
            const p = positions[node.id];
            if (!p) return null;
            const isAlpha = node.id === alphaId;
            const color = getFitColor(node.fitness);
            const lx = p.x - NODE_W / 2;
            const ly = p.y - NODE_H / 2;
            const rawName = node.name || 'Specimen';
            const label = rawName.length > 18 ? rawName.substring(0, 17) + '…' : rawName;
            const barW = Math.max(0, Math.min(NODE_W - 20, (NODE_W - 20) * node.fitness));

            return (
              <g key={node.id}>
                {/* Card */}
                <rect x={lx} y={ly} width={NODE_W} height={NODE_H} rx="9"
                  fill={isAlpha ? 'rgba(0,60,30,0.95)' : 'rgba(5,18,10,0.92)'}
                  stroke={isAlpha ? '#00ff88' : color}
                  strokeWidth={isAlpha ? 2.5 : 1}
                  filter={isAlpha ? 'url(#alphaGlow)' : undefined}
                />
                {/* Alpha star */}
                {isAlpha && (
                  <text x={lx + NODE_W - 12} y={ly + 15} fill="#00ff88" fontSize="14">★</text>
                )}
                {/* Name */}
                <text x={p.x} y={ly + 17} textAnchor="middle" fill="#d5ffe8" fontSize="10.5" fontFamily="Inter,sans-serif" fontWeight="600">
                  {label}
                </text>
                {/* Fitness bar track */}
                <rect x={lx + 10} y={ly + 26} width={NODE_W - 20} height={5} rx="2" fill="rgba(0,0,0,0.5)" />
                {/* Fitness bar fill */}
                <rect x={lx + 10} y={ly + 26} width={barW} height={5} rx="2" fill={color} />
                {/* ID & gen */}
                <text x={p.x} y={ly + 43} textAnchor="middle" fill={color} fontSize="8.5" fontFamily="JetBrains Mono,monospace">
                  {`Fit: ${node.fitness.toFixed(3)}  ·  Gen ${node.gen}`}
                </text>
                {/* Parents link hint */}
                {(node.parents || []).length > 0 && (
                  <text x={p.x} y={ly + 56} textAnchor="middle" fill="rgba(0,195,255,0.4)" fontSize="7.5" fontFamily="JetBrains Mono,monospace">
                    {`parents: ${node.parents.length}`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Gen labels */}
          {[...new Set(treeNodes.map(n => n.gen))].sort((a, b) => a - b).map(g => {
            const nodesInGen = treeNodes.filter(n => n.gen === g);
            if (!nodesInGen.length) return null;
            const y = positions[nodesInGen[0].id]?.y ?? 60;
            return (
              <text key={`gl-${g}`} x={8} y={y + 5} fill="rgba(0,200,255,0.3)" fontSize="10" fontFamily="JetBrains Mono">
                G{g}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['#00ff88','≥0.7 Elite'],['#00c3ff','≥0.5 Good'],['#facc15','≥0.3 Weak'],['#ff007f','<0.3 Reject']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--bio-text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenealogyTree;
