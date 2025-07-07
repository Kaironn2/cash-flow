'use client';

import { Button } from '@/components/ui/button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
};

export function DeleteModal({ isOpen, onClose, onConfirm, selectedCount }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] p-6 rounded-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
        <p className="mb-6">
          Tem certeza que deseja excluir {selectedCount} despesa
          {selectedCount > 1 ? 's' : ''}?
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="bg-red-600 text-white hover:bg-red-500" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
