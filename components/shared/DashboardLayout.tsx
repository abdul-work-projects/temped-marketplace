'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarLinks: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
  }>;
  requiredUserType: 'teacher' | 'school';
}

export default function DashboardLayout({
  children,
  sidebarLinks,
  requiredUserType
}: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.type !== requiredUserType) {
        // Redirect to correct dashboard if user type doesn't match
        router.push(user.type === 'teacher' ? '/teacher/dashboard' : '/school/dashboard');
      }
    }
  }, [user, isLoading, requiredUserType, router]);

  if (isLoading || !user || user.type !== requiredUserType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={sidebarLinks} userEmail={user.email} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
