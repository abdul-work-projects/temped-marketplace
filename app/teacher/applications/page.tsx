'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import TestimonialModal from '@/components/shared/TestimonialModal';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeacherProfile, useTeacherApplications } from '@/lib/hooks/useTeacher';
import { useCreateTestimonial, useMyTestimonials } from '@/lib/hooks/useTestimonials';
import { format } from 'date-fns';
import { Briefcase, MapPin, Star, CheckCircle, Loader2, MessageSquare, Pencil, Trash2, Clock, Check, XCircle } from 'lucide-react';

// Derive display status: application.status trumps job.progress for "Hired"
function getDisplayStatus(applicationStatus: string, jobProgress: string): string {
  if (applicationStatus === 'Hired') return 'Hired';
  switch (jobProgress) {
    case 'Open': return 'Applied';
    case 'Interviewing': return 'In Progress';
    case 'Hired': return 'Hired';
    case 'Closed': return 'Closed';
    default: return 'Applied';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Hired':
      return 'bg-green-100 text-green-700';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'Closed':
      return 'bg-gray-100 text-gray-700';
    case 'Applied':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getJobTypeBadgeColor(jobType: string) {
  switch (jobType) {
    case 'Permanent':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Temporary':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Invigilator':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Coach':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function ReviewStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
          <Clock size={12} />
          Pending Review
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">
          <Check size={12} />
          Live
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full">
          <XCircle size={12} />
          Rejected
        </span>
      );
    default:
      return null;
  }
}

export default function TeacherApplicationsPage() {
  const { user } = useAuth();
  const { teacher, loading: teacherLoading } = useTeacherProfile(user?.id);
  const { applications, loading: appsLoading } = useTeacherApplications(teacher?.id);
  const { createTestimonial, updateTestimonial, deleteTestimonial, submitting } = useCreateTestimonial();
  const { testimonials: myReviews, refetch: refetchMyReviews } = useMyTestimonials(user?.id);
  const [reviewTarget, setReviewTarget] = useState<{ schoolUserId: string; schoolName: string; existingId?: string; existingComment?: string } | null>(null);

  const loading = teacherLoading || appsLoading;

  const handleSubmitReview = async (comment: string) => {
    if (!teacher || !reviewTarget) return;

    let success: boolean;
    if (reviewTarget.existingId) {
      const result = await updateTestimonial(reviewTarget.existingId, comment);
      success = result.success;
    } else {
      const result = await createTestimonial({
        fromUserId: teacher.userId,
        toUserId: reviewTarget.schoolUserId,
        fromType: 'teacher',
        comment,
      });
      success = result.success;
    }
    if (success) {
      setReviewTarget(null);
      refetchMyReviews();
    }
  };

  const handleDeleteReview = async (id: string) => {
    const { success } = await deleteTestimonial(id);
    if (success) refetchMyReviews();
  };

  // Count shortlisted
  const shortlistedCount = applications.filter((a) => a.shortlisted).length;

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1c1d1f] mb-1">My Applications</h1>
              <p className="text-gray-600 text-sm">
                Track your job applications and their status
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500">Total</p>
                <p className="text-2xl font-bold text-[#1c1d1f]">{loading ? '...' : applications.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 flex items-center justify-end gap-1"><Star size={12} className="text-yellow-500" />Shortlisted</p>
                <p className="text-2xl font-bold text-[#1c1d1f]">{loading ? '...' : shortlistedCount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 flex items-center justify-end gap-1"><CheckCircle size={12} className="text-green-500" />Hired</p>
                <p className="text-2xl font-bold text-[#1c1d1f]">{loading ? '...' : applications.filter((a) => a.status === 'Hired').length}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">
                Start applying to jobs to see them here
              </p>
              <Link
                href="/teacher/dashboard"
                className="mt-4 inline-block px-4 py-2 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const job = application.job;
                const school = application.school;

                if (!job || !school) return null;

                const displayStatus = getDisplayStatus(application.status, job.progress);
                const existingReview = myReviews.find(r => r.toUserId === school.userId);

                return (
                  <div
                    key={application.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link href={`/teacher/jobs/${job.id}`} className="hover:text-[#2563eb]">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/teacher/schools/${school.id}`}
                          className="text-gray-600 hover:text-[#2563eb] font-medium text-sm"
                        >
                          {school.name}
                        </Link>
                        {school.address && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin size={14} />
                            <span>{school.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {application.shortlisted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                            <Star size={12} />
                            Shortlisted
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}>
                          {displayStatus}
                        </span>
                      </div>
                    </div>

                    {/* Job Type & Phase */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 text-xs font-bold border ${getJobTypeBadgeColor(job.jobType)}`}>
                        {job.jobType}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold text-gray-700 border border-gray-300">
                        {job.educationPhase}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold text-gray-700 border border-gray-300">
                        {job.subject}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Applied:</span>{' '}
                        {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span>{' '}
                        {format(new Date(job.startDate), 'MMM d, yyyy')}
                      </div>
                    </div>

                    {/* Existing Review */}
                    {displayStatus === 'Hired' && existingReview && (
                      <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-gray-500" />
                            <span className="text-sm font-bold text-[#1c1d1f]">Your Review</span>
                            <ReviewStatusBadge status={existingReview.status} />
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setReviewTarget({ schoolUserId: school.userId, schoolName: school.name, existingId: existingReview.id, existingComment: existingReview.comment })}
                              className="p-1.5 text-gray-500 hover:text-[#2563eb] hover:bg-blue-50 rounded"
                              title="Edit review"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(existingReview.id)}
                              disabled={submitting}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                              title="Delete review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">{existingReview.comment}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-3">
                      <Link
                        href={`/teacher/jobs/${job.id}`}
                        className="inline-block px-4 py-2 border border-gray-300 text-[#1c1d1f] font-bold hover:bg-gray-50"
                      >
                        View Job Details
                      </Link>
                      {displayStatus === 'Hired' && !existingReview && school && (
                        <button
                          onClick={() => setReviewTarget({ schoolUserId: school.userId, schoolName: school.name })}
                          className="flex items-center gap-2 px-4 py-2 border border-[#2563eb] text-[#2563eb] font-bold hover:bg-blue-50"
                        >
                          <MessageSquare size={16} />
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {reviewTarget && (
        <TestimonialModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleSubmitReview}
          recipientName={reviewTarget.schoolName}
          submitting={submitting}
          initialComment={reviewTarget.existingComment}
        />
      )}
    </DashboardLayout>
  );
}
