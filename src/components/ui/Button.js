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
  const base = 'bb-btn inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1512] disabled:opacity-40 disabled:pointer-events-none touch-manipulation active:scale-[0.98]';

  const variants = {
    primary: 'bb-btn-primary',
    default: 'bb-btn-primary',
    secondary: 'bb-btn-secondary',
    danger: 'bb-btn-danger',
    success: 'bb-btn-success',
    ghost: 'bb-btn-ghost',
    nav: 'bb-btn-nav',
    navActive: 'bb-btn-nav bb-btn-nav-active',
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
