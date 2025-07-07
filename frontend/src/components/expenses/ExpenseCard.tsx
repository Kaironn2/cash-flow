'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';

type Expense = {
  id: number;
  name: string;
  amount: number;
  due_date: string;
  paid: boolean;
  category?: { name: string };
  is_recurring?: boolean;
  is_installment?: boolean;
  installment_origin?: any;
};

type Props = {
  expense: Expense;
  checked: boolean;
  onToggle: () => void;
};

export function ExpenseCard({ expense, checked, onToggle }: Props) {
  const prefix = expense.is_recurring ? 'r' : expense.is_installment ? 'i' : 'e';
  const id = `${prefix}-${expense.id}`;

  const getStatusColor = () => {
    if (expense.paid) return 'bg-green-800 text-green-300';
    const vencida = new Date(expense.due_date) < new Date();
    return vencida ? 'bg-red-800 text-red-300' : 'bg-orange-800 text-orange-300';
  };

  const getLocalDate = (utcDate: string) => {
    const date = new Date(utcDate);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  };

  return (
    <div key={id} className="bg-[#1e1e1e] p-4 rounded-xl">
      <div className="flex justify-between items-start">
        <span className="font-medium">{expense.name}</span>
        <Checkbox checked={checked} onCheckedChange={onToggle} />
      </div>

      <div className="flex justify-between mt-2">
        <div className="flex flex-col gap-1 text-sm text-gray-400">
          <span className="text-yellow-400 font-medium text-base">
            {Number(expense.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          <span>Vencimento: {getLocalDate(expense.due_date).toLocaleDateString('pt-BR')}</span>
          <span>Categoria: {expense.category?.name || '-'}</span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge className={clsx('text-xs min-w-[120px]', getStatusColor())}>
            {expense.paid
              ? 'Pago'
              : new Date(expense.due_date) < new Date()
              ? 'Atrasado'
              : 'Pendente'}
          </Badge>
          {expense.is_installment && (
            <Badge className="bg-blue-800 text-blue-300 min-w-[120px]">
              Parcelada {expense.name.match(/\((\d+\/\d+)\)/)?.[1] || ''}
            </Badge>
          )}
          {expense.is_recurring && (
            <Badge className="bg-purple-800 text-purple-300 min-w-[120px]">
              Recorrente Ativa
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
