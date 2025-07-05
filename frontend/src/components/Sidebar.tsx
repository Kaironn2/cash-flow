'use client';
import {
  Home,
  Wallet,
  BarChart2,
  Settings,
  HelpCircle,
  User,
} from 'lucide-react';
import Link from 'next/link';

const items = [
  { icon: <Home size={18} />, label: 'Dashboard', href: '/dashboard' },
  { icon: <Wallet size={18} />, label: 'Despesas', href: '/expenses' },
  { icon: <BarChart2 size={18} />, label: 'Relatórios', href: '/reports' },
  { icon: <User size={18} />, label: 'Perfil', href: '/profile' },
  { icon: <HelpCircle size={18} />, label: 'Ajuda', href: '/help' },
  { icon: <Settings size={18} />, label: 'Configurações', href: '/settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#101010] text-white flex flex-col py-6 px-4 border-r border-gray-800">
      <div className="text-xl font-bold text-yellow-500 mb-10">Cash Flow</div>
      <nav className="space-y-2 flex-1">
        {items.map(({ icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition"
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-gray-800 pt-4 text-sm text-gray-400">
        <p>© 2025 Cash Flow</p>
      </div>
    </aside>
  );
}
