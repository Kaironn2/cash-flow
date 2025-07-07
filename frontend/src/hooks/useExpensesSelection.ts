import { useState } from 'react';

export function useExpensesSelection(expenses: any[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const getSelectedIdsFormatted = () =>
    selectedIds.map((id) => {
      const [type, rawId] = id.split('-');
      return { type, id: Number(rawId) };
    });

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    selectAll,
    getSelectedIdsFormatted,
  };
}
