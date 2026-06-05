import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  headerAction, 
  footer, 
  className = '', 
  noPadding = false, 
  ...props 
}) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${className}`} {...props}>
      {(title || subtitle || headerAction) && (
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-8'}>
        {children}
      </div>
      {footer && (
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
