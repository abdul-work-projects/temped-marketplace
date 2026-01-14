'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useData } from '@/lib/context/DataContext';
import { User, MapPin, GraduationCap, Briefcase, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { getTeacherById } = useData();

  const teacher = getTeacherById(teacherId);

  if (!teacher) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600">Teacher not found</p>
            <Link href="/school/dashboard" className="mt-4 inline-block text-[#a435f0] hover:text-[#8710d8]">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#a435f0] mb-6 font-bold"
          >
            <ArrowLeft size={20} />
            Back
          </button>

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

                {teacher.address && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin size={18} />
                    <span>{teacher.address}</span>
                  </div>
                )}
              </div>

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

              {/* Reviews from Schools */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Reviews from Schools</h2>
                <div className="bg-gray-50 border border-gray-300 p-6 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">Reviews will appear after completing jobs</p>
                </div>
              </div>

              {/* Past Jobs on TempEd */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Jobs Completed on TempEd</h2>
                <div className="bg-gray-50 border border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">No completed jobs yet</p>
                  <p className="text-xs text-gray-400 mt-1">Completed jobs history will be shown here</p>
                </div>
              </div>

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

                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Profile Completeness</span>
                    <span className="text-sm font-bold text-[#a435f0]">{teacher.profileCompleteness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 mt-2">
                    <div
                      className="bg-[#a435f0] h-3 transition-all duration-300"
                      style={{ width: `${teacher.profileCompleteness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
