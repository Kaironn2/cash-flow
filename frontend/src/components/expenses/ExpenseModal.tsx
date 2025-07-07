'use client';

import { useRef } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  accessToken: string | null;
  defaultValues?: any | null;
  title?: string;
  disableTypeSelect?: boolean;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  accessToken,
  defaultValues = null,
  title,
  disableTypeSelect,
}: ExpenseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = 32;
    const modal = modalRef.current;

    if (!modal) return;

    const rect = modal.getBoundingClientRect();

    const clickedOutside =
      e.clientX < rect.left - bounds ||
      e.clientX > rect.right + bounds ||
      e.clientY < rect.top - bounds ||
      e.clientY > rect.bottom + bounds;

    if (clickedOutside) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOutsideClick}
        >
          <motion.div
            ref={modalRef}
            className="bg-[#1e1e1e] text-white rounded-xl w-full max-w-lg p-6 shadow-lg relative"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl font-bold"
            >
              x
            </button>

            <h2 className="text-2xl font-semibold mb-4">{title || 'Nova Despesa'}</h2>

            <ExpenseForm
              accessToken={accessToken}
              defaultValues={defaultValues}
              disableTypeSelect={disableTypeSelect}
              onSubmit={(data) => {
                onSubmit(data);
                onClose();
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
