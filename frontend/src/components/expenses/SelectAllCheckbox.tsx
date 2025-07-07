'use client';

import { Checkbox } from '@/components/ui/checkbox';

type Props = {
  checked: boolean;
  onChange: () => void;
};

export function SelectAllCheckbox({ checked, onChange }: Props) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span>Selecionar todos</span>
    </div>
  );
}
