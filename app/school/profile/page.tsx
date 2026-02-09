'use client';

import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useSchoolProfile, useSchoolJobs } from '@/lib/hooks/useSchool';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { Building2, MapPin, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SchoolProfilePage() {
  const { user } = useAuth();
  const { school, loading } = useSchoolProfile(user?.id);
  const profilePicUrl = useSignedUrl('profile-pictures', school?.profilePicture);
  const certUrl = useSignedUrl('registration-certificates', school?.registrationCertificate);
  const { jobs, loading: jobsLoading } = useSchoolJobs(school?.id);

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!school) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600">School profile not found. Please complete your setup.</p>
            <Link href="/school/setup" className="mt-4 inline-block text-[#2563eb] hover:text-[#1d4ed8] font-bold">
              Go to Setup
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const openJobs = jobs.filter(job => job.progress === 'Open');
  const hiredJobs = jobs.filter(job => job.progress === 'Hired');

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-300 overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#2563eb] h-32"></div>

            <div className="px-8 pb-8">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
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
                <p className="text-gray-600">{user?.email}</p>

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
                  <p className="text-[#1c1d1f]">{school.schoolType || 'Not specified'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-1">Ownership</h3>
                  <p className="text-[#1c1d1f]">{school.ownershipType || 'Not specified'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-600 mb-1">Curriculum</h3>
                  <p className="text-[#1c1d1f]">{school.curriculum || 'Not specified'}</p>
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

                {school.educationDistrict && school.district && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">Education District</h3>
                    <p className="text-[#1c1d1f]">{school.educationDistrict}</p>
                  </div>
                )}
              </div>

              {/* Registration Certificate */}
              {school.registrationCertificate && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Registration Certificate</h2>
                  {certUrl ? (
                    <a
                      href={certUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-[#1c1d1f] hover:bg-gray-50 transition-colors"
                    >
                      <FileText size={18} />
                      View Certificate
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-gray-400">
                      <Loader2 size={18} className="animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>
              )}

              {/* Job Postings Stats */}
              <div className="border-t border-gray-300 pt-6 mb-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Job Postings</h2>
                {jobsLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    Loading stats...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-gray-300 p-4">
                      <p className="text-2xl font-bold text-[#1c1d1f]">{jobs.length}</p>
                      <p className="text-sm text-gray-600 font-bold">Total Posted</p>
                    </div>
                    <div className="border border-gray-300 p-4">
                      <p className="text-2xl font-bold text-[#1c1d1f]">{openJobs.length}</p>
                      <p className="text-sm text-gray-600 font-bold">Active</p>
                    </div>
                    <div className="border border-gray-300 p-4">
                      <p className="text-2xl font-bold text-[#1c1d1f]">{hiredJobs.length}</p>
                      <p className="text-sm text-gray-600 font-bold">Hired</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <div>
                <Link
                  href="/school/setup"
                  className="inline-block w-full py-3 px-4 bg-[#2563eb] text-white text-center font-bold hover:bg-[#1d4ed8] transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
