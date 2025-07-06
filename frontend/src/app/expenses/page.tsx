'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';

export default function ExpensesPage() {
  const { accessToken } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCreateExpense = async (data: any) => {
    if (!accessToken) return;

    let url = endpoints.expenses;

    if (data.type === 'installment') url = endpoints.installments;
    else if (data.type === 'recurring') url = endpoints.recurring;

    try {
      await axios.post(url, data, {
        headers: authHeader(accessToken),
      });
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const res = await axios.get(`${endpoints.expenses}?year=${year}&month=${month}`, {
        headers: authHeader(accessToken),
      });
      setExpenses(res.data);
    } catch (err) {
      console.error('Erro ao criar despesa:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded hover:bg-yellow-400"
        >
          + Nova Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.map((exp) => (
          <div key={exp.id} className="bg-[#1e1e1e] p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <span className="font-medium">{exp.name}</span>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  {exp.is_installment && (
                    <Badge className="bg-blue-800 text-blue-300">
                      Parcelada {exp.name.match(/\((\d+\/\d+)\)/)?.[1] || ''}
                    </Badge>
                  )}
                  {exp.is_recurring && (
                    <Badge className="bg-purple-800 text-purple-300">
                      Recorrente Ativa
                    </Badge>
                  )}
                  <span className="text-yellow-400 font-medium">
                    {Number(exp.amount).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-400 mt-2">
              Vencimento: {new Date(exp.due_date).toLocaleDateString('pt-BR')} <br />
              Categoria: {exp.category?.name || '-'}
            </div>
          </div>
        ))}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateExpense}
        accessToken={accessToken}
      />
    </div>
  );
}
