'use client';

import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useSchoolById } from '@/lib/hooks/useJobs';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { useTestimonials } from '@/lib/hooks/useTestimonials';
import { Building2, MapPin, ArrowLeft, GraduationCap, Briefcase, AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

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

export default function SchoolProfilePage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.schoolId as string;
  const { school, schoolJobs, loading } = useSchoolById(schoolId);
  const profilePicUrl = useSignedUrl('profile-pictures', school?.profilePicture);
  const { testimonials } = useTestimonials(school?.userId);

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8">
          <div className="max-w-3xl mx-auto flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading school profile...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!school) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 mb-4">School not found</p>
            <button
              onClick={() => router.back()}
              className="text-[#2563eb] hover:text-[#1d4ed8] font-bold"
            >
              &larr; Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#2563eb] mb-6 font-bold"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="bg-white border border-gray-300 overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#2563eb] h-32"></div>

            <div className="px-8 pb-8">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={school.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Building2 size={48} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Name and Info */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">
                  {school.name}
                </h1>

                {school.address && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin size={18} />
                    <span>{school.address}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {school.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-2">About Us</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{school.description}</p>
                </div>
              )}

              {/* School Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {school.schoolType && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">School Type</h3>
                    <p className="text-[#1c1d1f]">{school.schoolType}</p>
                  </div>
                )}

                {school.ownershipType && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">Ownership</h3>
                    <p className="text-[#1c1d1f]">{school.ownershipType}</p>
                  </div>
                )}

                {school.curriculum && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">Curriculum</h3>
                    <p className="text-[#1c1d1f]">{school.curriculum}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-1">District</h3>
                  <p className="text-[#1c1d1f]">
                    {school.district || school.educationDistrict || 'Not specified'}
                  </p>
                </div>

                {school.emisNumber && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">EMIS Number</h3>
                    <p className="text-[#1c1d1f]">{school.emisNumber}</p>
                  </div>
                )}
              </div>

              {/* Reviews from Teachers */}
              <div className="border-t border-gray-300 pt-6 mb-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Reviews from Teachers
                </h2>
                {testimonials.length > 0 ? (
                  <div className="space-y-4">
                    {testimonials.map((t) => (
                      <div key={t.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-[#1c1d1f]">{t.senderName}</p>
                          <p className="text-xs text-gray-500">{format(new Date(t.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                        <p className="text-gray-700 text-sm">{t.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-300 p-6 text-center">
                    <p className="text-sm text-gray-500">No reviews yet</p>
                    <p className="text-xs text-gray-400 mt-1">Reviews will appear after completing jobs</p>
                  </div>
                )}
              </div>

              {/* Active Job Postings */}
              {schoolJobs.length > 0 && (
                <div className="border-t border-gray-300 pt-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">
                    Active Job Postings ({schoolJobs.length})
                  </h2>
                  <div className="space-y-3">
                    {schoolJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/teacher/jobs/${job.id}`}
                        className="block border border-gray-300 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-[#1c1d1f]">{job.title}</h3>
                          {job.tags.includes('Urgent') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100">
                              <AlertCircle size={12} />
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-bold border ${getJobTypeBadge(job.jobType)}`}>
                            {job.jobType}
                          </span>
                          <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                            {job.educationPhase}
                          </span>
                          <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                            {job.subject}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {schoolJobs.length === 0 && (
                <div className="border-t border-gray-300 pt-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Job Postings</h2>
                  <div className="bg-gray-50 border border-gray-300 p-6 text-center">
                    <p className="text-sm text-gray-500">No active job postings at the moment</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
