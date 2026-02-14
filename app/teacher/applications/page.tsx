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
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import { Briefcase, MapPin, Star, CheckCircle, Loader2, MessageSquare, Pencil, Trash2, Clock, Check, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      return 'bg-muted text-muted-foreground';
    case 'Applied':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getJobTypeBadgeColor(jobType: string) {
  switch (jobType) {
    case 'Permanent':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Temporary':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Invigilator':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Coach':
      return 'bg-teal-100 text-teal-700 border-teal-200';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

function ReviewStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          <Clock size={12} />
          Pending Review
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <Check size={12} />
          Live
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          <XCircle size={12} />
          Rejected
        </Badge>
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
      <div className="py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">My Applications</h1>
            <p className="text-muted-foreground text-sm">
              Track your job applications and their status
            </p>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{loading ? '...' : applications.length}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Star size={12} className="text-yellow-500" />Shortlisted</p>
                <p className="text-2xl font-bold text-foreground">{loading ? '...' : shortlistedCount}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1"><CheckCircle size={12} className="text-green-500" />Hired</p>
                <p className="text-2xl font-bold text-foreground">{loading ? '...' : applications.filter((a) => a.status === 'Hired').length}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No applications yet</h3>
                <p className="text-muted-foreground">
                  Start applying to jobs to see them here
                </p>
                <Button asChild className="mt-4">
                  <Link href="/teacher/dashboard">
                    Browse Jobs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {applications.map((application) => {
                const job = application.job;
                const school = application.school;

                if (!job || !school) return null;

                const displayStatus = getDisplayStatus(application.status, job.progress);
                const existingReview = myReviews.find(r => r.toUserId === school.userId);

                return (
                  <div
                    key={application.id}
                    className="p-6 hover:bg-muted/50 transition-colors"
                  >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Link href={`/teacher/jobs/${job.id}`} className="hover:text-primary">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {job.title}
                            </h3>
                          </Link>
                          <Link
                            href={`/teacher/schools/${school.id}`}
                            className="text-muted-foreground hover:text-primary font-medium text-sm"
                          >
                            {school.name}
                          </Link>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            {school.address && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {school.address}
                              </span>
                            )}
                            {teacher?.location && school.location && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                <MapPin size={12} />
                                {formatDistance(calculateDistance(teacher.location.lat, teacher.location.lng, school.location.lat, school.location.lng))}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {application.shortlisted && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                              <Star size={12} />
                              Shortlisted
                            </Badge>
                          )}
                          <Badge variant="secondary" className={getStatusColor(displayStatus)}>
                            {displayStatus}
                          </Badge>
                        </div>
                      </div>

                      {/* Job Type & Phase */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className={getJobTypeBadgeColor(job.jobType)}>
                          {job.jobType}
                        </Badge>
                        <Badge variant="outline">
                          {job.educationPhase}
                        </Badge>
                        <Badge variant="outline">
                          {job.subject}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
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
                        <div className="mt-4 border border-border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare size={14} className="text-muted-foreground" />
                              <span className="text-sm font-bold text-foreground">Your Review</span>
                              <ReviewStatusBadge status={existingReview.status} />
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setReviewTarget({ schoolUserId: school.userId, schoolName: school.name, existingId: existingReview.id, existingComment: existingReview.comment })}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded"
                                title="Edit review"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(existingReview.id)}
                                disabled={submitting}
                                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                title="Delete review"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">{existingReview.comment}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-3">
                        <Button variant="outline" asChild>
                          <Link href={`/teacher/jobs/${job.id}`}>
                            View Job Details
                          </Link>
                        </Button>
                        {displayStatus === 'Hired' && !existingReview && school && (
                          <Button
                            variant="outline"
                            onClick={() => setReviewTarget({ schoolUserId: school.userId, schoolName: school.name })}
                            className="border-primary text-primary hover:bg-primary/5"
                          >
                            <MessageSquare size={16} />
                            Write Review
                          </Button>
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
