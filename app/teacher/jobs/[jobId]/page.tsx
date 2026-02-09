'use client';

import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeacherProfile } from '@/lib/hooks/useTeacher';
import { useJobDetail, useCheckApplication, useApplyToJob, useWithdrawApplication } from '@/lib/hooks/useJobs';
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import { MapPin, Calendar, Clock, ArrowLeft, AlertCircle, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

function getJobTypeBadge(jobType: string) {
  switch (jobType) {
    case 'Permanent':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'Temporary':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Invigilator':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'Coach':
      return 'bg-teal-100 text-teal-700 border-teal-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const { user } = useAuth();

  const { teacher, loading: teacherLoading } = useTeacherProfile(user?.id);
  const { job, school, loading: jobLoading } = useJobDetail(jobId);
  const { applied, loading: checkLoading, refetch: refetchCheck } = useCheckApplication(jobId, teacher?.id);
  const { apply, applying } = useApplyToJob();
  const { withdraw, withdrawing } = useWithdrawApplication();

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
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job || !school) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600 mb-4">Job not found</p>
            <Link href="/teacher/dashboard" className="text-[#2563eb] hover:text-[#1d4ed8] font-bold">
              &larr; Back to Available Jobs
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isUrgent = job.tags.includes('Urgent');
  const startDate = format(new Date(job.startDate), 'MMM d, yyyy');
  const endDate = format(new Date(job.endDate), 'MMM d, yyyy');
  const deadline = format(new Date(job.applicationDeadline), 'MMM d, yyyy');

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#2563eb] mb-6 font-bold"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="bg-white border border-gray-300 p-8">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-gray-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">
                    {job.title}
                  </h1>
                  <Link
                    href={`/teacher/schools/${school.id}`}
                    className="text-lg text-gray-600 hover:text-[#2563eb] font-medium inline-flex items-center gap-2"
                  >
                    {school.name}
                    <span className="text-sm">&rarr;</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  {/* Job Type Badge */}
                  <span
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-bold border ${getJobTypeBadge(job.jobType)}`}
                  >
                    {job.jobType}
                  </span>
                  {isUrgent && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-bold">
                      <AlertCircle size={16} />
                      URGENT
                    </span>
                  )}
                </div>
              </div>

              {/* Key Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {distance !== null && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    <span className="font-medium">{formatDistance(distance)} away</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  <span>{startDate} - {endDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} />
                  <span>Apply by {deadline}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                  {job.educationPhase}
                </span>
                <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                  {job.subject}
                </span>
                {job.tags.filter(t => t !== 'Urgent').map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1c1d1f] mb-3">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* Required Qualifications */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1c1d1f] mb-3">Required Qualifications</h2>
              <div className="bg-gray-50 border border-gray-300 p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {job.requiredQualifications}
                </p>
              </div>
            </div>

            {/* School Information */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h2 className="text-xl font-bold text-[#1c1d1f] mb-3">About the School</h2>
              {school.address && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{school.address}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
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
                <p className="text-gray-700 mt-4 line-clamp-3">
                  {school.description}
                </p>
              )}
              <Link
                href={`/teacher/schools/${school.id}`}
                className="text-[#2563eb] hover:text-[#1d4ed8] font-bold text-sm mt-2 inline-block"
              >
                View Full School Profile &rarr;
              </Link>
            </div>

            {/* Apply / Withdraw Button */}
            <div className="flex gap-4">
              {applied ? (
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="flex-1 py-3 px-6 font-bold transition-colors border-2 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {withdrawing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    'Withdraw Application'
                  )}
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 py-3 px-6 font-bold transition-colors bg-[#2563eb] text-white hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply for this Position'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
