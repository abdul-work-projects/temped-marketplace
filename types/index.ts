export type UserType = 'teacher' | 'school' | 'admin';

export type EducationPhase = 'Foundation Phase' | 'Primary' | 'Secondary' | 'Tertiary';

export type SchoolType = 'Primary' | 'Secondary' | 'Pre-primary' | 'Combined';

export type OwnershipType = 'Public' | 'Private';

export type Curriculum = 'CAPS' | 'Cambridge' | 'IEB' | 'Other';

export type JobType = 'Permanent' | 'Temporary' | 'Invigilator' | 'Coach';

export type JobProgress = 'Open' | 'Interviewing' | 'Hired';

export type ApplicationStatus = 'Applied' | 'In Progress' | 'Hired' | 'Closed';

export type SportType = 'Tennis' | 'Rugby' | 'Netball' | 'Cricket' | 'Table tennis' | 'Soccer' | 'Hockey' | 'Athletics' | 'Cross country' | 'Other';

export type ArtsCultureType = 'Drama' | 'Debate' | 'Choir' | 'Other';

export type DocumentType = 'cv' | 'qualification' | 'id_document' | 'criminal_record' | 'selfie';

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export const REQUIRED_DOCUMENT_TYPES: DocumentType[] = ['cv', 'qualification', 'id_document', 'criminal_record', 'selfie'];

export type TestimonialStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  type: UserType;
}

export interface Reference {
  name: string;
  relationship: string;
  email: string;
  phone: string;
}

export interface Teacher {
  id: string;
  userId: string;
  firstName: string;
  surname: string;
  email: string;
  description?: string;
  profilePicture?: string;
  educationPhases: EducationPhase[];
  subjects: Record<string, string[]>;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  distanceRadius: number;
  dateOfBirth?: string;
  idNumber?: string;
  sports: Record<string, string[]>;
  artsCulture: Record<string, string[]>;
  teacherReferences: Reference[];
  experience?: Experience[];
  profileCompleteness: number;
  createdAt: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface School {
  id: string;
  userId: string;
  name: string;
  email: string;
  description?: string;
  profilePicture?: string;
  emisNumber?: string;
  district?: string;
  schoolType?: SchoolType;
  ownershipType?: OwnershipType;
  educationDistrict?: string;
  curriculum?: Curriculum;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  registrationCertificate?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  subject: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  requiredQualifications: string;
  educationPhase: EducationPhase;
  jobType: JobType;
  progress: JobProgress;
  tags: string[];
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  teacherId: string;
  status: ApplicationStatus;
  shortlisted: boolean;
  appliedAt: string;
}

export interface Testimonial {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromType: 'teacher' | 'school';
  comment: string;
  status: TestimonialStatus;
  createdAt: string;
}

export interface TeacherDocument {
  id: string;
  teacherId: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName?: string;
  status: DocumentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

