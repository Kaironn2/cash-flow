import './globals.css'
import { AuthProvider } from '@/context/AuthContext';

export const metadata = { title: 'Cash Flow', description: 'Controle de despesas' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className="dark">
      <body className="bg-[#121212] text-gray-300 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
