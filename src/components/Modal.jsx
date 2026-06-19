import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../lib/utils';

export default function Modal({ isOpen, onClose, title, children, fullScreenOnMobile = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 transition-opacity modal-backdrop">
      <div 
        className={cn(
          "flex flex-col relative overflow-hidden modal-content",
          fullScreenOnMobile ? "w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl" : "w-full max-w-lg"
        )}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 modal-header">
          <h2 className="modal-title font-catalogue mb-0 pb-0">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-primary rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 pb-6 pt-2 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
