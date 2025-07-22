// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  user?: {
    username: string;
    role: string;
  };
  onLogout: () => void;
  isMobile?: boolean;
  onNavItemClick?: () => void;
}

export default function AdminSidebar({ 
  user, 
  onLogout, 
  isMobile = false, 
  onNavItemClick 
}: AdminSidebarProps) {
  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      href: '/admin/quizzes',
      label: 'Quizzes',
      icon: FileText
    },
    {
      href: '/admin/students',
      label: 'Students',
      icon: Users
    }
  ];

  return (
    <div className={`flex flex-col h-full bg-indigo-700 text-white ${isMobile ? 'fixed inset-y-0 z-20 w-64' : 'w-64'}`}>
      <div className="p-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Quiz Admin</h2>
          
          {user && (
            <div className="space-y-1">
              <p className="text-indigo-100 text-sm">Welcome back,</p>
              <p className="font-medium">{user.username}</p>
              <p className="text-indigo-200 text-xs uppercase">{user.role}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavItemClick}
              className="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-600 rounded-lg transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
              
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full text-indigo-100 hover:bg-indigo-600 hover:text-white justify-start"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}