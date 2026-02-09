import { TeacherDocument, DocumentType, REQUIRED_DOCUMENT_TYPES } from '@/types';

export function isTeacherVerified(documents: TeacherDocument[]): boolean {
  return REQUIRED_DOCUMENT_TYPES.every(type =>
    documents.some(doc => doc.documentType === type && doc.status === 'approved')
  );
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

export function getPendingCount(documents: TeacherDocument[]): number {
  return documents.filter(d => d.status === 'pending').length;
}
