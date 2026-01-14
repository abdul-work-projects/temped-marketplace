'use client';

import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { Building2, MapPin, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function SchoolProfilePage() {
  const { user } = useAuth();
  const { getSchoolByUserId, jobs } = useData();

  const school = user ? getSchoolByUserId(user.id) : null;
  const schoolJobs = school ? jobs.filter(job => job.schoolId === school.id) : [];

  if (!school) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
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

              {/* Job Postings Stats */}
              <div className="border-t border-gray-300 pt-6 mb-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Job Postings</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-gray-300 p-4">
                    <p className="text-2xl font-bold text-[#1c1d1f]">{schoolJobs.length}</p>
                    <p className="text-sm text-gray-600 font-bold">Total Posted</p>
                  </div>
                  <div className="border border-gray-300 p-4">
                    <p className="text-2xl font-bold text-[#1c1d1f]">
                      {schoolJobs.filter(job => job.status === 'Open').length}
                    </p>
                    <p className="text-sm text-gray-600 font-bold">Active</p>
                  </div>
                  <div className="border border-gray-300 p-4">
                    <p className="text-2xl font-bold text-[#1c1d1f]">
                      {schoolJobs.filter(job => job.status === 'Closed').length}
                    </p>
                    <p className="text-sm text-gray-600 font-bold">Closed</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div>
                <Link
                  href="/school/setup"
                  className="inline-block w-full py-3 px-4 bg-[#a435f0] text-white text-center font-bold hover:bg-[#8710d8] transition-colors"
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
