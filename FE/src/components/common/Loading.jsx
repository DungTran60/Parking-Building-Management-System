import React from 'react';

const Loading = ({ 
  size = 'md', 
  fullScreen = false, 
  text = 'Đang tải dữ liệu...', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`
        ${sizes[size]} 
        border-slate-100 border-t-blue-600 rounded-full animate-spin
        shadow-sm
      `}></div>
      {text && (
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center ${className}`}>
        {spinner}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {spinner}
    </div>
  );
};

export default Loading;
