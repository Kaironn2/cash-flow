'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { CategoryCombobox } from '../ui/CategoryComboBox';

type ExpenseType = 'unique' | 'installment' | 'recurring';

interface ExpenseFormProps {
  onSubmit: (data: any) => void;
  accessToken: string | null;
}

interface Category {
  id: number;
  name: string;
}

export function ExpenseForm({ onSubmit, accessToken }: ExpenseFormProps) {
  const [type, setType] = useState<ExpenseType>('unique');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [installments, setInstallments] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (!accessToken) return;
    async function fetchCategories() {
      try {
        const res = await axios.get(endpoints.categories, {
          headers: authHeader(accessToken as string),
        });
        setCategories(res.data);
      } catch (err) {
        console.error('Erro ao carregar categorias', err);
      }
    }
    fetchCategories();
  }, [accessToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !dueDate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    let data: any;

    if (type === 'unique') {
      data = {
        name,
        amount: parseFloat(amount),
        due_date: dueDate.toISOString().split('T')[0],
        paid: false,
        category_id: categoryId,
      };
    }

    if (type === 'installment') {
      data = {
        name,
        total_amount: parseFloat(amount),
        installments_quantity: parseInt(installments),
        first_due_date: dueDate.toISOString().split('T')[0],
        category_id: categoryId,
      };
    }

    if (type === 'recurring') {
      const dueDay = dueDate.getDate();
      data = {
        name,
        amount: parseFloat(amount),
        due_day: dueDay,
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        category_id: categoryId,
      };
    }

    onSubmit({ ...data, type });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-4">
        <div className="w-2/5 min-w-[180px]">
          <Label className="mb-2 block">Tipo</Label>
          <Select value={type} onValueChange={(value) => setType(value as ExpenseType)}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unique">Única</SelectItem>
              <SelectItem value="installment">Parcelada</SelectItem>
              <SelectItem value="recurring">Recorrente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-3/5 min-w-[240px]">
          <Label className="mb-2 block">Categoria</Label>
          <CategoryCombobox
            value={categoryId}
            onChange={setCategoryId}
            accessToken={accessToken as string}
          />
        </div>

      </div>

      <div>
        <Label className="mb-2 block">Nome</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <Label className="mb-2 block">Valor</Label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="w-1/2">
          <Label className="mb-2 block">Data de Vencimento</Label>
          <DatePicker date={dueDate} setDate={setDueDate} />
        </div>
      </div>

      {type === 'installment' && (
        <div>
          <Label className="mb-2 block">Quantidade de Parcelas</Label>
          <Input
            type="number"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
          />
        </div>
      )}

      {type === 'recurring' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Início</Label>
            <DatePicker date={startDate} setDate={setStartDate} />
          </div>
          <div>
            <Label className="mb-2 block">Fim (opcional)</Label>
            <DatePicker date={endDate} setDate={setEndDate} />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400">
        Salvar
      </Button>
    </form>
  );
}
