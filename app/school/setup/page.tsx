'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useSchoolProfile, useUpdateSchool } from '@/lib/hooks/useSchool';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { createClient } from '@/lib/supabase/client';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete';
import { SchoolType, OwnershipType, Curriculum } from '@/types';
import { Loader2, Building2, Camera, X } from 'lucide-react';

export default function SchoolSetupPage() {
  const { user } = useAuth();
  const { school, loading, refetch } = useSchoolProfile(user?.id);
  const { updateSchool, saving, error: saveError } = useUpdateSchool();
  const supabaseRef = useRef(createClient());

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
  const [hasChanges, setHasChanges] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Deferred profile picture upload
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [draggingPic, setDraggingPic] = useState(false);
  const [pendingPicFile, setPendingPicFile] = useState<File | null>(null);
  const [pendingPicPreview, setPendingPicPreview] = useState<string | null>(null);
  const [removedPic, setRemovedPic] = useState(false);

  // Deferred registration certificate upload
  const certInputRef = useRef<HTMLInputElement>(null);
  const [draggingCert, setDraggingCert] = useState(false);
  const [pendingCertFile, setPendingCertFile] = useState<File | null>(null);
  const [pendingCertPreview, setPendingCertPreview] = useState<string | null>(null);
  const [removedCert, setRemovedCert] = useState(false);

  const profilePicUrl = useSignedUrl('profile-pictures', profilePicture[0]);
  const displayPicUrl = pendingPicPreview || (removedPic ? null : profilePicUrl);
  const hasPic = pendingPicFile ? true : (!removedPic && profilePicture.length > 0);

  const certUrl = useSignedUrl('registration-certificates', registrationCertificate[0]);
  const displayCertName = pendingCertFile?.name || (removedCert ? null : (registrationCertificate[0] ? 'Registration Certificate' : null));
  const hasCert = pendingCertFile ? true : (!removedCert && registrationCertificate.length > 0);
  const displayCertUrl = pendingCertPreview || (removedCert ? null : certUrl);
  const isCertImage = pendingCertFile
    ? pendingCertFile.type.startsWith('image/')
    : /\.(jpg|jpeg|png|gif|webp)$/i.test(registrationCertificate[0] || '');

  const extractPath = (value: string, bucket: string) => {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = value.indexOf(marker);
    return idx !== -1 ? value.substring(idx + marker.length) : value;
  };

  const handleProfilePicSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return;
    if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
    setPendingPicFile(file);
    setPendingPicPreview(URL.createObjectURL(file));
    setRemovedPic(false);
  };

  const handleRemoveProfilePic = () => {
    if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
    setPendingPicFile(null);
    setPendingPicPreview(null);
    setRemovedPic(true);
  };

  const handleCertSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) return;
    if (pendingCertPreview) URL.revokeObjectURL(pendingCertPreview);
    setPendingCertFile(file);
    setPendingCertPreview(URL.createObjectURL(file));
    setRemovedCert(false);
  };

  const handleRemoveCert = () => {
    if (pendingCertPreview) URL.revokeObjectURL(pendingCertPreview);
    setPendingCertFile(null);
    setPendingCertPreview(null);
    setRemovedCert(true);
  };

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

  // Track unsaved changes
  useEffect(() => {
    if (!school) return;
    const changed =
      formData.name !== (school.name || '') ||
      formData.description !== (school.description || '') ||
      formData.emisNumber !== (school.emisNumber || '') ||
      formData.district !== (school.district || '') ||
      formData.schoolType !== (school.schoolType || 'Secondary') ||
      formData.ownershipType !== (school.ownershipType || 'Public') ||
      formData.educationDistrict !== (school.educationDistrict || '') ||
      formData.curriculum !== (school.curriculum || 'CAPS') ||
      formData.address !== (school.address || '') ||
      pendingPicFile !== null ||
      removedPic ||
      pendingCertFile !== null ||
      removedCert;
    setHasChanges(changed);
  }, [school, formData, pendingPicFile, removedPic, pendingCertFile, removedCert]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!school) return;

    // Handle profile picture upload/removal
    let picPath = profilePicture[0] || null;

    if (removedPic && profilePicture[0]) {
      const oldPath = extractPath(profilePicture[0], 'profile-pictures');
      await supabaseRef.current.storage.from('profile-pictures').remove([oldPath]);
      picPath = null;
    }

    if (pendingPicFile) {
      if (profilePicture[0]) {
        const oldPath = extractPath(profilePicture[0], 'profile-pictures');
        await supabaseRef.current.storage.from('profile-pictures').remove([oldPath]);
      }
      const ext = pendingPicFile.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${user?.id}/${fileName}`;
      const { error } = await supabaseRef.current.storage
        .from('profile-pictures')
        .upload(filePath, pendingPicFile);
      if (!error) {
        picPath = filePath;
      }
    }

    // Handle registration certificate upload/removal
    let certPath = registrationCertificate[0] || null;

    if (removedCert && registrationCertificate[0]) {
      const oldPath = extractPath(registrationCertificate[0], 'registration-certificates');
      await supabaseRef.current.storage.from('registration-certificates').remove([oldPath]);
      certPath = null;
    }

    if (pendingCertFile) {
      if (registrationCertificate[0]) {
        const oldPath = extractPath(registrationCertificate[0], 'registration-certificates');
        await supabaseRef.current.storage.from('registration-certificates').remove([oldPath]);
      }
      const ext = pendingCertFile.name.split('.').pop();
      const fileName = `cert-${Date.now()}.${ext}`;
      const filePath = `${user?.id}/${fileName}`;
      const { error } = await supabaseRef.current.storage
        .from('registration-certificates')
        .upload(filePath, pendingCertFile);
      if (!error) {
        certPath = filePath;
      }
    }

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
      profile_picture: picPath,
      registration_certificate: certPath,
    };

    if (location) {
      updates.location = location;
    }

    const success = await updateSchool(school.id, updates);
    if (success) {
      // Clean up pending state
      if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
      if (pendingCertPreview) URL.revokeObjectURL(pendingCertPreview);
      setPendingPicFile(null);
      setPendingPicPreview(null);
      setRemovedPic(false);
      setPendingCertFile(null);
      setPendingCertPreview(null);
      setRemovedCert(false);
      setHasChanges(false);
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleReset = () => {
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
      if (school.location) setLocation(school.location);
    }
    if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
    setPendingPicFile(null);
    setPendingPicPreview(null);
    setRemovedPic(false);
    if (pendingCertPreview) URL.revokeObjectURL(pendingCertPreview);
    setPendingCertFile(null);
    setPendingCertPreview(null);
    setRemovedCert(false);
    setHasChanges(false);
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
      <div className="p-8 pb-24">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">Profile Picture</h2>
              <div
                className={`flex items-center gap-6 p-4 rounded-lg border-2 border-dashed transition-colors ${
                  draggingPic ? 'border-[#2563eb] bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDraggingPic(true); }}
                onDragLeave={() => setDraggingPic(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggingPic(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    handleProfilePicSelect(file);
                  }
                }}
              >
                <div className="relative shrink-0">
                  {hasPic ? (
                    <div className="relative">
                      {displayPicUrl ? (
                        <img
                          src={displayPicUrl}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveProfilePic}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Building2 size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => profilePicInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded hover:bg-[#1d4ed8] transition-colors"
                  >
                    <Camera size={16} />
                    {hasPic ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Drag & drop or click to upload. JPG or PNG, max 5MB</p>
                </div>
                <input
                  ref={profilePicInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProfilePicSelect(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            {/* School Information */}
            <div className="bg-white border border-gray-300 p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#1c1d1f]">School Information</h2>

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
                <AddressAutocomplete
                  value={formData.address}
                  onChange={(addr) => setFormData({ ...formData, address: addr })}
                  onSelect={({ address: addr, lat, lng }) => {
                    setFormData(prev => ({ ...prev, address: addr }));
                    setLocation({ lat, lng });
                  }}
                  required
                  placeholder="Start typing your school address..."
                />
              </div>
            </div>

            {/* Registration Certificate */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">Registration Certificate</h2>
              <div
                className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                  draggingCert ? 'border-[#2563eb] bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDraggingCert(true); }}
                onDragLeave={() => setDraggingCert(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggingCert(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleCertSelect(file);
                }}
              >
                {hasCert ? (
                  <div className="flex items-center gap-3">
                    {isCertImage && displayCertUrl ? (
                      <img
                        src={displayCertUrl}
                        alt="Certificate"
                        className="w-16 h-16 rounded object-cover border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1c1d1f] truncate">
                        {displayCertName || 'Certificate uploaded'}
                      </p>
                      {!pendingCertFile && certUrl && (
                        <a href={certUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563eb] hover:underline">
                          View current file
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCert}
                      className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <button
                      type="button"
                      onClick={() => certInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 mx-auto bg-[#2563eb] text-white text-sm font-medium rounded hover:bg-[#1d4ed8] transition-colors"
                    >
                      Upload Certificate
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Drag & drop or click. PDF, JPG, or PNG, max 10MB</p>
                  </div>
                )}
                <input
                  ref={certInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCertSelect(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Floating save bar */}
      <div
        className={`fixed bottom-0 left-64 right-0 z-50 transition-all duration-300 ${
          hasChanges ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-center px-4 pb-4">
          <div className="w-full max-w-3xl">
            <div className="bg-[#1c1d1f] text-white rounded-lg shadow-2xl px-6 py-3 flex items-center justify-between">
              <p className="text-sm font-medium">
                Careful — you have unsaved changes!
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#2563eb] text-white text-sm font-bold rounded hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
