export type UserType = 'teacher' | 'school';

export type EducationPhase = 'Primary' | 'Secondary' | 'Tertiary' | 'Pre-primary' | 'Combined';

export type SchoolType = 'Primary' | 'Secondary' | 'Pre-primary' | 'Combined';

export type OwnershipType = 'Public' | 'Private';

export type Curriculum = 'CAPS' | 'Cambridge' | 'IEB' | 'Other';

export type JobStatus = 'Applied' | 'In Progress' | 'Hired' | 'Closed';

export interface User {
  id: string;
  email: string;
  type: UserType;
  createdAt: string;
}

export interface Teacher {
  id: string;
  userId: string;
  firstName: string;
  surname: string;
  email: string;
  description?: string;
  profilePicture?: string;
  educationPhase: EducationPhase[];
  subjects: string[];
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  idNumber?: string;
  experience?: Experience[];
  cv?: string;
  qualifications?: Document[];
  idDocument?: string;
  criminalRecord?: string;
  faceVerified?: boolean;
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
  tags: string[];
  status: 'Open' | 'Closed';
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  teacherId: string;
  status: JobStatus;
  appliedAt: string;
  shortlisted?: boolean;
}

export interface Review {
  id: string;
  fromId: string;
  toId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
