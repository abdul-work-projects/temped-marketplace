'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAdminSearchTeachers } from '@/lib/hooks/useAdmin';
import { isTeacherVerified } from '@/lib/utils/verification';
import { Loader2, Search, Eye, GraduationCap, ShieldCheck, X as XIcon } from 'lucide-react';

export default function AdminTeachers() {
  const { teachers, loading, searchTeachers } = useAdminSearchTeachers();
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchTeachers(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Teachers</h1>
            <p className="text-gray-600">Search and manage teacher accounts</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Teachers Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600">
                {query ? 'No teachers match your search query.' : 'No teachers registered yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-5 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">Verified</div>
                <div className="col-span-1">Profile Completeness</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-1">
                    <p className="text-sm font-medium text-[#1c1d1f]">
                      {teacher.firstName} {teacher.surname}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-600 truncate">{teacher.email}</p>
                  </div>
                  <div className="col-span-1">
                    {isTeacherVerified(teacher.documents) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        Unverified
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563eb] rounded-full"
                          style={{ width: `${teacher.profileCompleteness}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{teacher.profileCompleteness}%</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Link
                      href={`/admin/teachers/${teacher.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
