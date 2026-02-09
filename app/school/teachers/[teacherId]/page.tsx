'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useTeacherById, useTeacherDocuments } from '@/lib/hooks/useTeacher';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { useTestimonials } from '@/lib/hooks/useTestimonials';
import { isTeacherVerified } from '@/lib/utils/verification';
import { User, MapPin, GraduationCap, Briefcase, ArrowLeft, CheckCircle, Shield, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { teacher, experiences, loading } = useTeacherById(teacherId);
  const { documents } = useTeacherDocuments(teacherId);
  const profilePicUrl = useSignedUrl('profile-pictures', teacher?.profilePicture);
  const { testimonials } = useTestimonials(teacher?.userId);
  const verified = isTeacherVerified(documents);

  // Get all subjects as flat array
  const getSubjectsFlat = (subjects: Record<string, string[]>): string[] => {
    return [...new Set(Object.values(subjects).flat())];
  };

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!teacher) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600">Teacher not found</p>
            <Link href="/school/dashboard" className="mt-4 inline-block text-[#2563eb] hover:text-[#1d4ed8]">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const allSubjects = getSubjectsFlat(teacher.subjects);

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => window.history.back()}
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
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
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
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-[#1c1d1f]">
                    {teacher.firstName} {teacher.surname}
                  </h1>
                  {verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                      <CheckCircle size={14} />
                      Verified
                    </span>
                  )}
                </div>

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
                    {teacher.educationPhases.map(phase => (
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
                    {allSubjects.map(subject => (
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

              {/* Sports & Arts/Culture */}
              {(Object.keys(teacher.sports).length > 0 || Object.keys(teacher.artsCulture).length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {Object.keys(teacher.sports).length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Sports</h2>
                      <div className="space-y-2">
                        {Object.entries(teacher.sports).map(([phase, items]) => (
                          <div key={phase}>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{phase}</p>
                            <div className="flex flex-wrap gap-2">
                              {items.map(sport => (
                                <span key={`${phase}-${sport}`} className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                                  {sport}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.keys(teacher.artsCulture).length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Arts & Culture</h2>
                      <div className="space-y-2">
                        {Object.entries(teacher.artsCulture).map(([phase, items]) => (
                          <div key={phase}>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{phase}</p>
                            <div className="flex flex-wrap gap-2">
                              {items.map(item => (
                                <span key={`${phase}-${item}`} className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Experience */}
              {experiences.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Experience</h2>
                  <div className="space-y-4">
                    {experiences.map(exp => (
                      <div key={exp.id} className="border-l-4 border-[#2563eb] pl-4">
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
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Reviews from Schools
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

              {/* Verification Status */}
              <div className="border-t border-gray-300 pt-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                  <Shield size={20} />
                  Verification Status
                </h2>
                <div className="flex items-center gap-3">
                  {verified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                      <CheckCircle size={16} />
                      Fully Verified
                    </span>
                  ) : documents.some(d => d.status === 'pending') ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-full">
                      Verification In Progress
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-full">
                      Not Yet Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
