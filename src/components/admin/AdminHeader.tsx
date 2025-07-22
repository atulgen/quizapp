// src/components/admin/AdminHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function AdminHeader({ 
  onToggleSidebar, 
  sidebarOpen 
}: AdminHeaderProps) {
  return (
    <header className="bg-indigo-600 text-white shadow-md md:hidden">
      <div className="flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar}
          className="text-white hover:bg-indigo-500"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
        
        <h1 className="text-xl font-bold">Quiz Admin</h1>
        
        {/* Spacer for balance */}
        <div className="w-10"></div>
      </div>
    </header>
  );
}