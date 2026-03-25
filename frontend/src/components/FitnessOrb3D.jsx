import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Download, Orbit } from 'lucide-react';

function FitnessNode({ position, fitness, label, isAlpha }) {
  const meshRef = useRef();
  const color = fitness > 0.7 ? '#00ff88' : fitness > 0.5 ? '#00c3ff' : fitness > 0.3 ? '#facc15' : '#ff007f';
  const scale = 0.3 + fitness * 0.7;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      if (isAlpha) {
        meshRef.current.scale.setScalar(scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1));
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[scale * 0.5, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isAlpha ? 0.6 : 0.2}
          transparent
          opacity={0.85}
          wireframe={!isAlpha}
        />
      </mesh>
      {isAlpha && (
        <Billboard>
          <Text fontSize={0.2} color="#00ff88" anchorX="center" anchorY="bottom" position={[0, scale * 0.6, 0]}>
            ★ ALPHA
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function GridPlane() {
  return (
    <gridHelper args={[10, 20, '#003322', '#001a11']} rotation={[0, 0, 0]} />
  );
}

function RotatingGroup({ children }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

const FitnessOrb3D = ({ snapshots, alpha }) => {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="bio-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
        <Orbit size={48} style={{ marginBottom: '1rem' }} />
        <p>Run an evolution to generate the 3D Fitness Orb.</p>
      </div>
    );
  }

  // Use last gen for the 3D orb - map to 3D positions
  const lastGen = snapshots[snapshots.length - 1] || [];
  const nodes3d = lastGen.map((ind, i) => {
    // Map vibe → X, structure → Y, novelty → Z
    const x = (ind.vibe - 0.5) * 8;
    const y = (ind.fitness - 0.5) * 6;
    const z = (ind.novelty - 0.5) * 8;
    return { position: [x, y, z], fitness: ind.fitness, label: ind.name, id: ind.id };
  });

  const alphaNode = nodes3d.find(n => n.id === alpha?.id);

  return (
    <div className="bio-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Orbit size={22} style={{ color: 'var(--bio-accent)' }} />
          <h3>3D Fitness Phenotype Space</h3>
        </div>
        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--bio-text-muted)' }}>Drag to rotate · Scroll to zoom</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'X-Axis', desc: 'Vibe Alignment', color: 'var(--bio-secondary)' },
          { label: 'Y-Axis', desc: 'Total Fitness', color: 'var(--bio-primary)' },
          { label: 'Z-Axis', desc: 'Novelty Score', color: 'var(--bio-accent)' }
        ].map((a, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', color: a.color }}>
            <div style={{ fontWeight: 800 }}>{a.label}</div>
            <div style={{ color: 'var(--bio-text-muted)' }}>{a.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--bio-border)' }}>
        <Canvas camera={{ position: [6, 4, 10], fov: 60 }} style={{ background: '#020804' }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00ff88" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00c3ff" />
          <GridPlane />
          <RotatingGroup>
            {nodes3d.map((node, i) => (
              <FitnessNode
                key={i}
                position={node.position}
                fitness={node.fitness}
                label={node.label}
                isAlpha={node.id === alpha?.id}
              />
            ))}
          </RotatingGroup>
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['#00ff88', 'Elite (≥0.7)'], ['#00c3ff', 'Good (≥0.5)'], ['#facc15', 'Weak (≥0.3)'], ['#ff007f', 'Rejected (<0.3)']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--bio-text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '2px', background: color, boxShadow: `0 0 5px ${color}` }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FitnessOrb3D;
