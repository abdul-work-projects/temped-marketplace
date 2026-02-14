'use client';

import { useAdminStats } from '@/lib/hooks/useAdmin';
import { Users, GraduationCap, School, MessageSquare, Loader2, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Teachers', value: stats.totalTeachers, icon: GraduationCap, href: '/admin/teachers' },
    { label: 'Total Schools', value: stats.totalSchools, icon: School, href: '/admin/schools' },
    { label: 'Pending Testimonials', value: stats.pendingTestimonials, icon: MessageSquare, href: '/admin/testimonials' },
    { label: 'Pending Documents', value: stats.pendingDocuments, icon: FileCheck, href: '/admin/verify' },
  ];

  return (
    <div className="min-h-screen">
      <div className="py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of the TempEd platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="h-1.5 bg-primary/70" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                        <Icon size={18} className="text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{card.value}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
