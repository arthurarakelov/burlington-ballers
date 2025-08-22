import React from 'react';

const TransitionParticles = ({ isActive, type = 'sparkle' }) => {
  if (!isActive) return null;

  const getParticleStyle = (index) => {
    const delay = index * 50;
    const duration = 600 + Math.random() * 400;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      animationDelay: `${delay}ms`,
      animationDuration: `${duration}ms`
    };
  };

  const particleCount = type === 'sparkle' ? 8 : 12;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 bg-orange-400 rounded-full ${type === 'burst' ? 'particle-burst' : 'particle-sparkle'}`}
          style={getParticleStyle(i)}
        />
      ))}
      
      {/* Additional bigger particles for more impact */}
      {type === 'burst' && Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`burst-${i}`}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full particle-burst"
          style={{
            ...getParticleStyle(i),
            animationDelay: `${i * 80}ms`
          }}
        />
      ))}
    </div>
  );
};

export default TransitionParticles;