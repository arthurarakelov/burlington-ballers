import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, duration = 800, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [prevValue, setPrevValue] = useState(0);

  useEffect(() => {
    if (value === prevValue) return;

    setPrevValue(displayValue);
    const startTime = Date.now();
    const startValue = displayValue;
    const change = value - startValue;

    const animateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + change * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [value, duration, displayValue, prevValue]);

  return (
    <span className={`transition-all duration-300 ${className}`}>
      {displayValue}
    </span>
  );
};

export default AnimatedCounter;