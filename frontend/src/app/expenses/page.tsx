'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ExpensesPage() {
  const { accessToken } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    axios
      .get(`${endpoints.expenses}?year=${year}&month=${month}`, {
        headers: authHeader(accessToken),
      })
      .then((res) => setExpenses(res.data))
      .catch((err) => console.error(err));
  }, [accessToken]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {expenses.map((exp) => (
        <div key={exp.id}>
          <div className="bg-[#1e1e1e] p-4 rounded-xl">
            <div className="flex justify-between">
              <span>{exp.name}</span>
              <span className="text-yellow-400 font-medium">R$ {Number(exp.amount).toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-400">
              Vencimento: {exp.due_date} <br />
              Categoria: {exp.category?.name || '-'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
