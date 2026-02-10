'use client';

import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useSchoolProfile, useSchoolJobs } from '@/lib/hooks/useSchool';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { useTestimonials } from '@/lib/hooks/useTestimonials';
import { Building2, MapPin, FileText, Loader2, MessageSquare, Pencil } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function SchoolProfilePage() {
  const { user } = useAuth();
  const { school, loading } = useSchoolProfile(user?.id);
  const profilePicUrl = useSignedUrl('profile-pictures', school?.profilePicture);
  const certUrl = useSignedUrl('registration-certificates', school?.registrationCertificate);
  const { jobs, loading: jobsLoading } = useSchoolJobs(school?.id);
  const { testimonials } = useTestimonials(user?.id);

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!school) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground">School profile not found. Please complete your setup.</p>
            <Link href="/school/setup" className="mt-4 inline-block text-primary hover:text-primary/90 font-bold">
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
      <div className="py-8 px-12">
        <div className="max-w-3xl">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-6">
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
                  <Building2 size={28} className="text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground mb-1">{school.name}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {school.address && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                  <MapPin size={14} />
                  <span>{school.address}</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
              <Link href="/school/setup">
                <Pencil size={18} />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-border [&>*]:py-6">
            {/* Description */}
            {school.description && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">About Us</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{school.description}</p>
              </div>
            )}

            {/* School Details */}
            <div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">School Type</h3>
                  <p className="text-sm text-foreground font-medium">{school.schoolType || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Ownership</h3>
                  <p className="text-sm text-foreground font-medium">{school.ownershipType || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Curriculum</h3>
                  <p className="text-sm text-foreground font-medium">{school.curriculum || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">District</h3>
                  <p className="text-sm text-foreground font-medium">{school.district || school.educationDistrict || 'Not specified'}</p>
                </div>
                {school.emisNumber && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">EMIS Number</h3>
                    <p className="text-sm text-foreground font-medium">{school.emisNumber}</p>
                  </div>
                )}
                {school.educationDistrict && school.district && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Education District</h3>
                    <p className="text-sm text-foreground font-medium">{school.educationDistrict}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Certificate */}
            {school.registrationCertificate && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Registration Certificate</h2>
                {certUrl ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={certUrl} target="_blank" rel="noopener noreferrer">
                      <FileText size={14} />
                      View Certificate
                    </a>
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Loading...
                  </span>
                )}
              </div>
            )}

            {/* Reviews from Teachers */}
            <div>
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
                  <p className="text-xs text-muted-foreground mt-1">Reviews will appear here after teachers complete jobs</p>
                </div>
              )}
            </div>

            {/* Job Postings Stats */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Job Postings</h2>
              {jobsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  Loading stats...
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                    <p className="text-sm text-muted-foreground font-medium">Total Posted</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{openJobs.length}</p>
                    <p className="text-sm text-muted-foreground font-medium">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{hiredJobs.length}</p>
                    <p className="text-sm text-muted-foreground font-medium">Hired</p>
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
