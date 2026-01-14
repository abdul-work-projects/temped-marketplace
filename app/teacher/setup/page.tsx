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
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Profile Setup</h1>
            <p className="text-gray-600">
              Complete your profile to start applying for jobs
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white border border-gray-300 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">Profile Completeness</span>
              <span className="text-sm font-bold text-[#a435f0]">{completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3">
              <div
                className="bg-[#a435f0] h-3 transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">✓ Profile saved successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Short Description (up to 500 words)
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                placeholder="Tell schools about yourself, your teaching philosophy, and experience..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Education Phase *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Primary', 'Secondary', 'Tertiary'] as EducationPhase[]).map(phase => (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => handlePhaseToggle(phase)}
                    className={`py-2 px-4 border-2 font-bold transition-colors ${
                      formData.educationPhase.includes(phase)
                        ? 'border-[#1c1d1f] bg-gray-50 text-[#1c1d1f]'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Subjects (comma-separated) *
              </label>
              <input
                type="text"
                required
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                placeholder="e.g., Mathematics, Physical Science, English"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                placeholder="Street, City, Postal Code"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                ID Number *
              </label>
              <input
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                placeholder="South African ID number"
              />
            </div>

            <div className="pt-4 border-t border-gray-300">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#a435f0] text-white font-bold hover:bg-[#8710d8] transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>

          <div className="mt-6 bg-gray-50 border border-gray-300 p-4">
            <h3 className="font-bold text-[#1c1d1f] mb-2">Note for Demo</h3>
            <p className="text-sm text-gray-600">
              In the full version, you'll be able to upload documents (CV, qualifications, ID, criminal record) and complete face verification. For this demo, these features are indicated but not fully implemented.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
