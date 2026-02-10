'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Briefcase, Menu } from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarLinks: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
  }>;
  requiredUserType: 'teacher' | 'school' | 'admin';
}

export default function DashboardLayout({
  children,
  sidebarLinks,
  requiredUserType
}: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.type !== requiredUserType) {
        // Redirect to correct dashboard if user type doesn't match
        if (user.type === 'teacher') router.push('/teacher/dashboard');
        else if (user.type === 'school') router.push('/school/dashboard');
        else if (user.type === 'admin') router.push('/admin/dashboard');
      }
    }
  }, [user, isLoading, requiredUserType, router]);

  if (isLoading || !user || user.type !== requiredUserType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        links={sidebarLinks}
        userEmail={user.email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 md:hidden bg-card border-b border-border px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">TempEd</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-foreground hover:bg-muted transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
