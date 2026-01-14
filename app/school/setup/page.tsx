'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { SchoolType, OwnershipType, Curriculum } from '@/types';

export default function SchoolSetupPage() {
  const { user } = useAuth();
  const { getSchoolByUserId, updateSchool } = useData();

  const school = user ? getSchoolByUserId(user.id) : null;

  const [formData, setFormData] = useState({
    name: school?.name || '',
    description: school?.description || '',
    emisNumber: school?.emisNumber || '',
    district: school?.district || '',
    schoolType: school?.schoolType || 'Secondary' as SchoolType,
    ownershipType: school?.ownershipType || 'Public' as OwnershipType,
    educationDistrict: school?.educationDistrict || '',
    curriculum: school?.curriculum || 'CAPS' as Curriculum,
    address: school?.address || ''
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    updateSchool(school.id, formData);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">School Profile Setup</h1>
            <p className="text-gray-600">
              Complete your school profile to start posting jobs
            </p>
          </div>

          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">✓ Profile saved successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                School Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                School Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                placeholder="Tell teachers about your school, its values, and environment..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  EMIS Number
                </label>
                <input
                  type="text"
                  value={formData.emisNumber}
                  onChange={(e) => setFormData({ ...formData, emisNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                  placeholder="e.g., Cape Winelands"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  School Type *
                </label>
                <select
                  required
                  value={formData.schoolType}
                  onChange={(e) => setFormData({ ...formData, schoolType: e.target.value as SchoolType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                >
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Pre-primary">Pre-primary</option>
                  <option value="Combined">Combined</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Ownership Type *
                </label>
                <select
                  required
                  value={formData.ownershipType}
                  onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value as OwnershipType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Education District
                </label>
                <input
                  type="text"
                  value={formData.educationDistrict}
                  onChange={(e) => setFormData({ ...formData, educationDistrict: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                  placeholder="e.g., Metro East"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Curriculum *
                </label>
                <select
                  required
                  value={formData.curriculum}
                  onChange={(e) => setFormData({ ...formData, curriculum: e.target.value as Curriculum })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                >
                  <option value="CAPS">CAPS</option>
                  <option value="Cambridge">Cambridge</option>
                  <option value="IEB">IEB</option>
                  <option value="Other">Other</option>
                </select>
              </div>
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

            <div className="pt-4 border-t border-gray-300">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#a435f0] text-white font-bold hover:bg-[#8710d8] transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
