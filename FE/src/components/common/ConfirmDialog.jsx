import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận hành động', 
  message = 'Bạn có chắc chắn muốn thực hiện hành động này không? Hành động này không thể hoàn tác.', 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy bỏ', 
  variant = 'danger',
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={loading ? null : onClose}
      ></div>

      {/* Dialog */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl shadow-slate-900/40 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="absolute top-6 right-6">
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 pb-8 flex flex-col items-center text-center">
          <div className={`
            w-20 h-20 rounded-[28px] mb-6 flex items-center justify-center
            ${variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'}
          `}>
            {variant === 'danger' ? <AlertTriangle size={40} strokeWidth={2.5} /> : <AlertTriangle size={40} className="rotate-180" strokeWidth={2.5} />}
          </div>

          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">
            {message}
          </p>
        </div>

        <div className="p-8 pt-0 flex gap-3">
          <Button 
            variant="ghost" 
            className="flex-1" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            className="flex-1" 
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
