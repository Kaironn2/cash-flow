'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { endpoints, authHeader } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      if (!accessToken) return;
      try {
        const res = await axios.get(endpoints.categories, {
          headers: authHeader(accessToken),
        });
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    }
    fetchCategories();
  }, [accessToken]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border px-3 py-2 rounded"
    >
      <option value="">Selecione uma categoria</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
