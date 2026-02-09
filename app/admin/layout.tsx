'use client';

import DashboardLayout from '@/components/shared/DashboardLayout';
import { adminSidebarLinks } from '@/components/shared/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout sidebarLinks={adminSidebarLinks} requiredUserType="admin">
      {children}
    </DashboardLayout>
  );
}
