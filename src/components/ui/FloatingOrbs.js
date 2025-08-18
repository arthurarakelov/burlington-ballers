import React from 'react';

const FloatingOrbs = ({ mousePosition }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 animate-pulse duration-[8000ms]"
        style={{
          background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)',
          left: mousePosition.x - 400,
          top: mousePosition.y - 400,
          transition: 'all 2s ease-out'
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-pulse duration-[6000ms]"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
          transition: 'all 3s ease-out',
          animationDelay: '1s'
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full opacity-25 animate-pulse duration-[4000ms]"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
          transition: 'all 4s ease-out',
          animationDelay: '2s'
        }}
      />
    </div>
  );
};

export default FloatingOrbs;