// src/components/LayoutProvider.tsx
import { headers } from 'next/headers';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';

export default async function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get pathname from headers during server rendering
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Admin routes
  if (pathname.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Login page - no layout wrapper
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Default student layout for all other routes
  return <StudentLayout>{children}</StudentLayout>;
}