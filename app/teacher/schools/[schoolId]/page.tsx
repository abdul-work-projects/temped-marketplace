'use client';

import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useSchoolById } from '@/lib/hooks/useJobs';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { useTestimonials } from '@/lib/hooks/useTestimonials';
import { Building2, MapPin, ArrowLeft, AlertCircle, MessageSquare, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function getJobTypeBadge(jobType: string) {
  switch (jobType) {
    case 'Permanent':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Temporary':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Invigilator':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Coach':
      return 'bg-teal-100 text-teal-700 border-teal-200';
    default:
      return 'bg-muted text-muted-foreground border-border';
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
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading school profile...</p>
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
            <p className="text-muted-foreground mb-4">School not found</p>
            <button
              onClick={() => router.back()}
              className="text-primary hover:text-primary/90 font-bold"
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
          <Button
            variant="ghost"
            onClick={() => router.back()}
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
                      alt={school.name}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Building2 size={36} className="text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Name and Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {school.name}
                  </h1>
                  {school.verificationStatus === 'approved' && (
                    <Badge className="bg-green-100 text-green-700 border-green-200"><BadgeCheck size={14} />Verified</Badge>
                  )}
                </div>

                {school.address && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                    <MapPin size={14} />
                    <span>{school.address}</span>
                  </div>
                )}
              </div>
            </div>

              {/* Description */}
              {school.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground mb-2">About Us</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{school.description}</p>
                </div>
              )}

              {/* School Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {school.schoolType && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground mb-1">School Type</h3>
                    <p className="text-foreground">{school.schoolType}</p>
                  </div>
                )}

                {school.ownershipType && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground mb-1">Ownership</h3>
                    <p className="text-foreground">{school.ownershipType}</p>
                  </div>
                )}

                {school.curriculum && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground mb-1">Curriculum</h3>
                    <p className="text-foreground">{school.curriculum}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-muted-foreground mb-1">District</h3>
                  <p className="text-foreground">
                    {school.district || school.educationDistrict || 'Not specified'}
                  </p>
                </div>

                {school.emisNumber && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground mb-1">EMIS Number</h3>
                    <p className="text-foreground">{school.emisNumber}</p>
                  </div>
                )}
              </div>

              {/* Reviews from Teachers */}
              <div className="border-t border-border pt-6 mb-6">
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Reviews from Teachers
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

              {/* Active Job Postings */}
              {schoolJobs.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h2 className="text-lg font-bold text-foreground mb-3">
                    Active Job Postings ({schoolJobs.length})
                  </h2>
                  <div className="space-y-3">
                    {schoolJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/teacher/jobs/${job.id}`}
                        className="block border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-foreground">{job.title}</h3>
                          {job.tags.includes('Urgent') && (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <AlertCircle size={12} />
                              URGENT
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={getJobTypeBadge(job.jobType)}>
                            {job.jobType}
                          </Badge>
                          <Badge variant="outline">
                            {job.educationPhase}
                          </Badge>
                          <Badge variant="outline">
                            {job.subject}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {schoolJobs.length === 0 && (
                <div className="border-t border-border pt-6">
                  <h2 className="text-lg font-bold text-foreground mb-3">Job Postings</h2>
                  <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">No active job postings at the moment</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
