import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  closeOnEscape?: boolean;
}

export default function Modal({ open, onClose, title, children, maxWidth = '440px', closeOnEscape = true }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && closeOnEscape) {
        console.log('🎯 [Modal] Escape key pressed - closeOnEscape:', closeOnEscape);
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose, closeOnEscape]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        console.log('🎯 [Modal] Backdrop clicked - closeOnEscape:', closeOnEscape, 'e.target === ref:', e.target === overlayRef.current);
        if (e.target === overlayRef.current && closeOnEscape) {
          console.log('🎯 [Modal] Calling onClose() from backdrop click');
          onClose();
        }
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full glass-panel rounded-2xl overflow-hidden animate-fade-in"
        style={{ maxWidth }}
      >
        <div className="h-[3px] gradient-orange" />
        <div className="p-6">
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-covoit-text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          )}
          {!title && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors text-covoit-text-secondary hover:text-white z-10"
            >
              <X size={20} />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
