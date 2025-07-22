// src/components/layouts/AdminLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '../admin/AdminHeader';
import AdminSidebar from '../admin/AdminSidebar';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-indigo-600">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar - fixed position */}
      <div className="hidden md:flex md:flex-shrink-0">
        <AdminSidebar 
          user={user ? { username: user.username, role: user.role } : undefined} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Mobile Sidebar - absolute position */}
      <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <AdminSidebar 
          user={user ? { username: user.username, role: user.role } : undefined} 
          onLogout={handleLogout} 
          isMobile={true} 
          onNavItemClick={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <AdminHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen} 
        />
        
        {/* Content area */}
        <div className="flex-1 overflow-auto  bg-white md:bg-gray-100">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black opacity-50 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}