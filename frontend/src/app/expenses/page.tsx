'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';

// Import dos componentes Select do shadcn
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';

export default function ExpensesPage() {
  const { accessToken } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<
    { month: number; year: number }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  useEffect(() => {
    if (!accessToken) return;

    axios
      .get(endpoints.expenseMonths, {
        headers: authHeader(accessToken),
      })
      .then((res) => {
        setAvailableMonths(res.data);
        if (res.data.length > 0) {
          setSelectedYear(res.data[0].year);
          setSelectedMonth(res.data[0].month);
        }
      })
      .catch((err) => console.error(err));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    axios
      .get(`${endpoints.expenses}?year=${selectedYear}&month=${selectedMonth}`, {
        headers: authHeader(accessToken),
      })
      .then((res) => setExpenses(res.data))
      .catch((err) => console.error(err));
  }, [accessToken, selectedYear, selectedMonth]);

  const handleCreateExpense = async (data: any) => {
    if (!accessToken) return;

    let url = endpoints.expenses;
    if (data.type === 'installment') url = endpoints.installments;
    else if (data.type === 'recurring') url = endpoints.recurring;

    try {
      await axios.post(url, data, {
        headers: authHeader(accessToken),
      });

      const res = await axios.get(
        `${endpoints.expenses}?year=${selectedYear}&month=${selectedMonth}`,
        {
          headers: authHeader(accessToken),
        },
      );
      setExpenses(res.data);
    } catch (err) {
      console.error('Erro ao criar despesa:', err);
    }
  };

  const years = Array.from(new Set(availableMonths.map((m) => m.year))).sort(
    (a, b) => a - b,
  );

  const monthsOfSelectedYear = availableMonths
    .filter((m) => m.year === selectedYear)
    .sort((a, b) => a.month - b.month);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {monthsOfSelectedYear.map((m) => (
                <SelectItem key={m.month} value={m.month.toString()}>
                  {monthNames[m.month - 1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => {
              const year = parseInt(value);
              setSelectedYear(year);
              const months = availableMonths
                .filter((m) => m.year === year)
                .map((m) => m.month);
              if (months.length > 0) setSelectedMonth(months[0]);
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
