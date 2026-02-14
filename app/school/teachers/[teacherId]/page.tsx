'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useTeacherById, useTeacherDocuments } from '@/lib/hooks/useTeacher';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { useTestimonials } from '@/lib/hooks/useTestimonials';
import { isTeacherVerified } from '@/lib/utils/verification';
import { User, MapPin, GraduationCap, Briefcase, ArrowLeft, CheckCircle, Shield, Loader2, MessageSquare, Phone, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!teacher) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground">Teacher not found</p>
            <Link href="/school/dashboard" className="mt-4 inline-block text-primary hover:text-primary/90">
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
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </Button>

          <div>
            {/* Header Section */}
            <div className="flex items-start gap-6 mb-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={`${teacher.firstName} ${teacher.surname}`}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={36} className="text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Name and Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {teacher.firstName} {teacher.surname}
                  </h1>
                  {verified && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle size={14} />
                      Verified
                    </Badge>
                  )}
                </div>

                {teacher.address && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                    <MapPin size={14} />
                    <span>{teacher.address}</span>
                  </div>
                )}
                {teacher.phoneNumber && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                    <Phone size={14} />
                    <span>{teacher.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="divide-y divide-border [&>*]:py-6">
              {/* Description */}
              {teacher.description && (
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-2">About</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{teacher.description}</p>
                </div>
              )}

              {/* Education Phase & Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <GraduationCap size={20} />
                    Education Phase
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {teacher.educationPhases.map(phase => (
                      <Badge key={phase} variant="outline">
                        {phase}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Briefcase size={20} />
                    Subjects
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {allSubjects.map(subject => (
                      <Badge key={subject} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sports & Arts/Culture */}
              {(Object.keys(teacher.sports).length > 0 || Object.keys(teacher.artsCulture).length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(teacher.sports).length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-3">Sports</h2>
                      <div className="space-y-2">
                        {Object.entries(teacher.sports).map(([phase, items]) => (
                          <div key={phase}>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{phase}</p>
                            <div className="flex flex-wrap gap-2">
                              {items.map(sport => (
                                <Badge key={`${phase}-${sport}`} variant="outline">
                                  {sport}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.keys(teacher.artsCulture).length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-3">Arts & Culture</h2>
                      <div className="space-y-2">
                        {Object.entries(teacher.artsCulture).map(([phase, items]) => (
                          <div key={phase}>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{phase}</p>
                            <div className="flex flex-wrap gap-2">
                              {items.map(item => (
                                <Badge key={`${phase}-${item}`} variant="outline">
                                  {item}
                                </Badge>
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
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-3">Experience</h2>
                  <div className="space-y-4">
                    {experiences.map(exp => (
                      <div key={exp.id} className="border-l-4 border-primary pl-4">
                        <h3 className="font-bold text-foreground">{exp.title}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-muted-foreground">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {teacher.teacherReferences.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Users size={20} />
                    References
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacher.teacherReferences.map((ref, idx) => (
                      <div key={idx} className="border border-border p-4 rounded-lg">
                        <p className="font-bold text-foreground">{ref.name}</p>
                        <p className="text-sm text-muted-foreground">{ref.relationship}</p>
                        <p className="text-sm text-muted-foreground">{ref.email}</p>
                        <p className="text-sm text-muted-foreground">{ref.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews from Schools */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Reviews from Schools
                </h2>
                {testimonials.length > 0 ? (
                  <div className="space-y-4">
                    {testimonials.map((t) => (
                      <div key={t.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-foreground">{t.senderName}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(t.createdAt), 'MMM d, yyyy')}</p>
                          </div>
                          <p className="text-muted-foreground text-sm">{t.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">No reviews yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Reviews will appear after completing jobs</p>
                  </div>
                )}
              </div>

              {/* Verification Status */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Shield size={20} />
                  Verification Status
                </h2>
                <div className="flex items-center gap-3">
                  {verified ? (
                    <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1.5">
                      <CheckCircle size={16} />
                      Fully Verified
                    </Badge>
                  ) : documents.some(d => d.status === 'pending') ? (
                    <Badge className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1.5">
                      Verification In Progress
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-sm px-3 py-1.5">
                      Not Yet Verified
                    </Badge>
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
