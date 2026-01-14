'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { EducationPhase } from '@/types';

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getSchoolByUserId, createJob } = useData();

  const school = user ? getSchoolByUserId(user.id) : null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    requiredQualifications: '',
    educationPhase: 'Secondary' as EducationPhase,
    urgent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    createJob({
      schoolId: school.id,
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      startDate: formData.startDate,
      endDate: formData.endDate,
      applicationDeadline: formData.applicationDeadline,
      requiredQualifications: formData.requiredQualifications,
      educationPhase: formData.educationPhase,
      tags: formData.urgent ? ['Urgent'] : [],
      status: 'Open'
    });

    router.push('/school/dashboard');
  };

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Post a New Job</h1>
            <p className="text-gray-600">
              Fill in the details for your temporary teaching position
            </p>
          </div>

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
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Education Phase *
                </label>
                <select
                  required
                  value={formData.educationPhase}
                  onChange={(e) => setFormData({ ...formData, educationPhase: e.target.value as EducationPhase })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                >
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Tertiary">Tertiary</option>
                  <option value="Pre-primary">Pre-primary</option>
                </select>
              </div>
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

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="urgent"
                checked={formData.urgent}
                onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                className="w-4 h-4 border-gray-300 rounded"
              />
              <label htmlFor="urgent" className="text-sm font-bold text-[#1c1d1f]">
                Mark as urgent (will be highlighted to teachers)
              </label>
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
                className="flex-1 py-3 px-4 bg-[#a435f0] text-white font-bold hover:bg-[#8710d8] transition-colors"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
