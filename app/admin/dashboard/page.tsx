'use client';

import { useAdminStats } from '@/lib/hooks/useAdmin';
import { Users, GraduationCap, School, MessageSquare, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Teachers',
      value: stats.totalTeachers,
      icon: <GraduationCap className="w-8 h-8 text-[#2563eb]" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Schools',
      value: stats.totalSchools,
      icon: <School className="w-8 h-8 text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pending Testimonials',
      value: stats.pendingTestimonials,
      icon: <MessageSquare className="w-8 h-8 text-amber-600" />,
      bg: 'bg-amber-50',
    },
    {
      label: 'Pending Documents',
      value: stats.pendingDocuments,
      icon: <Users className="w-8 h-8 text-red-600" />,
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of the TempEd platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div
                key={card.label}
                className="bg-white border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 ${card.bg} flex items-center justify-center rounded-lg`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#1c1d1f] mb-1">{card.value}</p>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
