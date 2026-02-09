'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import ContactModal from '@/components/shared/ContactModal';
import TestimonialModal from '@/components/shared/TestimonialModal';
import { useAuth } from '@/lib/context/AuthContext';
import { useJobDetail } from '@/lib/hooks/useJobs';
import { useJobApplicants, useUpdateJob, useSchoolProfile } from '@/lib/hooks/useSchool';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { useCreateTestimonial, useMyTestimonials } from '@/lib/hooks/useTestimonials';
import { Star, MapPin, GraduationCap, Briefcase, Mail, ArrowLeft, CheckCircle, Loader2, MessageSquare, Pencil, Trash2, Clock, Check, XCircle } from 'lucide-react';
import { format } from 'date-fns';

function TeacherAvatar({ profilePicture, firstName, surname }: { profilePicture?: string; firstName: string; surname: string }) {
  const url = useSignedUrl('profile-pictures', profilePicture);
  return (
    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
      {url ? (
        <img src={url} alt={`${firstName} ${surname}`} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl text-gray-400">{firstName[0]}{surname[0]}</span>
      )}
    </div>
  );
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

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user } = useAuth();
  const { school } = useSchoolProfile(user?.id);
  const { job, loading: jobLoading, refetch: refetchJob } = useJobDetail(jobId);
  const { applicants, loading: applicantsLoading, refetch } = useJobApplicants(jobId);
  const { updateJob } = useUpdateJob();
  const { createTestimonial, updateTestimonial, deleteTestimonial, submitting: reviewSubmitting } = useCreateTestimonial();
  const { testimonials: myReviews, refetch: refetchMyReviews } = useMyTestimonials(user?.id);
  const [contactTeacher, setContactTeacher] = useState<{ name: string; email: string } | null>(null);
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);
  const [hireConfirm, setHireConfirm] = useState<{ applicationId: string; teacherName: string } | null>(null);
  const [hiring, setHiring] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ teacherUserId: string; teacherName: string; existingId?: string; existingComment?: string } | null>(null);

  const handleSubmitReview = async (comment: string) => {
    if (!school || !reviewTarget) return;

    let success: boolean;
    if (reviewTarget.existingId) {
      const result = await updateTestimonial(reviewTarget.existingId, comment);
      success = result.success;
    } else {
      const result = await createTestimonial({
        fromUserId: school.userId,
        toUserId: reviewTarget.teacherUserId,
        fromType: 'school',
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

  const loading = jobLoading || applicantsLoading;

  // Sort applications: shortlisted first, then by application date
  const sortedApplicants = [...applicants].sort((a, b) => {
    if (a.application.shortlisted === b.application.shortlisted) {
      return new Date(b.application.appliedAt).getTime() - new Date(a.application.appliedAt).getTime();
    }
    return a.application.shortlisted ? -1 : 1;
  });

  const displayedApplicants = showShortlistedOnly
    ? sortedApplicants.filter(a => a.application.shortlisted)
    : sortedApplicants;

  const handleToggleShortlist = async (applicationId: string, currentStatus: boolean) => {
    const supabase = (await import('@/lib/supabase/client')).createClient();
    await supabase.from('applications').update({ shortlisted: !currentStatus }).eq('id', applicationId);
    refetch();
  };

  const confirmHire = async () => {
    if (!hireConfirm) return;
    setHiring(true);
    const supabase = (await import('@/lib/supabase/client')).createClient();
    await supabase.from('applications').update({ status: 'Hired' }).eq('id', hireConfirm.applicationId);
    await updateJob(job!.id, { progress: 'Hired' });
    setHireConfirm(null);
    setHiring(false);
    refetch();
    refetchJob();
  };

  const handleUnhire = async (applicationId: string) => {
    const supabase = (await import('@/lib/supabase/client')).createClient();
    // Reset application status back to Applied
    await supabase.from('applications').update({ status: 'Applied' }).eq('id', applicationId);
    // Revert job progress to Interviewing
    await updateJob(job!.id, { progress: 'Interviewing' });
    refetch();
    refetchJob();
  };

  // Get all subjects as flat array from the Record<string, string[]> structure
  const getSubjectsFlat = (subjects: Record<string, string[]>): string[] => {
    return [...new Set(Object.values(subjects).flat())];
  };

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-600">Job not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/school/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Job Postings
          </Link>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>{job.subject}</span>
                  <span>•</span>
                  <span>{job.educationPhase}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(job.startDate), 'MMM d')} - {format(new Date(job.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <select
                value={job.progress}
                onChange={async (e) => {
                  const { success } = await updateJob(job.id, { progress: e.target.value });
                  if (success) refetchJob();
                }}
                className={`px-3 py-1.5 text-sm font-bold border cursor-pointer focus:outline-none ${
                  job.progress === 'Open' ? 'bg-green-100 text-green-700 border-green-200' :
                  job.progress === 'Interviewing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  job.progress === 'Hired' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <option value="Open">Open</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Closed">Closed</option>
                {applicants.some(a => a.application.status === 'Hired') && <option value="Hired">Hired</option>}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Applicants ({applicants.length})
              </h2>
              <p className="text-gray-600">
                Review applications and shortlist candidates for interview
              </p>
            </div>
            <button
              onClick={() => setShowShortlistedOnly(!showShortlistedOnly)}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                showShortlistedOnly
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star size={16} className="inline mr-1" fill={showShortlistedOnly ? 'currentColor' : 'none'} />
              {showShortlistedOnly ? 'Show All' : 'Shortlisted Only'}
            </button>
          </div>

          {displayedApplicants.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showShortlistedOnly ? 'No shortlisted applicants' : 'No applicants yet'}
              </h3>
              <p className="text-gray-600">
                {showShortlistedOnly
                  ? 'Shortlist candidates to see them here.'
                  : 'Teachers will see your job posting and can apply. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedApplicants.map(({ application, teacher }) => {
                const allSubjects = getSubjectsFlat(teacher.subjects);
                const existingReview = myReviews.find(r => r.toUserId === teacher.userId);

                return (
                  <div
                    key={application.id}
                    className={`bg-white rounded-lg border-2 p-6 transition-all ${
                      application.status === 'Hired'
                        ? 'border-green-300 bg-green-50'
                        : application.shortlisted
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-6">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        <TeacherAvatar profilePicture={teacher.profilePicture} firstName={teacher.firstName} surname={teacher.surname} />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {teacher.firstName} {teacher.surname}
                              {application.status === 'Hired' && (
                                <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full align-middle">
                                  <CheckCircle size={12} />
                                  Hired
                                </span>
                              )}
                            </h3>
                            {teacher.address && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin size={14} />
                                <span>{teacher.address}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleShortlist(application.id, application.shortlisted)}
                            className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors ${
                              application.shortlisted
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Star size={18} fill={application.shortlisted ? 'currentColor' : 'none'} />
                            {application.shortlisted ? 'Shortlisted' : 'Shortlist'}
                          </button>
                        </div>

                        {teacher.description && (
                          <p className="text-gray-700 mb-4 line-clamp-2">{teacher.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <GraduationCap size={16} />
                              <span className="font-medium">Education Phase:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {teacher.educationPhases.map(phase => (
                                <span
                                  key={phase}
                                  className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
                                >
                                  {phase}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Briefcase size={16} />
                              <span className="font-medium">Subjects:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {allSubjects.slice(0, 3).map(subject => (
                                <span
                                  key={subject}
                                  className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
                                >
                                  {subject}
                                </span>
                              ))}
                              {allSubjects.length > 3 && (
                                <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                                  +{allSubjects.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span>Applied: {format(new Date(application.appliedAt), 'MMM d, yyyy')}</span>
                        </div>

                        {/* Existing Review */}
                        {application.status === 'Hired' && existingReview && (
                          <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <MessageSquare size={14} className="text-gray-500" />
                                <span className="text-sm font-bold text-[#1c1d1f]">Your Review</span>
                                <ReviewStatusBadge status={existingReview.status} />
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setReviewTarget({ teacherUserId: teacher.userId, teacherName: `${teacher.firstName} ${teacher.surname}`, existingId: existingReview.id, existingComment: existingReview.comment })}
                                  className="p-1.5 text-gray-500 hover:text-[#2563eb] hover:bg-blue-50 rounded"
                                  title="Edit review"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(existingReview.id)}
                                  disabled={reviewSubmitting}
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

                        <div className="flex gap-3">
                          {application.status === 'Hired' ? (
                            <>
                              <button
                                onClick={() => handleUnhire(application.id)}
                                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 font-bold hover:bg-red-50"
                              >
                                Unhire
                              </button>
                              {!existingReview && (
                                <button
                                  onClick={() => setReviewTarget({ teacherUserId: teacher.userId, teacherName: `${teacher.firstName} ${teacher.surname}` })}
                                  className="flex items-center gap-2 px-4 py-2 border border-[#2563eb] text-[#2563eb] font-bold hover:bg-blue-50"
                                >
                                  <MessageSquare size={16} />
                                  Write Review
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => setHireConfirm({ applicationId: application.id, teacherName: `${teacher.firstName} ${teacher.surname}` })}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold hover:bg-green-700"
                            >
                              <CheckCircle size={16} />
                              Hire
                            </button>
                          )}

                          <button
                            onClick={() => setContactTeacher({ name: `${teacher.firstName} ${teacher.surname}`, email: teacher.email })}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8]"
                          >
                            <Mail size={16} />
                            Contact
                          </button>

                          <Link
                            href={`/school/teachers/${teacher.id}`}
                            className="px-4 py-2 border border-gray-300 text-[#1c1d1f] font-bold hover:bg-gray-50"
                          >
                            View Full Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {contactTeacher && (
        <ContactModal
          isOpen={!!contactTeacher}
          onClose={() => setContactTeacher(null)}
          name={contactTeacher.name}
          email={contactTeacher.email}
        />
      )}

      {reviewTarget && (
        <TestimonialModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleSubmitReview}
          recipientName={reviewTarget.teacherName}
          submitting={reviewSubmitting}
          initialComment={reviewTarget.existingComment}
        />
      )}

      {hireConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => !hiring && setHireConfirm(null)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-[#1c1d1f] mb-2">Confirm Hire</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to hire <span className="font-bold text-[#1c1d1f]">{hireConfirm.teacherName}</span> for this position?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setHireConfirm(null)}
                disabled={hiring}
                className="px-4 py-2 border border-gray-300 text-[#1c1d1f] font-bold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmHire}
                disabled={hiring}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {hiring ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {hiring ? 'Hiring...' : 'Confirm Hire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
