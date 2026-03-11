import { TeacherDocument, Qualification, DocumentType, REQUIRED_DOCUMENT_TYPES } from '@/types';

export function isTeacherVerified(documents: TeacherDocument[], qualifications?: Qualification[]): boolean {
  const docsVerified = REQUIRED_DOCUMENT_TYPES.every(type =>
    documents.some(doc => doc.documentType === type && doc.status === 'approved')
  );

  // Qualifications must exist and all must be approved
  const qualsVerified = qualifications
    ? qualifications.length > 0 && qualifications.every(q => q.status === 'approved')
    : true; // If qualifications not provided, don't block (backwards compat)

  return docsVerified && qualsVerified;
}

export interface DocumentTypeSummary {
  type: DocumentType;
  hasApproved: boolean;
  hasPending: boolean;
  latestRejection?: TeacherDocument;
  latest?: TeacherDocument;
}

export function getVerificationSummary(documents: TeacherDocument[]): DocumentTypeSummary[] {
  return REQUIRED_DOCUMENT_TYPES.map(type => {
    const docsOfType = documents.filter(d => d.documentType === type);
    const latest = docsOfType[0]; // already sorted by created_at DESC
    return {
      type,
      hasApproved: docsOfType.some(d => d.status === 'approved'),
      hasPending: docsOfType.some(d => d.status === 'pending'),
      latestRejection: docsOfType.find(d => d.status === 'rejected'),
      latest,
    };
  });
}

export interface QualificationSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  allApproved: boolean;
}

export function getQualificationSummary(qualifications: Qualification[]): QualificationSummary {
  return {
    total: qualifications.length,
    approved: qualifications.filter(q => q.status === 'approved').length,
    pending: qualifications.filter(q => q.status === 'pending').length,
    rejected: qualifications.filter(q => q.status === 'rejected').length,
    allApproved: qualifications.length > 0 && qualifications.every(q => q.status === 'approved'),
  };
}

export function getPendingCount(documents: TeacherDocument[], qualifications?: Qualification[]): number {
  const docsPending = documents.filter(d => d.status === 'pending').length;
  const qualsPending = qualifications ? qualifications.filter(q => q.status === 'pending').length : 0;
  return docsPending + qualsPending;
}
