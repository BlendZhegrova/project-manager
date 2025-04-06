// components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push('/login');
        router.refresh(); // Clear client-side cache
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">
          TaskFlow
        </Link>
        <div className="flex gap-4 items-center">
          <Link 
            href="/dashboard" 
            className={`hover:text-gray-300 ${pathname === '/dashboard' ? 'text-blue-300' : ''}`}
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="hover:text-gray-300 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}