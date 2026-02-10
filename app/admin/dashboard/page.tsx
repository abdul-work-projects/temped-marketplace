'use client';

import { useAdminStats } from '@/lib/hooks/useAdmin';
import { Users, GraduationCap, School, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    {
      label: 'Total Teachers',
      value: stats.totalTeachers,
      icon: <GraduationCap size={18} className="text-muted-foreground" />,
    },
    {
      label: 'Total Schools',
      value: stats.totalSchools,
      icon: <School size={18} className="text-muted-foreground" />,
    },
    {
      label: 'Pending Testimonials',
      value: stats.pendingTestimonials,
      icon: <MessageSquare size={18} className="text-muted-foreground" />,
    },
    {
      label: 'Pending Documents',
      value: stats.pendingDocuments,
      icon: <Users size={18} className="text-muted-foreground" />,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of the TempEd platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <Card key={card.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                    {card.icon}
                    <p className="text-sm font-medium">{card.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
