import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ open, title, subtitle, children, onClose, footer }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 p-7">
              <div>
                <h2 className="text-2xl font-bold text-ink">{title}</h2>
                {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="rounded-md p-1 text-2xl text-ink hover:bg-slate-100" aria-label="Close">
                <IoClose />
              </button>
            </div>
            <div className="overflow-y-auto px-7 pb-7">{children}</div>
            {footer && <div className="flex shrink-0 justify-end gap-4 border-t border-slate-200 p-7">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
