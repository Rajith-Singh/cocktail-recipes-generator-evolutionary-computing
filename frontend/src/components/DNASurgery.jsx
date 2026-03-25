import React, { useState, useEffect } from 'react';

const DNASurgery = ({ currentLogLine }) => {
  const [isCrossover, setIsCrossover] = useState(false);
  const [isMutation, setIsMutation] = useState(false);

  useEffect(() => {
    if (!currentLogLine) return;
    
    if (currentLogLine.includes('Crossover')) {
      setIsCrossover(true);
      const timer = setTimeout(() => setIsCrossover(false), 800);
      return () => clearTimeout(timer);
    }
    
    if (currentLogLine.includes('Mutation')) {
      setIsMutation(true);
      const timer = setTimeout(() => setIsMutation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentLogLine]);

  return (
    <div className="dna-surgery" style={{
      height: '100px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '2rem',
      margin: '1rem 0',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '8px',
      border: '1px dashed var(--bio-border)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Visual representation of two DNA strands merging or pulsing */}
      <div style={{
        width: '120px',
        height: '4px',
        background: 'linear-gradient(90deg, #00c3ff, #00ff88)',
        borderRadius: '2px',
        transform: isCrossover ? 'scaleX(1.1) rotate(5deg)' : 'scaleX(1)',
        transition: 'all 0.3s ease',
        boxShadow: isCrossover ? '0 0 20px #00c3ff' : 'none'
      }}></div>

      <div style={{
        fontSize: '0.8rem',
        fontFamily: 'JetBrains Mono',
        color: isMutation ? 'var(--bio-accent)' : isCrossover ? 'var(--bio-secondary)' : 'var(--bio-text-muted)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        transform: (isMutation || isCrossover) ? 'scale(1.2)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}>
        {isMutation ? '[ MUTATION_FLASH ]' : isCrossover ? '[ CROSSOVER_MERGE ]' : 'STABLE_HELIX'}
      </div>

      <div style={{
        width: '120px',
        height: '4px',
        background: 'linear-gradient(90deg, #00ff88, #ff007f)',
        borderRadius: '2px',
        transform: isCrossover ? 'scaleX(1.1) rotate(-5deg)' : 'scaleX(1)',
        transition: 'all 0.3s ease',
        boxShadow: isCrossover ? '0 0 20px #ff007f' : 'none'
      }}></div>

      {isMutation && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 0, 127, 0.1)',
          animation: 'pulseGlow 0.5s infinite alternate'
        }}></div>
      )}
    </div>
  );
};

export default DNASurgery;
