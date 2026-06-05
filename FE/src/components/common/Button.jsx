import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon, 
  loading = false, 
  disabled = false, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-[0.98]',
    outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 active:scale-[0.98]',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 active:scale-[0.98]',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-[0.98]',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-[0.98]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-bold',
    md: 'px-5 py-2.5 text-sm rounded-2xl font-bold',
    lg: 'px-8 py-4 text-base rounded-2xl font-bold'
  };

  const baseClasses = 'inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : Icon && (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
      )}
      {children}
    </button>
  );
};

export default Button;
