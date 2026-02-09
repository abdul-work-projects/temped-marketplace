'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useSchoolProfile, useCreateJob } from '@/lib/hooks/useSchool';
import { EducationPhase, JobType } from '@/types';
import { subjectsByPhase } from '@/lib/data/subjects';
import TagInput from '@/components/shared/TagInput';
import { Loader2 } from 'lucide-react';

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { school } = useSchoolProfile(user?.id);
  const { createJob, creating } = useCreateJob();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    setError(null);

    const tags = formData.tags;

    const { error: createError } = await createJob({
      school_id: school.id,
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      education_phase: formData.educationPhase,
      job_type: formData.jobType,
      start_date: formData.startDate,
      end_date: formData.endDate,
      application_deadline: formData.applicationDeadline,
      required_qualifications: formData.requiredQualifications,
      tags,
    });

    if (createError) {
      setError(createError);
    } else {
      router.push('/school/dashboard');
    }
  };

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Post a New Job</h1>
            <p className="text-gray-600">
              Fill in the details for your teaching position
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Error: {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                placeholder="e.g., Mathematics Teacher - Grade 10-12"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Job Description *
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                placeholder="Describe the position, responsibilities, and any additional requirements..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Education Phase *
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                >
                  <option value="Foundation Phase">Foundation Phase</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Tertiary">Tertiary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Subject *
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
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
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Job Type *
              </label>
              <select
                required
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
              >
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
                <option value="Invigilator">Invigilator</option>
                <option value="Coach">Coach</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Required Qualifications *
              </label>
              <textarea
                required
                rows={3}
                value={formData.requiredQualifications}
                onChange={(e) => setFormData({ ...formData, requiredQualifications: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                placeholder="e.g., Bachelor of Education in Mathematics, SACE registered"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Tags
              </label>
              <TagInput
                value={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                placeholder="e.g., Urgent, CAPS, Grade 10"
              />
            </div>

            <div className="pt-4 border-t border-gray-300 flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 px-4 border border-gray-300 text-[#1c1d1f] font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-3 px-4 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={20} className="animate-spin" />}
                {creating ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
