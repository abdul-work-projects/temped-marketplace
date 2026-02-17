'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useJobDetail } from '@/lib/hooks/useJobs';
import { useUpdateJob, useSchoolProfile } from '@/lib/hooks/useSchool';
import { useAuth } from '@/lib/context/AuthContext';
import { EducationPhase, JobType } from '@/types';
import { subjectsByPhase } from '@/lib/data/subjects';
import TagInput from '@/components/shared/TagInput';
import { useTags } from '@/lib/hooks/useTags';
import { SELECT_CLASS } from '@/lib/utils';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { school } = useSchoolProfile(user?.id);
  const { job, loading } = useJobDetail(jobId);
  const { updateJob, updating } = useUpdateJob();
  const { tags: availableTags, loading: tagsLoading } = useTags();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    educationPhase: 'Foundation Phase' as EducationPhase,
    jobType: 'Temporary' as JobType,
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    requiredQualifications: '',
    tags: [] as string[],
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        subject: job.subject,
        educationPhase: job.educationPhase,
        jobType: job.jobType,
        startDate: job.startDate,
        endDate: job.endDate || '',
        applicationDeadline: job.applicationDeadline,
        requiredQualifications: job.requiredQualifications,
        tags: job.tags,
      });
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setError(null);

    const tags = formData.tags;

    const { success, error: updateError } = await updateJob(job.id, {
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      education_phase: formData.educationPhase,
      job_type: formData.jobType,
      start_date: formData.startDate,
      end_date: formData.endDate || null,
      application_deadline: formData.applicationDeadline,
      required_qualifications: formData.requiredQualifications,
      tags,
    });

    if (success) {
      router.push('/school/dashboard');
    } else if (updateError) {
      setError(updateError);
    }
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

  if (!job) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground">Job not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (school && school.verificationStatus !== 'approved') {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center py-16">
              <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Verification Required</h2>
              <p className="text-muted-foreground mb-4">
                {school.verificationStatus === 'rejected'
                  ? `Your verification was rejected${school.rejectionReason ? `: ${school.rejectionReason}` : ''}. Please re-upload your registration certificate.`
                  : school.verificationStatus === 'pending'
                  ? "Your school is currently under review. You'll be able to edit jobs once verified."
                  : 'Please upload your registration certificate in your profile setup to get verified.'}
              </p>
              <Button asChild>
                <Link href="/school/setup">Go to Profile Setup</Link>
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Edit Job</h1>
            <p className="text-muted-foreground">
              Update the details for this position
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Error: {error}</p>
            </div>
          )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="mb-2 font-bold">
                    Job Title *
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Mathematics Teacher - Grade 10-12"
                  />
                </div>

                <div>
                  <Label className="mb-2 font-bold">
                    Job Description *
                  </Label>
                  <Textarea
                    required
                    rows={5}
                    maxLength={2000}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the position, responsibilities, and any additional requirements..."
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{formData.description.length}/2000</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 font-bold">
                      Education Phase *
                    </Label>
                    <select
                      required
                      value={formData.educationPhase}
                      onChange={(e) => {
                        const newPhase = e.target.value as EducationPhase;
                        const categories = subjectsByPhase[newPhase] || [];
                        const allSubjects = categories.flatMap(c => c.subjects);
                        setFormData({
                          ...formData,
                          educationPhase: newPhase,
                          subject: allSubjects.includes(formData.subject) ? formData.subject : '',
                        });
                      }}
                      className={SELECT_CLASS}
                    >
                      <option value="Foundation Phase">Foundation Phase</option>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Tertiary">Tertiary</option>
                    </select>
                  </div>

                  <div>
                    <Label className="mb-2 font-bold">
                      Subject *
                    </Label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={SELECT_CLASS}
                    >
                      <option value="">Select a subject</option>
                      {(subjectsByPhase[formData.educationPhase] || []).map(cat => (
                        <optgroup key={cat.category} label={cat.category}>
                          {cat.subjects.map(s => (
                            <option key={`${cat.category}-${s}`} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 font-bold">
                    Job Type *
                  </Label>
                  <select
                    required
                    value={formData.jobType}
                    onChange={(e) => {
                      const jt = e.target.value as JobType;
                      setFormData({ ...formData, jobType: jt, ...(jt === 'Permanent' ? { endDate: '' } : {}) });
                    }}
                    className={SELECT_CLASS}
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Invigilator">Invigilator</option>
                    <option value="Coach">Coach</option>
                  </select>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${formData.jobType !== 'Permanent' ? 'lg:grid-cols-3' : ''} gap-4`}>
                  <div>
                    <Label className="mb-2 font-bold">
                      Start Date *
                    </Label>
                    <Input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  {formData.jobType !== 'Permanent' && (
                    <div>
                      <Label className="mb-2 font-bold">
                        End Date *
                      </Label>
                      <Input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 font-bold">
                      Application Deadline *
                    </Label>
                    <Input
                      type="date"
                      required
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 font-bold">
                    Required Qualifications *
                  </Label>
                  <Textarea
                    required
                    rows={3}
                    maxLength={1000}
                    value={formData.requiredQualifications}
                    onChange={(e) => setFormData({ ...formData, requiredQualifications: e.target.value })}
                    placeholder="e.g., Bachelor of Education in Mathematics, SACE registered"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{formData.requiredQualifications.length}/1000</p>
                </div>

                <div>
                  <Label className="mb-2 font-bold">
                    Tags
                  </Label>
                  <TagInput
                    value={formData.tags}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                    availableTags={availableTags.map(t => t.name)}
                    loading={tagsLoading}
                  />
                </div>

                <div className="pt-4 border-t border-border flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    className="flex-1"
                  >
                    {updating && <Loader2 size={20} className="animate-spin" />}
                    {updating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
