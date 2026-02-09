'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useSchoolProfile, useUpdateSchool } from '@/lib/hooks/useSchool';
import FileUpload from '@/components/shared/FileUpload';
import { geocodeAddress } from '@/lib/utils/geocode';
import { SchoolType, OwnershipType, Curriculum } from '@/types';
import { Loader2, MapPin } from 'lucide-react';

export default function SchoolSetupPage() {
  const { user } = useAuth();
  const { school, loading } = useSchoolProfile(user?.id);
  const { updateSchool, saving, error: saveError } = useUpdateSchool();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emisNumber: '',
    district: '',
    schoolType: 'Secondary' as SchoolType,
    ownershipType: 'Public' as OwnershipType,
    educationDistrict: '',
    curriculum: 'CAPS' as Curriculum,
    address: '',
  });

  const [profilePicture, setProfilePicture] = useState<string[]>([]);
  const [registrationCertificate, setRegistrationCertificate] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        description: school.description || '',
        emisNumber: school.emisNumber || '',
        district: school.district || '',
        schoolType: school.schoolType || 'Secondary',
        ownershipType: school.ownershipType || 'Public',
        educationDistrict: school.educationDistrict || '',
        curriculum: school.curriculum || 'CAPS',
        address: school.address || '',
      });
      if (school.profilePicture) setProfilePicture([school.profilePicture]);
      if (school.registrationCertificate) setRegistrationCertificate([school.registrationCertificate]);
      if (school.location) setLocation(school.location);
    }
  }, [school]);

  const handleGeocode = async () => {
    if (!formData.address.trim()) return;
    setGeocoding(true);
    setGeocodeResult(null);

    const result = await geocodeAddress(formData.address);
    if (result) {
      setLocation(result);
      setGeocodeResult(`Location found: ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`);
    } else {
      setGeocodeResult('Could not find location for this address');
    }
    setGeocoding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    const updates: Record<string, unknown> = {
      name: formData.name,
      description: formData.description,
      emis_number: formData.emisNumber,
      district: formData.district,
      school_type: formData.schoolType,
      ownership_type: formData.ownershipType,
      education_district: formData.educationDistrict,
      curriculum: formData.curriculum,
      address: formData.address,
      profile_picture: profilePicture[0] || null,
      registration_certificate: registrationCertificate[0] || null,
    };

    if (location) {
      updates.location = location;
    }

    const success = await updateSchool(school.id, updates);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

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
              <p className="text-green-700 font-medium">Profile saved successfully!</p>
            </div>
          )}

          {saveError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Error: {saveError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6 space-y-6">
            <FileUpload
              bucket="profile-pictures"
              folder={school?.id || 'unknown'}
              accept="image/*"
              maxFiles={1}
              label="Profile Picture"
              existingFiles={profilePicture}
              onUploadComplete={(urls) => setProfilePicture(urls)}
              onRemove={() => setProfilePicture([])}
            />

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
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                  placeholder="Street, City, Postal Code"
                />
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={geocoding || !formData.address.trim()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-[#1c1d1f] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {geocoding ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <MapPin size={16} />
                  )}
                  Geocode
                </button>
              </div>
              {geocodeResult && (
                <p className={`mt-1 text-sm ${location ? 'text-green-600' : 'text-red-600'}`}>
                  {geocodeResult}
                </p>
              )}
            </div>

            <FileUpload
              bucket="registration-certificates"
              folder={school?.id || 'unknown'}
              accept=".pdf,.jpg,.jpeg,.png"
              maxFiles={1}
              label="Registration Certificate"
              existingFiles={registrationCertificate}
              onUploadComplete={(urls) => setRegistrationCertificate(urls)}
              onRemove={() => setRegistrationCertificate([])}
            />

            <div className="pt-4 border-t border-gray-300">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={20} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
