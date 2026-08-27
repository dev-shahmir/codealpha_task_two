import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md', noScroll = false }) {
  const closeRef = useRef(null);
  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-5xl', '2xl': 'max-w-6xl' };

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!open) return;
    // Only steal focus to X button on initial open — NOT on every re-render
    // (stealing focus here was causing input to lose focus on every keystroke)
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`w-full ${widths[size]} ${noScroll ? 'max-h-[90vh] overflow-hidden flex flex-col' : 'max-h-[90vh] overflow-y-auto'} rounded-card border border-border-c bg-surface shadow-elevated`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-border-c px-5 py-4">
                <h2 className="font-heading text-lg font-semibold">{title}</h2>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="neon-focus rounded-lg p-1.5 text-ink-secondary hover:bg-soft-violet hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className={`p-5 ${noScroll ? 'flex-1 overflow-hidden flex flex-col min-h-0' : ''}`}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
