'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';

export function useExpensesData(accessToken: string | null) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const reloadExpenses = () => {
    if (!accessToken) return;
    axios
      .get(`${endpoints.expenses}?year=${selectedYear}&month=${selectedMonth}`, {
        headers: authHeader(accessToken),
      })
      .then((res) => setExpenses(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    if (!accessToken) return;

    axios
      .get(endpoints.expenseMonths, { headers: authHeader(accessToken) })
      .then((res) => {
        const sorted = res.data.sort((a: any, b: any) =>
          a.year !== b.year ? a.year - b.year : a.month - b.month,
        );
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

  return {
    expenses,
    availableMonths,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    reloadExpenses,
  };
}
