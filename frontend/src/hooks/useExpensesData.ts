'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';

export function useExpensesData(accessToken: string | null) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<
    { month: number; year: number }[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const reloadExpenses = useCallback(async () => {
    if (!accessToken) return;

    try {
      const [expensesRes, monthsRes] = await Promise.all([
        axios.get(`${endpoints.expenses}?year=${selectedYear}&month=${selectedMonth}`, {
          headers: authHeader(accessToken),
        }),
        axios.get(endpoints.expenseMonths, {
          headers: authHeader(accessToken),
        }),
      ]);

      const sortedMonths = monthsRes.data.sort(
        (a: { year: number; month: number }, b: { year: number; month: number }) =>
          a.year - b.year || a.month - b.month,
      );

      setExpenses(expensesRes.data);
      setAvailableMonths(sortedMonths);
    } catch (error) {
      console.error('Error on data loading: ', error);
    }
  }, [accessToken, selectedMonth, selectedYear]);

  useEffect(() => {
    reloadExpenses();
  }, [accessToken, reloadExpenses]);

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
