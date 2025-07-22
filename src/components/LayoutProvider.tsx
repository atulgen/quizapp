'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';


export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin routes
  if (pathname.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Login page - no layout wrapper
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Default student layout
  return <StudentLayout>{children}</StudentLayout>;
}