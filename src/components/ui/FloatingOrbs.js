import React from 'react';

const FloatingOrbs = ({ mousePosition }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)',
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
          transition: 'all 2s ease-out',
          animationDuration: '8000ms'
        }}
      />
    </div>
  );
};

export default FloatingOrbs;