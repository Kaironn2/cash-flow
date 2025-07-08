'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-[#1a1a1a]">
      <h1 className="text-xl font-semibold text-white"></h1>
      <div className="flex items-center gap-4">
        <Button
          onClick={logout}
          className="bg-transparent hover:bg-yellow-600 hover:text-black text-white flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
