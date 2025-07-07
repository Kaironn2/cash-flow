'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { ExpenseActionsBar } from '@/components/expenses/ExpenseActionsBar';
import { SelectAllCheckbox } from '@/components/expenses/SelectAllCheckbox';
import { DeleteModal } from '@/components/expenses/DeleteModal';
import { Button } from '@/components/ui/button';

export default function ExpensesPage() {
  const { accessToken } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<
    { month: number; year: number }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const reloadExpenses = () => {
    axios
      .get(`${endpoints.expenses}?year=${selectedYear}&month=${selectedMonth}`, {
        headers: authHeader(accessToken as string),
      })
      .then((res) => setExpenses(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    type MonthYear = { month: number; year: number };
    if (!accessToken) return;

    axios
      .get(endpoints.expenseMonths, { headers: authHeader(accessToken) })
      .then((res) => {
        const sorted = res.data.sort((a: MonthYear, b: MonthYear) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });
        setAvailableMonths(sorted);
        if (sorted.length > 0) {
          setSelectedYear(sorted[0].year);
          setSelectedMonth(sorted[0].month);
        }
      })
      .catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    reloadExpenses();
  }, [accessToken, selectedYear, selectedMonth]);

  const handleCreateExpense = async (data: any) => {
    if (!accessToken) return;

    let url = endpoints.expenses;
    if (data.type === 'installment') url = endpoints.installments;
    else if (data.type === 'recurring') url = endpoints.recurring;

    await axios.post(url, data, { headers: authHeader(accessToken) });
    reloadExpenses();
  };

  const years = Array.from(new Set(availableMonths.map((m) => m.year)));
  const monthsOfSelectedYear = availableMonths.filter((m) => m.year === selectedYear);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    const allIds = expenses.map((e) => {
      const prefix = e.is_recurring ? 'r' : e.is_installment ? 'i' : 'e';
      return `${prefix}-${e.id}`;
    });
    setSelectedIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const handleMarkPaid = async () => {
    const ids = selectedIds.map((id) => {
      const [type, rawId] = id.split('-');
      return { type, id: Number(rawId) };
    });

    await axios.post(
      endpoints.markPaid,
      { ids, month: selectedMonth, year: selectedYear },
      { headers: authHeader(accessToken as string) },
    );

    reloadExpenses();
    setSelectedIds([]);
  };

  const handleUnmarkPaid = async () => {
    const ids = selectedIds.map((id) => {
      const [type, rawId] = id.split('-');
      return { type, id: Number(rawId) };
    });

    await axios.post(
      endpoints.unmarkPaid,
      { ids, month: selectedMonth, year: selectedYear },
      { headers: authHeader(accessToken as string) },
    );

    reloadExpenses();
    setSelectedIds([]);
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

      setSelectedIds([]);
      reloadExpenses();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erro ao deletar despesas:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <ExpenseFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          availableMonths={availableMonths}
          onMonthChange={(m) => setSelectedMonth(m)}
          onYearChange={(y) => {
            setSelectedYear(y);
            const months = availableMonths
              .filter((m) => m.year === y)
              .map((m) => m.month);
            if (months.length > 0) setSelectedMonth(months[0]);
          }}
        />

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 text-gray-900 hover:bg-yellow-400"
        >
          + Nova Despesa
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <ExpenseActionsBar
          onMarkPaid={handleMarkPaid}
          onUnmarkPaid={handleUnmarkPaid}
          onDeleteClick={() => setIsDeleteModalOpen(true)}
        />
      )}

      <SelectAllCheckbox
        checked={selectedIds.length === expenses.length && expenses.length > 0}
        onChange={selectAll}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {expenses.map((exp) => {
          const prefix = exp.is_recurring ? 'r' : exp.is_installment ? 'i' : 'e';
          const id = `${prefix}-${exp.id}`;
          return (
            <ExpenseCard
              key={id}
              expense={exp}
              checked={selectedIds.includes(id)}
              onToggle={() => toggleSelect(id)}
            />
          );
        })}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateExpense}
        accessToken={accessToken}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        selectedCount={selectedIds.length}
      />
    </div>
  );
}
