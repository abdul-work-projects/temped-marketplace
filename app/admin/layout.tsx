'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { adminSidebarLinks } from '@/components/shared/Sidebar';
import { useAdminPendingCounts } from '@/lib/hooks/useAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pendingTeachers, pendingSchools } = useAdminPendingCounts();

  const links = useMemo(() =>
    adminSidebarLinks.map(link => {
      if (link.href === '/admin/verify') return { ...link, badge: pendingTeachers };
      if (link.href === '/admin/verify-schools') return { ...link, badge: pendingSchools };
      return link;
    }),
    [pendingTeachers, pendingSchools]
  );

  return (
    <DashboardLayout sidebarLinks={links} requiredUserType="admin">
      {children}
    </DashboardLayout>
  );
}
