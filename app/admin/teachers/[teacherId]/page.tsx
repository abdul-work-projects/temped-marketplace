'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminTeacherDetail } from '@/lib/hooks/useAdmin';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { isTeacherVerified } from '@/lib/utils/verification';
import { DocumentType } from '@/types';

const ORDERED_DOCUMENT_TYPES: DocumentType[] = [
  'selfie',
  'id_document',
  'cv',
  'qualification',
  'criminal_record',
];
import {
  Loader2,
  ChevronLeft,
  Edit,
  Save,
  ShieldCheck,
  User,
  FileText,
  Eye,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

function SignedDocLink({ fileUrl, children, className }: { fileUrl: string; children: React.ReactNode; className?: string }) {
  const url = useSignedUrl('documents', fileUrl);
  if (!url) return <span className={className}>{children}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

const DOC_LABELS: Record<DocumentType, string> = {
  cv: 'CV / Resume',
  qualification: 'Qualifications',
  id_document: 'ID / Passport / Driver\'s License',
  criminal_record: 'Criminal Record Check',
  selfie: 'Face Verification Selfie',
};

export default function AdminTeacherDetail() {
  const { teacherId } = useParams() as { teacherId: string };
  const { teacher, documents, loading, updateTeacher } = useAdminTeacherDetail(teacherId);
  const profilePicUrl = useSignedUrl('profile-pictures', teacher?.profilePicture);
  const verified = teacher ? isTeacherVerified(documents) : false;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    surname: '',
    description: '',
    address: '',
  });

  useEffect(() => {
    if (teacher) {
      setEditData({
        first_name: teacher.firstName || '',
        surname: teacher.surname || '',
        description: teacher.description || '',
        address: teacher.address || '',
      });
    }
  }, [teacher]);

  const handleSave = async () => {
    setSaving(true);
    await updateTeacher(teacherId, editData);
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

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <h2 className="text-xl font-bold text-[#1c1d1f] mb-2">Teacher not found</h2>
            <Link href="/admin/teachers" className="text-[#2563eb] hover:underline text-sm">
              Back to teachers list
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
            href="/admin/teachers"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#2563eb] mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to teachers
          </Link>

          {/* Header */}
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={`${teacher.firstName} ${teacher.surname}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-[#1c1d1f]">
                      {teacher.firstName} {teacher.surname}
                    </h1>
                    {verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{teacher.email}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>Profile: {teacher.profileCompleteness}%</span>
                    {teacher.dateOfBirth && (
                      <span>DOB: {new Date(teacher.dateOfBirth).toLocaleDateString('en-ZA')}</span>
                    )}
                    {teacher.idNumber && <span>ID: {teacher.idNumber}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    // Reset to original values
                    if (teacher) {
                      setEditData({
                        first_name: teacher.firstName || '',
                        surname: teacher.surname || '',
                        description: teacher.description || '',
                        address: teacher.address || '',
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
            <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.first_name}
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
                  />
                ) : (
                  <p className="text-sm text-[#1c1d1f]">{teacher.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Surname
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.surname}
                    onChange={(e) => setEditData({ ...editData, surname: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
                  />
                ) : (
                  <p className="text-sm text-[#1c1d1f]">{teacher.surname}</p>
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
                <p className="text-sm text-[#1c1d1f]">{teacher.address || 'Not provided'}</p>
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
                <p className="text-sm text-[#1c1d1f]">{teacher.description || 'No description provided'}</p>
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

          {/* Education & Subjects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2563eb]" />
                Education Phases
              </h2>
              {teacher.educationPhases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.educationPhases.map((phase) => (
                    <span
                      key={phase}
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-[#2563eb] text-xs font-medium rounded-full"
                    >
                      {phase}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No education phases specified</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">Subjects</h2>
              {Object.keys(teacher.subjects).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(teacher.subjects).map(([phase, subjects]) => (
                    <div key={phase}>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">{phase}</p>
                      <div className="flex flex-wrap gap-1">
                        {subjects.map((subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No subjects specified</p>
              )}
            </div>
          </div>

          {/* Extra-curricular */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">Sports</h2>
              {Object.keys(teacher.sports).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(teacher.sports).map(([phase, items]) => (
                    <div key={phase}>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">{phase}</p>
                      <div className="flex flex-wrap gap-1">
                        {items.map((sport) => (
                          <span
                            key={sport}
                            className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
                          >
                            {sport}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No sports specified</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">Arts & Culture</h2>
              {Object.keys(teacher.artsCulture).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(teacher.artsCulture).map(([phase, items]) => (
                    <div key={phase}>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">{phase}</p>
                      <div className="flex flex-wrap gap-1">
                        {items.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No arts & culture specified</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1c1d1f] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2563eb]" />
              Documents
            </h2>
            <div className="space-y-4">
              {ORDERED_DOCUMENT_TYPES.map(type => {
                const docsOfType = documents.filter(d => d.documentType === type);
                return (
                  <div key={type}>
                    <p className="text-sm font-bold text-[#1c1d1f] mb-2">{DOC_LABELS[type]}</p>
                    {docsOfType.length === 0 ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-400">Not uploaded</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {docsOfType.map(doc => (
                          <div key={doc.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded">
                            <FileText className="w-5 h-5 text-[#2563eb]" />
                            <div className="flex-1 min-w-0">
                              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                                doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                doc.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                              </span>
                              {doc.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1">Reason: {doc.rejectionReason}</p>
                              )}
                            </div>
                            <SignedDocLink
                              fileUrl={doc.fileUrl}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </SignedDocLink>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience */}
          {teacher.experience && teacher.experience.length > 0 && (
            <div className="bg-white border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#2563eb]" />
                Experience
              </h2>
              <div className="space-y-4">
                {teacher.experience.map((exp) => (
                  <div key={exp.id} className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm font-bold text-[#1c1d1f]">{exp.title}</p>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(exp.startDate).toLocaleDateString('en-ZA')}
                      {' - '}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString('en-ZA')
                        : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {teacher.teacherReferences && teacher.teacherReferences.length > 0 && (
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">References</h2>
              <div className="space-y-3">
                {teacher.teacherReferences.map((ref, index) => (
                  <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm font-medium text-[#1c1d1f]">{ref.name}</p>
                    <p className="text-xs text-gray-500">{ref.relationship}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-600">
                      <span>{ref.email}</span>
                      <span>{ref.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
