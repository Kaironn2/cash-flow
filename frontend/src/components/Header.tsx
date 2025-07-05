'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1a1a1a]">
      <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      <div className="flex items-center gap-4">
        <Button onClick={logout} className="bg-yellow-500 text-black hover:bg-yellow-400">
          Sair
        </Button>
      </div>
    </header>
  );
}
