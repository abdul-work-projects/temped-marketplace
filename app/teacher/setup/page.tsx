'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { EducationPhase } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';

export default function TeacherSetupPage() {
  const { user } = useAuth();
  const { getTeacherByUserId, updateTeacher, teachers } = useData();

  const teacher = user ? getTeacherByUserId(user.id) : null;

  const [formData, setFormData] = useState({
    firstName: teacher?.firstName || '',
    surname: teacher?.surname || '',
    description: teacher?.description || '',
    educationPhase: teacher?.educationPhase || [],
    subjects: teacher?.subjects?.join(', ') || '',
    address: teacher?.address || '',
    idNumber: teacher?.idNumber || ''
  });

  const [saved, setSaved] = useState(false);

  // Calculate profile completeness
  const calculateCompleteness = () => {
    const fields = [
      formData.firstName,
      formData.surname,
      formData.description,
      formData.educationPhase.length > 0,
      formData.subjects,
      formData.address,
      formData.idNumber
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    updateTeacher(teacher.id, {
      ...formData,
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      profileCompleteness: completeness
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhaseToggle = (phase: EducationPhase) => {
    setFormData(prev => ({
      ...prev,
      educationPhase: prev.educationPhase.includes(phase)
        ? prev.educationPhase.filter(p => p !== phase)
        : [...prev.educationPhase, phase]
    }));
  };

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Setup</h1>
            <p className="text-gray-600">
              Complete your profile to start applying for jobs
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
              <span className="text-sm font-bold text-blue-600">{completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">✓ Profile saved successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description (up to 500 words)
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell schools about yourself, your teaching philosophy, and experience..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Phase *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Primary', 'Secondary', 'Tertiary'] as EducationPhase[]).map(phase => (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => handlePhaseToggle(phase)}
                    className={`py-2 px-4 border-2 rounded-lg font-medium transition-colors ${
                      formData.educationPhase.includes(phase)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects (comma-separated) *
              </label>
              <input
                type="text"
                required
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mathematics, Physical Science, English"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street, City, Postal Code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Number *
              </label>
              <input
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="South African ID number"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Note for Demo</h3>
            <p className="text-sm text-blue-700">
              In the full version, you'll be able to upload documents (CV, qualifications, ID, criminal record) and complete face verification. For this demo, these features are indicated but not fully implemented.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
