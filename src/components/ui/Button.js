import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 transform focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500 active:bg-blue-800',
    secondary: 'bg-transparent border border-gray-600 hover:border-gray-500 hover:bg-gray-500/10 text-gray-300 hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-gray-500',
    danger: 'bg-transparent border border-red-600 hover:border-red-500 hover:bg-red-500/10 text-red-400 hover:text-red-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-500 active:bg-green-800',
    ghost: 'bg-transparent hover:bg-gray-500/10 text-gray-300 hover:text-white'
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = async (e) => {
    if (loading || disabled) return;
    
    // Add press animation
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) {
      await onClick(e);
    }
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;