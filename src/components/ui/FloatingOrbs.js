import React from 'react';

const FloatingOrbs = ({ mousePosition }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute w-[500px] h-[500px] rounded-full opacity-15"
      style={{
        background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)',
        left: mousePosition.x - 250,
        top: mousePosition.y - 250,
        transition: 'all 2s ease-out',
      }}
    />
  </div>
);

export default FloatingOrbs;
