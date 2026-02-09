'use client';

import Link from 'next/link';
import { useUnverifiedTeachers } from '@/lib/hooks/useAdmin';
import { getPendingCount } from '@/lib/utils/verification';
import { Loader2, ShieldCheck, Eye, FileText } from 'lucide-react';

export default function AdminVerifyTeachers() {
  const { teachers, loading } = useUnverifiedTeachers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Verify Teachers</h1>
            <p className="text-gray-600">Review and verify teacher profiles and documents</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">There are no unverified teachers at the moment.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Profile</div>
                <div className="col-span-1">Documents</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {teachers.map((teacher) => {
                const pendingDocs = getPendingCount(teacher.documents);
                const totalDocs = teacher.documents.length;

                return (
                  <div
                    key={teacher.id}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 px-6 py-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-1">
                      <p className="text-sm font-medium text-[#1c1d1f]">
                        {teacher.firstName} {teacher.surname}
                      </p>
                      <p className="text-xs text-gray-500 md:hidden">{teacher.email}</p>
                    </div>
                    <div className="col-span-1 hidden md:block">
                      <p className="text-sm text-gray-600 truncate">{teacher.email}</p>
                    </div>
                    <div className="col-span-1">
                      {pendingDocs > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                          {pendingDocs} pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Incomplete
                        </span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2563eb] rounded-full"
                            style={{ width: `${teacher.profileCompleteness}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{teacher.profileCompleteness}%</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{totalDocs} uploaded</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Link
                        href={`/admin/verify/${teacher.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
