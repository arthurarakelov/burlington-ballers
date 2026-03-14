import { useState, useEffect, useRef } from 'react';

const AnimatedCounter = ({ value, duration = 800, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;

    const startValue = prevValueRef.current;
    prevValueRef.current = value;

    const startTime = Date.now();
    const change = value - startValue;

    const animateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(startValue + change * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [value, duration]);

  return (
    <span className={`transition-all duration-300 ${className}`}>
      {displayValue}
    </span>
  );
};

export default AnimatedCounter;
