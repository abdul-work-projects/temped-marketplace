'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useData } from '@/lib/context/DataContext';
import { Building2, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SchoolProfilePage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const { getSchoolById, jobs } = useData();

  const school = getSchoolById(schoolId);
  const schoolJobs = school ? jobs.filter(job => job.schoolId === school.id && job.status === 'Open') : [];

  if (!school) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600">School not found</p>
            <Link href="/teacher/applications" className="mt-4 inline-block text-[#a435f0] hover:text-[#8710d8]">
              ← Back to Applications
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/teacher/applications"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#a435f0] mb-6 font-bold"
          >
            <ArrowLeft size={20} />
            Back to Applications
          </Link>

          <div className="bg-white border border-gray-300 overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#a435f0] h-32"></div>

            <div className="px-8 pb-8">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  {school.profilePicture ? (
                    <img
                      src={school.profilePicture}
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
                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-1">School Type</h3>
                  <p className="text-[#1c1d1f]">{school.schoolType}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-1">Ownership</h3>
                  <p className="text-[#1c1d1f]">{school.ownershipType}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-1">Curriculum</h3>
                  <p className="text-[#1c1d1f]">{school.curriculum}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-1">District</h3>
                  <p className="text-[#1c1d1f]">{school.district || school.educationDistrict || 'Not specified'}</p>
                </div>

                {school.emisNumber && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">EMIS Number</h3>
                    <p className="text-[#1c1d1f]">{school.emisNumber}</p>
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
                    {schoolJobs.map(job => (
                      <div key={job.id} className="border border-gray-300 p-4">
                        <h3 className="font-bold text-[#1c1d1f] mb-1">{job.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                            {job.educationPhase}
                          </span>
                          <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                            {job.subject}
                          </span>
                          {job.tags.includes('Urgent') && (
                            <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-100">
                              URGENT
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
