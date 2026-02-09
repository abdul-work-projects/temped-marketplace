'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminTeacherDetail } from '@/lib/hooks/useAdmin';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { isTeacherVerified, getVerificationSummary } from '@/lib/utils/verification';
import { DocumentType, TeacherDocument } from '@/types';
import ImageLightbox from '@/components/shared/ImageLightbox';
import {
  Loader2,
  ChevronLeft,
  ShieldCheck,
  X,
  FileText,
  GraduationCap,
  User,
  Check,
  AlertCircle,
  Camera,
} from 'lucide-react';

const ORDERED_DOCUMENT_TYPES: DocumentType[] = [
  'selfie',
  'id_document',
  'cv',
  'qualification',
  'criminal_record',
];

const DOC_LABELS: Record<DocumentType, string> = {
  cv: 'CV / Resume',
  qualification: 'Qualifications',
  id_document: 'ID / Passport / Driver\'s License',
  criminal_record: 'Criminal Record Check',
  selfie: 'Face Verification Selfie',
};

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];

function hasImageExtension(fileName?: string, fileUrl?: string): boolean {
  const name = (fileName || fileUrl || '').toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => name.endsWith(ext));
}

function DocStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/** Small thumbnail for inline document display */
function DocThumbnail({
  doc,
  onOpenLightbox,
}: {
  doc: TeacherDocument;
  onOpenLightbox: (src: string, alt: string) => void;
}) {
  const signedUrl = useSignedUrl('documents', doc.fileUrl);

  if (hasImageExtension(doc.fileName, doc.fileUrl) && signedUrl) {
    return (
      <img
        src={signedUrl}
        alt={doc.fileName || DOC_LABELS[doc.documentType]}
        className="w-20 h-20 object-cover rounded cursor-pointer border border-gray-200 hover:border-[#2563eb] transition-colors"
        onClick={() => onOpenLightbox(signedUrl, doc.fileName || DOC_LABELS[doc.documentType])}
      />
    );
  }

  if (signedUrl) {
    return (
      <button
        onClick={() => onOpenLightbox(signedUrl, doc.fileName || DOC_LABELS[doc.documentType])}
        className="w-20 h-20 flex flex-col items-center justify-center gap-1 bg-gray-100 rounded border border-gray-200 hover:border-[#2563eb] cursor-pointer transition-colors"
      >
        <FileText className="w-6 h-6 text-gray-500" />
        <span className="text-[10px] text-gray-500 truncate max-w-[72px]">{doc.fileName || 'View'}</span>
      </button>
    );
  }

  return (
    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
    </div>
  );
}

/** Side-by-side image used inside the comparison modal */
function CompareImage({ doc, label }: { doc: TeacherDocument | undefined; label: string }) {
  const signedUrl = useSignedUrl('documents', doc?.fileUrl);

  if (!doc) {
    return (
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">{label}</p>
        <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-400">Not uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
        <DocStatusBadge status={doc.status} />
      </div>
      {signedUrl ? (
        <img
          src={signedUrl}
          alt={doc.fileName || label}
          className="h-96 w-full object-contain rounded-lg border border-gray-200 bg-gray-50"
        />
      ) : (
        <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">
        {new Date(doc.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
}

export default function AdminVerifyTeacherDetail() {
  const { teacherId } = useParams() as { teacherId: string };
  const { teacher, documents, loading, reviewDocument } = useAdminTeacherDetail(teacherId);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const profilePicUrl = useSignedUrl('profile-pictures', teacher?.profilePicture);
  const verified = teacher ? isTeacherVerified(documents) : false;
  const summary = getVerificationSummary(documents);

  // Find best doc for comparison: prefer latest pending, fall back to latest of any status
  const selfieDoc = documents.find(d => d.documentType === 'selfie' && d.status === 'pending')
    || documents.find(d => d.documentType === 'selfie');
  const idDoc = documents.find(d => d.documentType === 'id_document' && d.status === 'pending')
    || documents.find(d => d.documentType === 'id_document');
  const canCompare = selfieDoc || idDoc;

  const openLightbox = (src: string, alt: string) => setLightbox({ src, alt });
  const closeLightbox = () => setLightbox(null);

  const handleApprove = async (docId: string) => {
    setActionLoading(true);
    setReviewingId(docId);
    await reviewDocument(docId, 'approved');
    setReviewingId(null);
    setActionLoading(false);
  };

  const handleReject = async (docId: string) => {
    setActionLoading(true);
    setReviewingId(docId);
    await reviewDocument(docId, 'rejected', rejectionReason || undefined);
    setReviewingId(null);
    setShowRejectInput(null);
    setRejectionReason('');
    setActionLoading(false);
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
            <Link href="/admin/verify" className="text-[#2563eb] hover:underline text-sm">
              Back to verification list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderActionButtons = (doc: TeacherDocument) => {
    if (doc.status !== 'pending') return null;

    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => handleApprove(doc.id)}
          disabled={actionLoading && reviewingId === doc.id}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded"
        >
          {actionLoading && reviewingId === doc.id ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          Approve
        </button>
        <button
          onClick={() => setShowRejectInput(showRejectInput === doc.id ? null : doc.id)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded"
        >
          <X className="w-3 h-3" />
          Reject
        </button>
      </div>
    );
  };

  const renderRejectInput = (docId: string) => {
    if (showRejectInput !== docId) return null;

    return (
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Reason for rejection (optional)..."
          className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-red-500"
        />
        <button
          onClick={() => handleReject(docId)}
          disabled={actionLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded"
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Confirm Reject'
          )}
        </button>
        <button
          onClick={() => { setShowRejectInput(null); setRejectionReason(''); }}
          className="px-3 py-2 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 rounded"
        >
          Cancel
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/admin/verify"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#2563eb] mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to verification list
          </Link>

          {/* Header */}
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={`${teacher.firstName} ${teacher.surname}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
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
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  {teacher.address && <span>{teacher.address}</span>}
                  {teacher.dateOfBirth && (
                    <span>DOB: {new Date(teacher.dateOfBirth).toLocaleDateString('en-ZA')}</span>
                  )}
                  {teacher.idNumber && <span>ID: {teacher.idNumber}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Profile Completeness</p>
                <p className="text-2xl font-bold text-[#1c1d1f]">{teacher.profileCompleteness}%</p>
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">Verification Checklist</h2>
            {verified ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  Teacher is VERIFIED — all required documents approved
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold">
                  <AlertCircle className="w-5 h-5" />
                  Teacher is NOT yet verified — review documents below
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {summary.map(({ type, hasApproved, hasPending }) => (
                <div key={type} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    hasApproved ? 'bg-green-500' : hasPending ? 'bg-yellow-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-xs font-medium text-gray-700 truncate">{DOC_LABELS[type]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Qualifications & Phases */}
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

          {/* Documents */}
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1c1d1f] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563eb]" />
                Documents
              </h2>
              {canCompare && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2563eb] border border-[#2563eb] rounded hover:bg-blue-50 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Compare Selfie & ID
                </button>
              )}
            </div>

            {/* All documents grouped by type */}
            <div className="space-y-6">
              {ORDERED_DOCUMENT_TYPES.map(type => {
                const docsOfType = documents.filter(d => d.documentType === type);

                return (
                  <div key={type} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-[#1c1d1f] mb-3">{DOC_LABELS[type]}</h3>

                    {docsOfType.length === 0 ? (
                      <p className="text-sm text-gray-400">Not uploaded yet</p>
                    ) : (
                      <div className="space-y-2">
                        {docsOfType.map(doc => (
                          <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                            <DocThumbnail doc={doc} onOpenLightbox={openLightbox} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#1c1d1f] truncate">
                                  {doc.fileName || DOC_LABELS[doc.documentType]}
                                </span>
                                <DocStatusBadge status={doc.status} />
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Uploaded {new Date(doc.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                {doc.reviewedAt && ` · Reviewed ${new Date(doc.reviewedAt).toLocaleDateString('en-ZA')}`}
                              </p>
                              {doc.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1">Reason: {doc.rejectionReason}</p>
                              )}
                            </div>
                            {renderActionButtons(doc)}
                          </div>
                        ))}

                        {/* Inline rejection reason input */}
                        {docsOfType.map(doc => renderRejectInput(doc.id))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

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

      {/* Compare Selfie & ID Modal */}
      {showCompareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowCompareModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#1c1d1f] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#2563eb]" />
                Face Verification — Selfie vs ID
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-4">
              <CompareImage doc={selfieDoc} label="Selfie" />
              <CompareImage doc={idDoc} label="ID Document" />
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          open={true}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
