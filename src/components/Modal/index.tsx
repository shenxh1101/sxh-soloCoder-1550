import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, className, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brown-700/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative bg-white rounded-2xl shadow-hover w-full max-w-lg max-h-[90vh] flex flex-col',
        className
      )}>
        <div className="flex items-center justify-between p-6 border-b border-rose-50">
          <h3 className="font-serif text-lg font-semibold text-brown-700">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-rose-50 transition-colors text-brown-400 hover:text-brown-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        {footer && (
          <div className="p-6 border-t border-rose-50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
