'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAdminTestimonials, type TestimonialProfileInfo } from '@/lib/hooks/useAdmin';
import { Loader2, Check, X, MessageSquare, MapPin, GraduationCap, BookOpen, Building2, User } from 'lucide-react';

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ProfileHoverLink({ profile }: { profile: TestimonialProfileInfo }) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(true), 300);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(false), 200);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {profile.profileUrl ? (
        <Link href={profile.profileUrl} className="text-[#2563eb] hover:underline font-medium">
          {profile.name}
        </Link>
      ) : (
        <span>{profile.name}</span>
      )}

      {show && (
        <div
          className="absolute left-0 top-full mt-2 z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              {profile.type === 'teacher' ? (
                <User size={18} className="text-gray-400" />
              ) : (
                <Building2 size={18} className="text-gray-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1c1d1f] text-sm truncate">{profile.name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.type}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            {profile.email && (
              <p className="truncate">{profile.email}</p>
            )}

            {profile.address && (
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{profile.address}</span>
              </div>
            )}

            {profile.educationPhases && profile.educationPhases.length > 0 && (
              <div className="flex items-start gap-1.5">
                <GraduationCap size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {profile.educationPhases.map(p => (
                    <span key={p} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.subjects && profile.subjects.length > 0 && (
              <div className="flex items-start gap-1.5">
                <BookOpen size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {profile.subjects.map(s => (
                    <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.schoolType && (
              <div className="flex items-center gap-1.5">
                <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                <span>{profile.schoolType}</span>
              </div>
            )}

            {profile.curriculum && (
              <div className="flex items-center gap-1.5">
                <BookOpen size={12} className="text-gray-400 flex-shrink-0" />
                <span>{profile.curriculum}</span>
              </div>
            )}
          </div>

          {profile.profileUrl && (
            <Link
              href={profile.profileUrl}
              className="mt-3 block text-center text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] border-t border-gray-100 pt-2"
            >
              View Full Profile
            </Link>
          )}
        </div>
      )}
    </span>
  );
}

export default function AdminTestimonials() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { testimonials, loading, updateTestimonialStatus } = useAdminTestimonials(statusFilter);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await updateTestimonialStatus(id, status);
    setUpdatingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Testimonials</h1>
            <p className="text-gray-600">Review and manage user testimonials</p>
          </div>

          {/* Tab Filter */}
          <div className="flex gap-1 mb-6 bg-white border border-gray-200 p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-[#2563eb] text-white'
                    : 'text-[#1c1d1f] hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Testimonials List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all'
                  ? 'There are no testimonials yet.'
                  : `No ${statusFilter} testimonials found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={testimonial.status} />
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium text-[#1c1d1f]">From:</span>{' '}
                        <ProfileHoverLink profile={testimonial.fromProfile} />
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="font-medium text-[#1c1d1f]">To:</span>{' '}
                        <ProfileHoverLink profile={testimonial.toProfile} />
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(testimonial.createdAt).toLocaleDateString('en-ZA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        <span className="mx-2 text-gray-300">|</span>
                        Type: {testimonial.fromType}
                      </div>
                    </div>
                  </div>

                  <p className="text-[#1c1d1f] text-sm mb-4 leading-relaxed">
                    &ldquo;{testimonial.comment}&rdquo;
                  </p>

                  {testimonial.status === 'pending' && (
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleUpdateStatus(testimonial.id, 'approved')}
                        disabled={updatingId === testimonial.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                      >
                        {updatingId === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(testimonial.id, 'rejected')}
                        disabled={updatingId === testimonial.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {updatingId === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
