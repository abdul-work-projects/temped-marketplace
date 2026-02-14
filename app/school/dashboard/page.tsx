'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useSchoolProfile, useSchoolJobs, useDeleteJob, useUpdateJob } from '@/lib/hooks/useSchool';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Plus, Users, Calendar, Clock, Trash2, Loader2, Briefcase, Pencil, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SchoolDashboard() {
  const { user } = useAuth();
  const { school, loading: schoolLoading } = useSchoolProfile(user?.id);
  const { jobs, loading: jobsLoading, refetch } = useSchoolJobs(school?.id);
  const { deleteJob, deleting } = useDeleteJob();
  const { updateJob } = useUpdateJob();
  const loading = schoolLoading || jobsLoading;
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [jobsWithHires, setJobsWithHires] = useState<Set<string>>(new Set());
  const supabaseRef = useRef(createClient());

  const fetchApplicantCounts = useCallback(async () => {
    if (jobs.length === 0) return;

    const jobIds = jobs.map(j => j.id);
    const { data } = await supabaseRef.current
      .from('applications')
      .select('job_id, status')
      .in('job_id', jobIds);

    if (data) {
      const counts: Record<string, number> = {};
      const hires = new Set<string>();
      data.forEach((row: { job_id: string; status: string }) => {
        counts[row.job_id] = (counts[row.job_id] || 0) + 1;
        if (row.status === 'Hired') hires.add(row.job_id);
      });
      setApplicantCounts(counts);
      setJobsWithHires(hires);
    }
  }, [jobs]);

  useEffect(() => {
    fetchApplicantCounts();
  }, [fetchApplicantCounts]);

  const handleDelete = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    const { success } = await deleteJob(jobId);
    if (success) {
      refetch();
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'Open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Interviewing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Hired':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Closed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Job Postings</h1>
              <p className="text-muted-foreground">
                Manage your job listings and applications
              </p>
            </div>
            <Button asChild className="w-fit">
              <Link href="/school/post-job">
                <Plus size={20} />
                Post New Job
              </Link>
            </Button>
          </div>

          {/* Verification Status Banner */}
          {school && school.verificationStatus !== 'approved' && (
            <div className={`mb-6 rounded-lg p-4 flex items-start gap-3 ${
              school.verificationStatus === 'rejected'
                ? 'bg-red-50 border border-red-200'
                : school.verificationStatus === 'pending'
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {school.verificationStatus === 'rejected' ? (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              ) : school.verificationStatus === 'pending' ? (
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  school.verificationStatus === 'rejected' ? 'text-red-700' :
                  school.verificationStatus === 'pending' ? 'text-blue-700' : 'text-yellow-700'
                }`}>
                  {school.verificationStatus === 'rejected'
                    ? `Verification rejected${school.rejectionReason ? `: ${school.rejectionReason}` : ''}. Please re-upload your registration certificate.`
                    : school.verificationStatus === 'pending'
                    ? 'Your verification is under review. You\'ll be able to post jobs once approved.'
                    : 'Upload your registration certificate to get verified and start posting jobs.'}
                </p>
                {school.verificationStatus !== 'pending' && (
                  <Link href="/school/setup" className={`text-sm font-medium underline mt-1 inline-block ${
                    school.verificationStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    Go to Profile Setup
                  </Link>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <Card><CardContent className="p-12 text-center">
              <Briefcase size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No job postings yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first job posting to start hiring teachers
              </p>
              <Button asChild>
                <Link href="/school/post-job">
                  <Plus size={20} />
                  Post Your First Job
                </Link>
              </Button>
            </CardContent></Card>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {jobs.map(job => {
                const count = applicantCounts[job.id] || 0;

                return (
                  <div key={job.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {job.title}
                          </h3>
                          <Badge variant="secondary">{job.jobType}</Badge>
                          {job.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className={tag === 'Urgent' ? 'bg-red-100 text-red-700' : ''}>
                              {tag}
                            </Badge>
                          ))}
                          <select
                            value={job.progress}
                            onChange={async (e) => {
                              const { success } = await updateJob(job.id, { progress: e.target.value });
                              if (success) refetch();
                            }}
                            className={`sm:ml-auto px-3 py-1 text-xs font-bold border rounded-md cursor-pointer focus:outline-none ${getProgressColor(job.progress)}`}
                          >
                            <option value="Open">Open</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Closed">Closed</option>
                            {jobsWithHires.has(job.id) && <option value="Hired">Hired</option>}
                          </select>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>
                              {format(new Date(job.startDate), 'MMM d')}{job.endDate ? ` - ${format(new Date(job.endDate), 'MMM d, yyyy')}` : ' - Ongoing'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>Apply by {format(new Date(job.applicationDeadline), 'MMM d')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>
                              {count} applicant{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">{job.educationPhase}</Badge>
                      <Badge variant="outline">{job.subject}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/school/jobs/${job.id}/applicants`}>
                          <Users size={14} />
                          Applicants ({count})
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/school/jobs/${job.id}/edit`}>
                          <Pencil size={14} />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id, job.title)}
                        disabled={deleting}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        {deleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
