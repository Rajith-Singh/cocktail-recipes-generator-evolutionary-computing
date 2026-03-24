import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

const DataPoints = ({ data, onHover }) => {
  const meshRef = useRef();
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Create color array based on cluster
  const colors = useMemo(() => {
    const arr = new Float32Array(data.length * 3);
    const color = new THREE.Color();
    const clusterColors = [
      '#c026d3', '#4f46e5', '#2dd4bf', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'
    ];
    
    data.forEach((d, i) => {
      const hex = clusterColors[Math.abs(d.cluster + 1) % clusterColors.length];
      color.set(hex);
      arr[i*3] = color.r;
      arr[i*3+1] = color.g;
      arr[i*3+2] = color.b;
    });
    return arr;
  }, [data]);

  useFrame(() => {
    if (!meshRef.current) return;
    data.forEach((d, i) => {
      dummy.position.set(d.umap_x * 2, d.umap_y * 2, d.umap_z * 2);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, data.length]}>
      <sphereGeometry args={[0.08, 16, 16]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </sphereGeometry>
      <meshStandardMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
};

export default function FlavorUniverseMap({ data }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="w-full h-[600px] rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden relative">
      {hovered && (
        <div className="absolute top-4 left-4 z-10 bg-gray-950/80 backdrop-blur border border-fuchsia-500/30 p-4 rounded-xl shadow-lg pointer-events-none">
          <h3 className="text-white font-bold">{hovered.cocktail_name}</h3>
          <p className="text-xs text-gray-400 mt-1">Cluster: {hovered.cluster}</p>
          <p className="text-xs text-fuchsia-400">Success: {hovered.success_score}</p>
        </div>
      )}
      
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#f0abfc" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#818cf8" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate autoRotateSpeed={0.5} />
        
        {data && data.length > 0 && (
          <DataPoints data={data} onHover={setHovered} />
        )}
      </Canvas>
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-gray-500 pointer-events-none">
        <div>Total Points: {data ? data.length : 0}</div>
        <div>Drag to Rotate • Scroll to Zoom</div>
      </div>
    </div>
  );
}
