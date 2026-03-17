import React from 'react';
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
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] disabled:opacity-40 disabled:pointer-events-none touch-manipulation active:scale-[0.97]';

  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-400',
    secondary: 'bg-white/10 text-white hover:bg-white/[0.15]',
    danger: 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25',
    success: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25',
    ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/10',
  };

  const sizes = {
    sm: 'min-h-[44px] min-w-[44px] px-3 py-2 text-sm',
    md: 'min-h-[44px] px-5 py-2.5 text-sm',
    lg: 'min-h-[48px] px-6 py-3 text-[15px]',
  };

  const handleClick = async (e) => {
    if (loading || disabled) return;
    if (onClick) await onClick(e);
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
