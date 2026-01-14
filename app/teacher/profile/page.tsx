'use client';

import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { User, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { getTeacherByUserId } = useData();

  const teacher = user ? getTeacherByUserId(user.id) : null;

  if (!teacher) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-300 overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#a435f0] h-32"></div>

            <div className="px-8 pb-8">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  {teacher.profilePicture ? (
                    <img
                      src={teacher.profilePicture}
                      alt={`${teacher.firstName} ${teacher.surname}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Name and Info */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">
                  {teacher.firstName} {teacher.surname}
                </h1>
                <p className="text-gray-600">{user?.email}</p>

                {teacher.address && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin size={18} />
                    <span>{teacher.address}</span>
                  </div>
                )}
              </div>

              {/* Profile Completeness Alert */}
              {teacher.profileCompleteness < 100 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Your profile is {teacher.profileCompleteness}% complete.{' '}
                    <Link href="/teacher/setup" className="font-medium underline">
                      Complete it now
                    </Link>
                  </p>
                </div>
              )}

              {/* Description */}
              {teacher.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-2">About</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{teacher.description}</p>
                </div>
              )}

              {/* Education Phase & Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                    <GraduationCap size={20} />
                    Education Phase
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {teacher.educationPhase.map(phase => (
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
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                    <Briefcase size={20} />
                    Subjects
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map(subject => (
                      <span
                        key={subject}
                        className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience */}
              {teacher.experience && teacher.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Experience</h2>
                  <div className="space-y-4">
                    {teacher.experience.map(exp => (
                      <div key={exp.id} className="border-l-4 border-[#a435f0] pl-4">
                        <h3 className="font-bold text-[#1c1d1f]">{exp.title}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-gray-700">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="border-t border-gray-300 pt-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Verification Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${teacher.cv ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-700">CV Uploaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${teacher.idDocument ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-700">ID Document</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${teacher.qualifications && teacher.qualifications.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-700">Qualifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${teacher.faceVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-700">Face Verified</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-6">
                <Link
                  href="/teacher/setup"
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
