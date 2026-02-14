"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { schoolSidebarLinks } from "@/components/shared/Sidebar";
import ContactModal from "@/components/shared/ContactModal";
import TestimonialModal from "@/components/shared/TestimonialModal";
import { useAuth } from "@/lib/context/AuthContext";
import { useJobDetail } from "@/lib/hooks/useJobs";
import {
  useJobApplicants,
  useUpdateJob,
  useSchoolProfile,
} from "@/lib/hooks/useSchool";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import {
  useCreateTestimonial,
  useMyTestimonials,
} from "@/lib/hooks/useTestimonials";
import {
  Star,
  MapPin,
  GraduationCap,
  Briefcase,
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2,
  MessageSquare,
  Pencil,
  Trash2,
  Clock,
  Check,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function TeacherAvatar({
  profilePicture,
  firstName,
  surname,
}: {
  profilePicture?: string;
  firstName: string;
  surname: string;
}) {
  const url = useSignedUrl("profile-pictures", profilePicture);
  return (
    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
      {url ? (
        <img
          src={url}
          alt={`${firstName} ${surname}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-3xl text-muted-foreground">
          {firstName[0]}
          {surname[0]}
        </span>
      )}
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-yellow-200 bg-yellow-100 text-yellow-700"
        >
          <Clock size={12} />
          Pending Review
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="outline"
          className="border-green-200 bg-green-100 text-green-700"
        >
          <Check size={12} />
          Live
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="border-red-200 bg-red-100 text-red-700"
        >
          <XCircle size={12} />
          Rejected
        </Badge>
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
  const {
    applicants,
    loading: applicantsLoading,
    refetch,
  } = useJobApplicants(jobId);
  const { updateJob } = useUpdateJob();
  const {
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    submitting: reviewSubmitting,
  } = useCreateTestimonial();
  const { testimonials: myReviews, refetch: refetchMyReviews } =
    useMyTestimonials(user?.id);
  const [contactTeacher, setContactTeacher] = useState<{
    name: string;
    email: string;
    phone?: string;
  } | null>(null);
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);
  const [hireConfirm, setHireConfirm] = useState<{
    applicationId: string;
    teacherName: string;
  } | null>(null);
  const [hiring, setHiring] = useState(false);
  const [expandedCoverLetters, setExpandedCoverLetters] = useState<Set<string>>(new Set());
  const [reviewTarget, setReviewTarget] = useState<{
    teacherUserId: string;
    teacherName: string;
    existingId?: string;
    existingComment?: string;
  } | null>(null);

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
        fromType: "school",
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
      return (
        new Date(b.application.appliedAt).getTime() -
        new Date(a.application.appliedAt).getTime()
      );
    }
    return a.application.shortlisted ? -1 : 1;
  });

  const displayedApplicants = showShortlistedOnly
    ? sortedApplicants.filter((a) => a.application.shortlisted)
    : sortedApplicants;

  const handleToggleShortlist = async (
    applicationId: string,
    currentStatus: boolean
  ) => {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase
      .from("applications")
      .update({ shortlisted: !currentStatus })
      .eq("id", applicationId);
    refetch();
  };

  const confirmHire = async () => {
    if (!hireConfirm) return;
    setHiring(true);
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase
      .from("applications")
      .update({ status: "Hired" })
      .eq("id", hireConfirm.applicationId);
    await updateJob(job!.id, { progress: "Hired" });
    setHireConfirm(null);
    setHiring(false);
    refetch();
    refetchJob();
  };

  const handleUnhire = async (applicationId: string) => {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    // Reset application status back to Applied
    await supabase
      .from("applications")
      .update({ status: "Applied" })
      .eq("id", applicationId);
    // Revert job progress to Interviewing
    await updateJob(job!.id, { progress: "Interviewing" });
    refetch();
    refetchJob();
  };

  // Get all subjects as flat array from the Record<string, string[]> structure
  const getSubjectsFlat = (subjects: Record<string, string[]>): string[] => {
    return [...new Set(Object.values(subjects).flat())];
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarLinks={schoolSidebarLinks}
        requiredUserType="school"
      >
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout
        sidebarLinks={schoolSidebarLinks}
        requiredUserType="school"
      >
        <div className="p-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-muted-foreground">Job not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarLinks={schoolSidebarLinks}
      requiredUserType="school"
    >
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/school/dashboard"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/90 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Job Postings
          </Link>

          <div className="border border-border rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{job.subject}</span>
                  <span>-</span>
                  <span>{job.educationPhase}</span>
                  <span>-</span>
                  <span>
                    {format(new Date(job.startDate), "MMM d")}
                    {job.endDate
                      ? ` - ${format(new Date(job.endDate), "MMM d, yyyy")}`
                      : " - Ongoing"}
                  </span>
                </div>
              </div>
              <select
                value={job.progress}
                onChange={async (e) => {
                  const { success } = await updateJob(job.id, {
                    progress: e.target.value,
                  });
                  if (success) refetchJob();
                }}
                className={`px-3 py-1.5 text-sm font-bold border rounded-md cursor-pointer focus:outline-none ${
                  job.progress === "Open"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : job.progress === "Interviewing"
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : job.progress === "Hired"
                    ? "bg-purple-100 text-purple-700 border-purple-200"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <option value="Open">Open</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Closed">Closed</option>
                {applicants.some((a) => a.application.status === "Hired") && (
                  <option value="Hired">Hired</option>
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Applicants ({applicants.length})
              </h2>
              <p className="text-muted-foreground">
                Review applications and shortlist candidates for interview
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowShortlistedOnly(!showShortlistedOnly)}
              className={`w-fit shrink-0 ${
                showShortlistedOnly
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-700"
                  : ""
              }`}
            >
              <Star
                size={16}
                fill={showShortlistedOnly ? "currentColor" : "none"}
              />
              {showShortlistedOnly ? "Show All" : "Shortlisted Only"}
            </Button>
          </div>

          {displayedApplicants.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {showShortlistedOnly
                    ? "No shortlisted applicants"
                    : "No applicants yet"}
                </h3>
                <p className="text-muted-foreground">
                  {showShortlistedOnly
                    ? "Shortlist candidates to see them here."
                    : "Teachers will see your job posting and can apply. Check back soon!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {displayedApplicants.map(({ application, teacher }) => {
                const allSubjects = getSubjectsFlat(teacher.subjects);
                const existingReview = myReviews.find(
                  (r) => r.toUserId === teacher.userId
                );

                return (
                  <div
                    key={application.id}
                    className={`p-6 transition-all ${
                      application.status === "Hired"
                        ? "bg-green-50"
                        : application.shortlisted
                        ? "bg-yellow-50"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Profile Picture */}
                      <div className="shrink-0">
                        <TeacherAvatar
                          profilePicture={teacher.profilePicture}
                          firstName={teacher.firstName}
                          surname={teacher.surname}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {teacher.firstName} {teacher.surname}
                              {application.status === "Hired" && (
                                <Badge className="ml-2 bg-green-100 text-green-700 align-middle">
                                  <CheckCircle size={12} />
                                  Hired
                                </Badge>
                              )}
                            </h3>
                            {teacher.address && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin size={14} />
                                <span>{teacher.address}</span>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            onClick={() =>
                              handleToggleShortlist(
                                application.id,
                                application.shortlisted
                              )
                            }
                            className={
                              application.shortlisted
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-700 border-yellow-200"
                                : ""
                            }
                          >
                            <Star
                              size={18}
                              fill={
                                application.shortlisted
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                            {application.shortlisted
                              ? "Shortlisted"
                              : "Shortlist"}
                          </Button>
                        </div>

                        {teacher.description && (
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {teacher.description}
                          </p>
                        )}

                        {application.coverLetter && (
                          <div className="border border-border rounded-lg p-3 bg-muted/30 mb-4">
                            <button
                              onClick={() => {
                                setExpandedCoverLetters((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(application.id)) {
                                    next.delete(application.id);
                                  } else {
                                    next.add(application.id);
                                  }
                                  return next;
                                });
                              }}
                              className="flex items-center gap-2 text-sm font-medium text-foreground w-full"
                            >
                              <FileText size={14} className="text-muted-foreground" />
                              Cover Letter
                              {expandedCoverLetters.has(application.id) ? (
                                <ChevronUp size={14} className="ml-auto text-muted-foreground" />
                              ) : (
                                <ChevronDown size={14} className="ml-auto text-muted-foreground" />
                              )}
                            </button>
                            <p
                              className={`text-sm text-muted-foreground mt-2 whitespace-pre-wrap ${
                                expandedCoverLetters.has(application.id)
                                  ? ""
                                  : "line-clamp-3"
                              }`}
                            >
                              {application.coverLetter}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <GraduationCap size={16} />
                              <span className="font-medium">
                                Education Phase:
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {teacher.educationPhases.map((phase) => (
                                <Badge key={phase} variant="outline">
                                  {phase}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Briefcase size={16} />
                              <span className="font-medium">Subjects:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {allSubjects.slice(0, 3).map((subject) => (
                                <Badge key={subject} variant="outline">
                                  {subject}
                                </Badge>
                              ))}
                              {allSubjects.length > 3 && (
                                <Badge variant="outline">
                                  +{allSubjects.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span>
                            Applied:{" "}
                            {format(
                              new Date(application.appliedAt),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </div>

                        {/* Existing Review */}
                        {application.status === "Hired" && existingReview && (
                          <div className="border border-border rounded-lg p-4 bg-muted/50 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <MessageSquare
                                  size={14}
                                  className="text-muted-foreground"
                                />
                                <span className="text-sm font-bold text-foreground">
                                  Your Review
                                </span>
                                <ReviewStatusBadge
                                  status={existingReview.status}
                                />
                              </div>
                              {existingReview.status !== "approved" && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setReviewTarget({
                                        teacherUserId: teacher.userId,
                                        teacherName: `${teacher.firstName} ${teacher.surname}`,
                                        existingId: existingReview.id,
                                        existingComment: existingReview.comment,
                                      })
                                    }
                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded"
                                    title="Edit review"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(existingReview.id)
                                    }
                                    disabled={reviewSubmitting}
                                    className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                    title="Delete review"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {existingReview.comment}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {application.status === "Hired" ? (
                            <>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleUnhire(application.id)}
                              >
                                Unhire
                              </Button>
                              {!existingReview && (
                                <Button
                                  variant="outline"
                                  className="border-primary text-primary hover:bg-primary/5 hover:text-primary"
                                  onClick={() =>
                                    setReviewTarget({
                                      teacherUserId: teacher.userId,
                                      teacherName: `${teacher.firstName} ${teacher.surname}`,
                                    })
                                  }
                                >
                                  <MessageSquare size={16} />
                                  Write Review
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                setHireConfirm({
                                  applicationId: application.id,
                                  teacherName: `${teacher.firstName} ${teacher.surname}`,
                                })
                              }
                            >
                              <CheckCircle size={16} />
                              Hire
                            </Button>
                          )}

                          <Button
                            onClick={() =>
                              setContactTeacher({
                                name: `${teacher.firstName} ${teacher.surname}`,
                                email: teacher.email,
                                phone: teacher.phoneNumber,
                              })
                            }
                          >
                            <Mail size={16} />
                            Contact
                          </Button>

                          <Button variant="outline" asChild>
                            <Link href={`/school/teachers/${teacher.id}`}>
                              View Full Profile
                            </Link>
                          </Button>
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
          phone={contactTeacher.phone}
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
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => !hiring && setHireConfirm(null)}
          />
          <Card className="relative max-w-md w-full mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Confirm Hire
              </h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to hire{" "}
                <span className="font-bold text-foreground">
                  {hireConfirm.teacherName}
                </span>{" "}
                for this position?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setHireConfirm(null)}
                  disabled={hiring}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmHire}
                  disabled={hiring}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {hiring ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {hiring ? "Hiring..." : "Confirm Hire"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
