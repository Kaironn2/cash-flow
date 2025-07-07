import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';

type Params = {
  accessToken: string | null;
  selectedIds: string[];
  selectedMonth: number;
  selectedYear: number;
  expenses: any[];
  reloadExpenses: () => void;
  clearSelection: () => void;
};

export function useExpensesActions({
  accessToken,
  selectedIds,
  selectedMonth,
  selectedYear,
  expenses,
  reloadExpenses,
  clearSelection,
}: Params) {
  const handleCreateExpense = async (data: any) => {
    if (!accessToken) return;

    let url = endpoints.expenses;
    if (data.type === 'installment') url = endpoints.installments;
    else if (data.type === 'recurring') url = endpoints.recurring;

    await axios.post(url, data, { headers: authHeader(accessToken) });
    reloadExpenses();
  };

  const handleMarkPaid = async () => {
    if (!accessToken) return;

    const ids = selectedIds.map((id) => {
      const [type, rawId] = id.split('-');
      return { type, id: Number(rawId) };
    });

    await axios.post(
      endpoints.markPaid,
      { ids, month: selectedMonth, year: selectedYear },
      { headers: authHeader(accessToken) },
    );

    reloadExpenses();
    clearSelection();
  };

  const handleUnmarkPaid = async () => {
    if (!accessToken) return;

    const ids = selectedIds.map((id) => {
      const [type, rawId] = id.split('-');
      return { type, id: Number(rawId) };
    });

    await axios.post(
      endpoints.unmarkPaid,
      { ids, month: selectedMonth, year: selectedYear },
      { headers: authHeader(accessToken) },
    );

    reloadExpenses();
    clearSelection();
  };

  const handleDelete = async () => {
    if (!accessToken) return;

    const concreteIds: number[] = [];
    const installmentIds: number[] = [];
    const recurringIds: number[] = [];

    selectedIds.forEach((id) => {
      const [type, rawId] = id.split('-');
      const numId = Number(rawId);
      if (type === 'e') concreteIds.push(numId);
      else if (type === 'r') recurringIds.push(numId);
      else if (type === 'i') {
        const expense = expenses.find((e) => e.id === numId);
        if (expense && expense.installment_origin) {
          if (typeof expense.installment_origin === 'number') {
            installmentIds.push(expense.installment_origin);
          } else if (
            typeof expense.installment_origin === 'object' &&
            expense.installment_origin.id
          ) {
            installmentIds.push(expense.installment_origin.id);
          }
        }
      }
    });

    try {
      if (concreteIds.length > 0) {
        await Promise.all(
          concreteIds.map((id) =>
            axios.delete(`${endpoints.expenses}${id}/`, {
              headers: authHeader(accessToken),
            }),
          ),
        );
      }

      if (installmentIds.length > 0) {
        await Promise.all(
          installmentIds.map((id) =>
            axios.delete(`${endpoints.installments}${id}/`, {
              headers: authHeader(accessToken),
            }),
          ),
        );
      }

      if (recurringIds.length > 0) {
        await Promise.all(
          recurringIds.map((id) =>
            axios.delete(`${endpoints.recurring}${id}/`, {
              headers: authHeader(accessToken),
            }),
          ),
        );
      }

      clearSelection();
      reloadExpenses();
    } catch (error) {
      console.error('Erro ao deletar despesas:', error);
    }
  };

  return {
    handleCreateExpense,
    handleMarkPaid,
    handleUnmarkPaid,
    handleDelete,
  };
}
