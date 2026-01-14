'use client';

import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { MapPin, Calendar, Clock, ArrowLeft, AlertCircle, Briefcase, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import Link from 'next/link';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const { user } = useAuth();
  const {
    getJobById,
    getSchoolById,
    getTeacherByUserId,
    getApplicationsByTeacherId,
    addApplication
  } = useData();

  const job = getJobById(jobId);
  const school = job ? getSchoolById(job.schoolId) : null;
  const teacher = user ? getTeacherByUserId(user.id) : null;
  const teacherApplications = teacher ? getApplicationsByTeacherId(teacher.id) : [];
  const hasApplied = teacherApplications.some(app => app.jobId === jobId);

  const distance = teacher?.location && school?.location
    ? calculateDistance(
        teacher.location.lat,
        teacher.location.lng,
        school.location.lat,
        school.location.lng
      )
    : null;

  const handleApply = () => {
    if (!teacher) return;

    addApplication({
      jobId,
      teacherId: teacher.id,
      status: 'Applied',
      appliedAt: new Date().toISOString().split('T')[0],
      shortlisted: false
    });
  };

  if (!job || !school) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600 mb-4">Job not found</p>
            <Link href="/teacher/dashboard" className="text-[#a435f0] hover:text-[#8710d8] font-bold">
              ← Back to Available Jobs
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
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#a435f0] mb-6 font-bold"
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
                    className="text-lg text-gray-600 hover:text-[#a435f0] font-medium inline-flex items-center gap-2"
                  >
                    {school.name}
                    <span className="text-sm">→</span>
                  </Link>
                </div>
                {isUrgent && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-bold">
                    <AlertCircle size={16} />
                    URGENT
                  </span>
                )}
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
              <div className="flex items-center gap-2 mt-4">
                <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                  {job.educationPhase}
                </span>
                <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                  {job.subject}
                </span>
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
                <div className="flex items-center gap-1.5">
                  <Briefcase size={16} />
                  <span>{school.schoolType} School</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={16} />
                  <span>{school.curriculum} Curriculum</span>
                </div>
              </div>
              {school.description && (
                <p className="text-gray-700 mt-4 line-clamp-3">
                  {school.description}
                </p>
              )}
              <Link
                href={`/teacher/schools/${school.id}`}
                className="text-[#a435f0] hover:text-[#8710d8] font-bold text-sm mt-2 inline-block"
              >
                View Full School Profile →
              </Link>
            </div>

            {/* Apply Button */}
            <div className="flex gap-4">
              <button
                onClick={handleApply}
                disabled={hasApplied}
                className={`flex-1 py-3 px-6 font-bold transition-colors ${
                  hasApplied
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#a435f0] text-white hover:bg-[#8710d8]'
                }`}
              >
                {hasApplied ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Applied
                  </span>
                ) : (
                  'Apply for this Position'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
