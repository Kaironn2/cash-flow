'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { ExpenseActionsBar } from '@/components/expenses/ExpenseActionsBar';
import { SelectAllCheckbox } from '@/components/expenses/SelectAllCheckbox';
import { DeleteModal } from '@/components/expenses/DeleteModal';
import { Button } from '@/components/ui/button';

import { useExpensesData } from '@/hooks/useExpensesData';
import { useExpensesSelection } from '@/hooks/useExpensesSelection';
import { useExpensesActions } from '@/hooks/useExpensesActions';

export default function ExpensesPage() {
  const { accessToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    expenses,
    availableMonths,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    reloadExpenses,
  } = useExpensesData(accessToken);

  const {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    selectAll,
    getSelectedIdsFormatted,
  } = useExpensesSelection(expenses);

  const {
    handleCreateExpense,
    handleMarkPaid,
    handleUnmarkPaid,
    handleDelete,
  } = useExpensesActions({
    accessToken,
    selectedIds,
    selectedMonth,
    selectedYear,
    expenses,
    reloadExpenses,
    clearSelection: () => setSelectedIds([]),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <ExpenseFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          availableMonths={availableMonths}
          onMonthChange={setSelectedMonth}
          onYearChange={(y) => {
            setSelectedYear(y);
            const months = availableMonths.filter((m) => m.year === y).map((m) => m.month);
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
