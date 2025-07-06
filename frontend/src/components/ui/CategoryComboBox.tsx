import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, PlusCircle } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/lib/api';

interface Category {
  id: number;
  name: string;
}

export function CategoryCombobox({
  value,
  onChange,
  accessToken,
}: {
  value: number | '';
  onChange: (id: number) => void;
  accessToken: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    axios
      .get(endpoints.categories, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setCategories(res.data));
  }, [accessToken]);

  const selected = categories.find((c) => c.id === value);

  const filtered = inputValue
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : categories;

  const handleSelect = (id: number) => {
    onChange(id);
    setOpen(false);
  };

  const handleCreate = async () => {
    try {
      const res = await axios.post(
        endpoints.categories,
        { name: inputValue },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setCategories([...categories, res.data]);
      onChange(res.data.id);
      setOpen(false);
    } catch (e) {
      alert('Erro ao criar categoria');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selected ? selected.name : 'Selecione ou crie uma categoria'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="Buscar ou criar..."
          />
          <CommandList>
            {filtered.length > 0 ? (
              filtered.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.name}
                  onSelect={() => handleSelect(cat.id)}
                >
                  {cat.name}
                  {value === cat.id && (
                    <Check className="ml-auto h-4 w-4 text-green-600" />
                  )}
                </CommandItem>
              ))
            ) : (
              <CommandItem onSelect={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar “{inputValue}”
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
