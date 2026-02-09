'use client';

import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeacherProfile, useTeacherDocuments } from '@/lib/hooks/useTeacher';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { useTestimonials } from '@/lib/hooks/useTestimonials';
import { isTeacherVerified, getVerificationSummary } from '@/lib/utils/verification';
import { REQUIRED_DOCUMENT_TYPES, DocumentType } from '@/types';
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  BadgeCheck,
  Clock,
  Dumbbell,
  Palette,
  Users,
  Shield,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { teacher, experiences, loading } = useTeacherProfile(user?.id);
  const { documents } = useTeacherDocuments(teacher?.id);
  const profilePicUrl = useSignedUrl('profile-pictures', teacher?.profilePicture);
  const { testimonials } = useTestimonials(user?.id);
  const verified = teacher ? isTeacherVerified(documents) : false;
  const docSummary = getVerificationSummary(documents);
  const hasPendingDocs = documents.some(d => d.status === 'pending');
  const hasRejectedDocs = docSummary.some(s => !s.hasApproved && s.latestRejection);

  if (loading || !teacher) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate completeness bar color
  const completenessColor =
    teacher.profileCompleteness >= 80
      ? 'bg-green-500'
      : teacher.profileCompleteness >= 50
        ? 'bg-yellow-500'
        : 'bg-red-500';

  // All subjects flattened for display
  const allPhaseKeys = Object.keys(teacher.subjects);

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-300 overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#2563eb] h-32"></div>

            <div className="px-8 pb-8">
              {/* Profile Picture & Verified Badge */}
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
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
                {verified && (
                  <div className="absolute bottom-0 left-24">
                    <div className="bg-green-500 text-white rounded-full p-1.5" title="Verified Teacher">
                      <BadgeCheck size={20} />
                    </div>
                  </div>
                )}
              </div>

              {/* Name and Info */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#1c1d1f]">
                    {teacher.firstName} {teacher.surname}
                  </h1>
                  {verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      <BadgeCheck size={14} />
                      Verified
                    </span>
                  )}
                  {!verified && hasPendingDocs && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                      <Clock size={14} />
                      Pending Verification
                    </span>
                  )}
                  {!verified && hasRejectedDocs && !hasPendingDocs && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      <Shield size={14} />
                      Action Required
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{user?.email}</p>

                {teacher.address && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin size={18} />
                    <span>{teacher.address}</span>
                  </div>
                )}

                {teacher.distanceRadius > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Willing to travel up to {teacher.distanceRadius}km
                  </p>
                )}
              </div>

              {/* Profile Completeness Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-[#1c1d1f]">Profile Completeness</h2>
                  <span className="text-sm font-bold text-[#1c1d1f]">{teacher.profileCompleteness}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full">
                  <div
                    className={`h-2.5 rounded-full transition-all ${completenessColor}`}
                    style={{ width: `${teacher.profileCompleteness}%` }}
                  ></div>
                </div>
                {teacher.profileCompleteness < 100 && (
                  <p className="text-sm text-yellow-700 mt-2">
                    Your profile is {teacher.profileCompleteness}% complete.{' '}
                    <Link href="/teacher/setup" className="font-medium underline">
                      Complete it now
                    </Link>
                  </p>
                )}
              </div>

              {/* Description */}
              {teacher.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-2">About</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{teacher.description}</p>
                </div>
              )}

              {/* Education Phases */}
              {teacher.educationPhases.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                    <GraduationCap size={20} />
                    Education Phases
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {teacher.educationPhases.map((phase) => (
                      <span
                        key={phase}
                        className="px-3 py-1.5 text-xs font-bold text-[#2563eb] bg-blue-50 border border-[#2563eb]"
                      >
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects grouped by Phase */}
              {allPhaseKeys.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                    <Briefcase size={20} />
                    Subjects
                  </h2>
                  <div className="space-y-4">
                    {allPhaseKeys.map((phase) => (
                      <div key={phase}>
                        <h3 className="text-sm font-bold text-gray-600 mb-2">{phase}</h3>
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects[phase].map((subject) => (
                            <span
                              key={`${phase}-${subject}`}
                              className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Timeline */}
              {experiences.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Experience</h2>
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="border-l-4 border-[#2563eb] pl-4">
                        <h3 className="font-bold text-[#1c1d1f]">{exp.title}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {exp.startDate
                            ? format(new Date(exp.startDate), 'MMM yyyy')
                            : 'N/A'}{' '}
                          -{' '}
                          {exp.endDate
                            ? format(new Date(exp.endDate), 'MMM yyyy')
                            : 'Present'}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-gray-700">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sports */}
              {Object.keys(teacher.sports).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                    <Dumbbell size={20} />
                    Sports
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(teacher.sports).map(([phase, items]) => (
                      <div key={phase}>
                        <h3 className="text-sm font-bold text-gray-600 mb-2">{phase}</h3>
                        <div className="flex flex-wrap gap-2">
                          {items.map((sport) => (
                            <span
                              key={`${phase}-${sport}`}
                              className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
                            >
                              {sport}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Arts & Culture */}
              {Object.keys(teacher.artsCulture).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                    <Palette size={20} />
                    Arts &amp; Culture
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(teacher.artsCulture).map(([phase, items]) => (
                      <div key={phase}>
                        <h3 className="text-sm font-bold text-gray-600 mb-2">{phase}</h3>
                        <div className="flex flex-wrap gap-2">
                          {items.map((art) => (
                            <span
                              key={`${phase}-${art}`}
                              className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
                            >
                              {art}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {teacher.teacherReferences.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#1c1d1f] mb-3 flex items-center gap-2">
                    <Users size={20} />
                    References
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacher.teacherReferences.map((ref, idx) => (
                      <div key={idx} className="border border-gray-300 p-4">
                        <p className="font-bold text-[#1c1d1f]">{ref.name}</p>
                        <p className="text-sm text-gray-600">{ref.relationship}</p>
                        <p className="text-sm text-gray-500">{ref.email}</p>
                        <p className="text-sm text-gray-500">{ref.phone}</p>
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
                    <p className="text-xs text-gray-400 mt-1">Reviews will appear here after you complete jobs</p>
                  </div>
                )}
              </div>

              {/* Past Jobs on TempEd */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Jobs Completed on TempEd</h2>
                <div className="bg-gray-50 border border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">No completed jobs yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your completed jobs will be listed here</p>
                </div>
              </div>

              {/* Verification Status */}
              <div className="border-t border-gray-300 pt-6">
                <h2 className="text-lg font-bold text-[#1c1d1f] mb-3">Verification Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  {docSummary.map(({ type, hasApproved, hasPending, latestRejection, latest }) => {
                    const labels: Record<DocumentType, string> = {
                      cv: 'CV',
                      qualification: 'Qualifications',
                      id_document: 'ID Document',
                      criminal_record: 'Criminal Record Check',
                      selfie: 'Face Verification',
                    };
                    let dotColor = 'bg-gray-300';
                    if (hasApproved) dotColor = 'bg-green-500';
                    else if (hasPending) dotColor = 'bg-yellow-500';
                    else if (latestRejection) dotColor = 'bg-red-500';

                    return (
                      <div key={type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                        <span className="text-sm text-gray-700">{labels[type]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-6">
                <Link
                  href="/teacher/setup"
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
