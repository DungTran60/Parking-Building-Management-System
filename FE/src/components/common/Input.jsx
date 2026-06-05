import React from 'react';

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  containerClassName = '', 
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input 
          className={`
            w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3 px-4 
            ${Icon ? 'pl-11' : ''} 
            ${error ? 'border-rose-100 bg-rose-50/30' : 'focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5'} 
            text-sm font-bold text-slate-800 placeholder:text-slate-400 transition-all outline-none
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
