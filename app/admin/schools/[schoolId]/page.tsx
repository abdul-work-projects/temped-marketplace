'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminSchoolDetail } from '@/lib/hooks/useAdmin';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import {
  Loader2,
  ChevronLeft,
  Edit,
  Save,
  School,
  FileText,
  Eye,
  MapPin,
} from 'lucide-react';

function DocumentLink({ label, url, bucket }: { label: string; url?: string; bucket: string }) {
  const signedUrl = useSignedUrl(bucket, url);

  if (!url) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
        <FileText className="w-5 h-5 text-gray-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-xs text-gray-400">Not uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded">
      <FileText className="w-5 h-5 text-[#2563eb]" />
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1c1d1f]">{label}</p>
      </div>
      {signedUrl ? (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 transition-colors"
        >
          <Eye className="w-3 h-3" />
          View
        </a>
      ) : (
        <span className="text-xs text-gray-400">Loading...</span>
      )}
    </div>
  );
}

export default function AdminSchoolDetail() {
  const { schoolId } = useParams() as { schoolId: string };
  const { school, loading, updateSchool } = useAdminSchoolDetail(schoolId);
  const profilePicUrl = useSignedUrl('profile-pictures', school?.profilePicture);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    address: '',
    district: '',
    emis_number: '',
    education_district: '',
  });

  useEffect(() => {
    if (school) {
      setEditData({
        name: school.name || '',
        description: school.description || '',
        address: school.address || '',
        district: school.district || '',
        emis_number: school.emisNumber || '',
        education_district: school.educationDistrict || '',
      });
    }
  }, [school]);

  const handleSave = async () => {
    setSaving(true);
    await updateSchool(schoolId, editData);
    setSaving(false);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <h2 className="text-xl font-bold text-[#1c1d1f] mb-2">School not found</h2>
            <Link href="/admin/schools" className="text-[#2563eb] hover:underline text-sm">
              Back to schools list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/admin/schools"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#2563eb] mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to schools
          </Link>

          {/* Header */}
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={school.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <School className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1c1d1f] mb-1">{school.name}</h1>
                  <p className="text-gray-600 text-sm">{school.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {school.emisNumber && <span>EMIS: {school.emisNumber}</span>}
                    {school.schoolType && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {school.schoolType}
                      </span>
                    )}
                    {school.ownershipType && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {school.ownershipType}
                      </span>
                    )}
                    {school.curriculum && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                        {school.curriculum}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    if (school) {
                      setEditData({
                        name: school.name || '',
                        description: school.description || '',
                        address: school.address || '',
                        district: school.district || '',
                        emis_number: school.emisNumber || '',
                        education_district: school.educationDistrict || '',
                      });
                    }
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">School Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  School Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
                  />
                ) : (
                  <p className="text-sm text-[#1c1d1f]">{school.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  EMIS Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.emis_number}
                    onChange={(e) => setEditData({ ...editData, emis_number: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
                  />
                ) : (
                  <p className="text-sm text-[#1c1d1f]">{school.emisNumber || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  District
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.district}
                    onChange={(e) => setEditData({ ...editData, district: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
                  />
                ) : (
                  <p className="text-sm text-[#1c1d1f]">{school.district || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Education District
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.education_district}
                    onChange={(e) => setEditData({ ...editData, education_district: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
                  />
                ) : (
                  <p className="text-sm text-[#1c1d1f]">{school.educationDistrict || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
                />
              ) : (
                <p className="text-sm text-[#1c1d1f] flex items-center gap-1">
                  {school.address ? (
                    <>
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {school.address}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb] resize-none"
                />
              ) : (
                <p className="text-sm text-[#1c1d1f]">{school.description || 'No description provided'}</p>
              )}
            </div>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white text-sm font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            )}
          </div>

          {/* Read-only Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">School Type</h3>
              <p className="text-sm text-[#1c1d1f] font-medium">{school.schoolType || 'Not specified'}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Ownership</h3>
              <p className="text-sm text-[#1c1d1f] font-medium">{school.ownershipType || 'Not specified'}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Curriculum</h3>
              <p className="text-sm text-[#1c1d1f] font-medium">{school.curriculum || 'Not specified'}</p>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#1c1d1f] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2563eb]" />
              Documents
            </h2>
            <div className="space-y-3">
              <DocumentLink label="Registration Certificate" url={school.registrationCertificate} bucket="registration-certificates" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
