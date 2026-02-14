'use client';

import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeacherProfile, useTeacherDocuments } from '@/lib/hooks/useTeacher';
import { useJobDetail, useCheckApplication, useApplyToJob, useWithdrawApplication } from '@/lib/hooks/useJobs';
import { isTeacherVerified } from '@/lib/utils/verification';
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import { MapPin, Calendar, Clock, ArrowLeft, AlertCircle, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function getJobTypeBadge(jobType: string) {
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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const { user } = useAuth();

  const { teacher, loading: teacherLoading } = useTeacherProfile(user?.id);
  const { documents } = useTeacherDocuments(teacher?.id);
  const { job, school, loading: jobLoading } = useJobDetail(jobId);
  const { applied, loading: checkLoading, refetch: refetchCheck } = useCheckApplication(jobId, teacher?.id);
  const { apply, applying } = useApplyToJob();
  const { withdraw, withdrawing } = useWithdrawApplication();
  const verified = isTeacherVerified(documents);

  const loading = jobLoading || teacherLoading;

  const distance =
    teacher?.location && school?.location
      ? calculateDistance(
          teacher.location.lat,
          teacher.location.lng,
          school.location.lat,
          school.location.lng
        )
      : null;

  const handleApply = async () => {
    if (!teacher) return;
    const result = await apply(jobId, teacher.id);
    if (result.success) {
      refetchCheck();
    }
  };

  const handleWithdraw = async () => {
    if (!teacher) return;
    const result = await withdraw(jobId, teacher.id);
    if (result.success) {
      refetchCheck();
    }
  };

  if (loading || checkLoading) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job || !school) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">Job not found</p>
            <Link href="/teacher/dashboard" className="text-primary hover:text-primary/90 font-bold">
              &larr; Back to Available Jobs
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isUrgent = job.tags.includes('Urgent');
  const startDate = format(new Date(job.startDate), 'MMM d, yyyy');
  const endDate = job.endDate ? format(new Date(job.endDate), 'MMM d, yyyy') : null;
  const deadline = format(new Date(job.applicationDeadline), 'MMM d, yyyy');

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </Button>

          <div className="divide-y divide-border [&>*]:py-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {job.title}
                    </h1>
                    <Link
                      href={`/teacher/schools/${school.id}`}
                      className="text-lg text-muted-foreground hover:text-primary font-medium inline-flex items-center gap-2"
                    >
                      {school.name}
                      <span className="text-sm">&rarr;</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    {applied && (
                      <Badge className="bg-purple-100 text-purple-700">
                        Applied
                      </Badge>
                    )}
                    {/* Job Type Badge */}
                    <Badge variant="outline" className={getJobTypeBadge(job.jobType)}>
                      {job.jobType}
                    </Badge>
                    {isUrgent && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <AlertCircle size={16} />
                        URGENT
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {distance !== null && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      <span className="font-medium">{formatDistance(distance)} away</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    <span>{startDate}{endDate ? ` - ${endDate}` : ' - Ongoing'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>Apply by {deadline}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Badge variant="outline">
                    {job.educationPhase}
                  </Badge>
                  <Badge variant="outline">
                    {job.subject}
                  </Badge>
                  {job.tags.filter(t => t !== 'Urgent').map((tag) => (
                    <Badge variant="outline" key={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Job Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Required Qualifications */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Required Qualifications</h2>
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {job.requiredQualifications}
                  </p>
                </div>
              </div>

              {/* School Information */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">About the School</h2>
                {school.address && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin size={16} />
                    <span>{school.address}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                  {school.schoolType && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={16} />
                      <span>{school.schoolType} School</span>
                    </div>
                  )}
                  {school.curriculum && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={16} />
                      <span>{school.curriculum} Curriculum</span>
                    </div>
                  )}
                </div>
                {school.description && (
                  <p className="text-muted-foreground mt-4 line-clamp-3">
                    {school.description}
                  </p>
                )}
                <Link
                  href={`/teacher/schools/${school.id}`}
                  className="text-primary hover:text-primary/90 font-bold text-sm mt-2 inline-block"
                >
                  View Full School Profile &rarr;
                </Link>
              </div>

              {/* Apply / Withdraw Button */}
              <div className="flex gap-4">
                {applied ? (
                  <Button
                    variant="outline"
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="flex-1 py-3 border-red-500 text-red-600 hover:bg-red-50"
                    size="lg"
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Withdrawing...
                      </>
                    ) : (
                      'Withdraw Application'
                    )}
                  </Button>
                ) : teacher && teacher.profileCompleteness < 100 ? (
                  <div className="flex-1 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Your profile must be 100% complete to apply. Currently at <span className="font-bold text-foreground">{teacher.profileCompleteness}%</span>.
                    </p>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/teacher/setup">
                        Complete Your Profile
                      </Link>
                    </Button>
                  </div>
                ) : teacher && !verified ? (
                  <div className="flex-1 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Your profile must be verified before you can apply. Your documents are under review.
                    </p>
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <Link href="/teacher/setup">
                        View Verification Status
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex-1 py-3"
                    size="lg"
                  >
                    {applying ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Applying...
                      </>
                    ) : (
                      'Apply for this Position'
                    )}
                  </Button>
                )}
              </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
