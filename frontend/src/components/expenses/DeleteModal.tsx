'use client';

import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
};

export function DeleteModal({ isOpen, onClose, onConfirm, selectedCount }: Props) {
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
          data-testid="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOutsideClick}
        >
          <motion.div
            ref={modalRef}
            data-testid="modal-content"
            className="bg-[#1e1e1e] text-white rounded-xl w-full max-w-sm p-6 shadow-lg relative"
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

            <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir {selectedCount} despesa
              {selectedCount > 1 ? 's' : ''}?
            </p>

            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-500"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Excluir
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
