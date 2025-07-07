'use client';

import { Button } from '@/components/ui/button';

type Props = {
  onMarkPaid: () => void;
  onUnmarkPaid: () => void;
  onDeleteClick: () => void;
};

export function ExpenseActionsBar({ onMarkPaid, onUnmarkPaid, onDeleteClick }: Props) {
  return (
    <div className="flex gap-4 mb-4">
      <Button
        className="bg-green-700 text-white hover:bg-green-600"
        onClick={onMarkPaid}
      >
        Marcar como Pago
      </Button>
      <Button
        className="bg-gray-700 text-white hover:bg-gray-600"
        onClick={onUnmarkPaid}
      >
        Remover Pagamento
      </Button>
      <Button
        className="bg-red-600 text-white hover:bg-red-500"
        onClick={onDeleteClick}
      >
        Excluir
      </Button>
    </div>
  );
}
