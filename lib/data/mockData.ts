import { Teacher, School, Job, Application, User } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  { id: 'user-1', email: 'sarah.johnson@gmail.com', type: 'teacher', createdAt: '2024-01-15' },
  { id: 'user-2', email: 'michael.peters@gmail.com', type: 'teacher', createdAt: '2024-01-20' },
  { id: 'user-3', email: 'thandi.mkhize@gmail.com', type: 'teacher', createdAt: '2024-02-01' },
  { id: 'user-4', email: 'greenvalley@school.za', type: 'school', createdAt: '2024-01-10' },
  { id: 'user-5', email: 'sunnyside@school.za', type: 'school', createdAt: '2024-01-18' },
  { id: 'user-6', email: 'capetown.high@school.za', type: 'school', createdAt: '2024-02-05' },
];

// Mock Teachers
export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    userId: 'user-1',
    firstName: 'Sarah',
    surname: 'Johnson',
    email: 'sarah.johnson@gmail.com',
    description: 'Passionate mathematics teacher with 8 years of experience in secondary education. Specialized in making complex concepts accessible to all students through innovative teaching methods.',
    profilePicture: '/avatars/teacher1.jpg',
    educationPhase: ['Secondary'],
    subjects: ['Mathematics', 'Physical Science'],
    address: '123 Main Road, Cape Town',
    location: { lat: -33.9249, lng: 18.4241 },
    idNumber: '8901015800083',
    experience: [
      {
        id: 'exp-1',
        title: 'Mathematics Teacher',
        company: 'Cape Town High School',
        startDate: '2016-01-15',
        endDate: '2023-12-31',
        description: 'Taught Grade 10-12 Mathematics and Physical Science'
      }
    ],
    cv: '/documents/sarah-cv.pdf',
    qualifications: [
      {
        id: 'qual-1',
        name: 'Bachelor of Education - Mathematics',
        type: 'degree',
        url: '/documents/bed-math.pdf',
        uploadedAt: '2024-01-15'
      }
    ],
    idDocument: '/documents/id-sarah.pdf',
    criminalRecord: '/documents/criminal-sarah.pdf',
    faceVerified: true,
    profileCompleteness: 100,
    createdAt: '2024-01-15'
  },
  {
    id: 'teacher-2',
    userId: 'user-2',
    firstName: 'Michael',
    surname: 'Peters',
    email: 'michael.peters@gmail.com',
    description: 'Creative English and Drama teacher with a passion for literature and performing arts. Experienced in developing engaging curriculum and fostering critical thinking.',
    profilePicture: '/avatars/teacher2.jpg',
    educationPhase: ['Secondary'],
    subjects: ['English', 'Drama'],
    address: '45 Beach Road, Stellenbosch',
    location: { lat: -33.9321, lng: 18.8602 },
    idNumber: '8505128500087',
    experience: [
      {
        id: 'exp-2',
        title: 'English & Drama Teacher',
        company: 'Stellenbosch Secondary',
        startDate: '2018-02-01',
        description: 'Teaching English Home Language and Drama to Grades 8-11'
      }
    ],
    cv: '/documents/michael-cv.pdf',
    qualifications: [
      {
        id: 'qual-2',
        name: 'BA in English Literature',
        type: 'degree',
        url: '/documents/ba-english.pdf',
        uploadedAt: '2024-01-20'
      }
    ],
    idDocument: '/documents/id-michael.pdf',
    criminalRecord: '/documents/criminal-michael.pdf',
    faceVerified: true,
    profileCompleteness: 95,
    createdAt: '2024-01-20'
  },
  {
    id: 'teacher-3',
    userId: 'user-3',
    firstName: 'Thandi',
    surname: 'Mkhize',
    email: 'thandi.mkhize@gmail.com',
    description: 'Dedicated primary school teacher specializing in foundation phase education. Strong focus on inclusive education and early childhood development.',
    profilePicture: '/avatars/teacher3.jpg',
    educationPhase: ['Primary'],
    subjects: ['Life Skills', 'Mathematics', 'English', 'Afrikaans'],
    address: '78 Garden Street, Paarl',
    location: { lat: -33.7344, lng: 18.9624 },
    idNumber: '9203145400082',
    experience: [
      {
        id: 'exp-3',
        title: 'Foundation Phase Teacher',
        company: 'Paarl Primary School',
        startDate: '2015-01-15',
        description: 'Teaching Grade R-3 students across all subjects'
      }
    ],
    cv: '/documents/thandi-cv.pdf',
    qualifications: [
      {
        id: 'qual-3',
        name: 'Diploma in Foundation Phase Teaching',
        type: 'diploma',
        url: '/documents/dip-foundation.pdf',
        uploadedAt: '2024-02-01'
      }
    ],
    idDocument: '/documents/id-thandi.pdf',
    criminalRecord: '/documents/criminal-thandi.pdf',
    faceVerified: false,
    profileCompleteness: 85,
    createdAt: '2024-02-01'
  }
];

// Mock Schools
export const mockSchools: School[] = [
  {
    id: 'school-1',
    userId: 'user-4',
    name: 'Green Valley High School',
    email: 'greenvalley@school.za',
    description: 'A leading secondary school in Cape Town with a strong focus on academic excellence and holistic development. We pride ourselves on our modern facilities and dedicated teaching staff.',
    profilePicture: '/avatars/school1.jpg',
    emisNumber: '0102345678',
    district: 'Cape Winelands',
    schoolType: 'Secondary',
    ownershipType: 'Public',
    educationDistrict: 'Metro Central',
    curriculum: 'CAPS',
    address: '50 School Avenue, Cape Town, 7700',
    location: { lat: -33.9608, lng: 18.4604 },
    registrationCertificate: '/documents/cert-greenvalley.pdf',
    createdAt: '2024-01-10'
  },
  {
    id: 'school-2',
    userId: 'user-5',
    name: 'Sunnyside Primary',
    email: 'sunnyside@school.za',
    description: 'A warm and inclusive primary school serving the local community for over 30 years. We focus on nurturing young minds in a safe and supportive environment.',
    profilePicture: '/avatars/school2.jpg',
    emisNumber: '0102345679',
    district: 'Cape Winelands',
    schoolType: 'Primary',
    ownershipType: 'Public',
    educationDistrict: 'Metro East',
    curriculum: 'CAPS',
    address: '12 Sunshine Road, Stellenbosch, 7600',
    location: { lat: -33.9352, lng: 18.8526 },
    registrationCertificate: '/documents/cert-sunnyside.pdf',
    createdAt: '2024-01-18'
  },
  {
    id: 'school-3',
    userId: 'user-6',
    name: 'Cape Town International College',
    email: 'capetown.high@school.za',
    description: 'Private international school offering Cambridge curriculum. Modern facilities and small class sizes ensure personalized attention for each student.',
    profilePicture: '/avatars/school3.jpg',
    emisNumber: '0102345680',
    district: 'Metro',
    schoolType: 'Combined',
    ownershipType: 'Private',
    educationDistrict: 'Metro Central',
    curriculum: 'Cambridge',
    address: '89 International Drive, Cape Town, 8001',
    location: { lat: -33.9175, lng: 18.4231 },
    registrationCertificate: '/documents/cert-capetown.pdf',
    createdAt: '2024-02-05'
  }
];

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: 'job-1',
    schoolId: 'school-1',
    title: 'Mathematics Teacher - Grade 10-12',
    description: 'We are seeking an experienced Mathematics teacher to cover maternity leave from March to August. The ideal candidate will have strong subject knowledge and the ability to prepare students for final exams.',
    subject: 'Mathematics',
    startDate: '2024-03-15',
    endDate: '2024-08-30',
    applicationDeadline: '2024-02-28',
    requiredQualifications: 'Bachelor of Education in Mathematics or related field, SACE registered',
    educationPhase: 'Secondary',
    tags: ['Urgent'],
    status: 'Open',
    createdAt: '2024-02-10'
  },
  {
    id: 'job-2',
    schoolId: 'school-2',
    title: 'Foundation Phase Teacher - Grade 2',
    description: 'Looking for a patient and creative foundation phase teacher to cover sick leave for approximately 6 weeks. Experience with Grade 2 level preferred.',
    subject: 'General',
    startDate: '2024-02-26',
    endDate: '2024-04-05',
    applicationDeadline: '2024-02-23',
    requiredQualifications: 'Foundation Phase Teaching qualification, experience with Grade R-3',
    educationPhase: 'Primary',
    tags: ['Urgent', 'Short-term'],
    status: 'Open',
    createdAt: '2024-02-15'
  },
  {
    id: 'job-3',
    schoolId: 'school-1',
    title: 'Physical Science Teacher',
    description: 'Required for Term 2 to assist with increased student numbers. Will teach Grade 11 and 12 Physical Science.',
    subject: 'Physical Science',
    startDate: '2024-04-10',
    endDate: '2024-06-28',
    applicationDeadline: '2024-03-20',
    requiredQualifications: 'BSc or BEd with Physical Science specialization, teaching experience essential',
    educationPhase: 'Secondary',
    tags: [],
    status: 'Open',
    createdAt: '2024-02-12'
  },
  {
    id: 'job-4',
    schoolId: 'school-3',
    title: 'English Literature Teacher',
    description: 'Cambridge curriculum English Literature teacher needed for Grades 10-11. Must be familiar with Cambridge assessment requirements.',
    subject: 'English',
    startDate: '2024-03-01',
    endDate: '2024-07-31',
    applicationDeadline: '2024-02-25',
    requiredQualifications: 'BA in English or Education, Cambridge curriculum experience preferred',
    educationPhase: 'Secondary',
    tags: [],
    status: 'Open',
    createdAt: '2024-02-08'
  },
  {
    id: 'job-5',
    schoolId: 'school-2',
    title: 'Life Skills Teacher - Grade 5',
    description: 'Short-term position to cover teacher sabbatical. Will teach Life Skills and assist with sports activities.',
    subject: 'Life Skills',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    applicationDeadline: '2024-04-15',
    requiredQualifications: 'Teaching qualification, sports coaching experience beneficial',
    educationPhase: 'Primary',
    tags: [],
    status: 'Open',
    createdAt: '2024-02-14'
  }
];

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    teacherId: 'teacher-1',
    status: 'In Progress',
    appliedAt: '2024-02-11',
    shortlisted: true
  },
  {
    id: 'app-2',
    jobId: 'job-3',
    teacherId: 'teacher-1',
    status: 'Applied',
    appliedAt: '2024-02-13',
    shortlisted: false
  },
  {
    id: 'app-3',
    jobId: 'job-2',
    teacherId: 'teacher-3',
    status: 'Applied',
    appliedAt: '2024-02-16',
    shortlisted: true
  },
  {
    id: 'app-4',
    jobId: 'job-4',
    teacherId: 'teacher-2',
    status: 'In Progress',
    appliedAt: '2024-02-09',
    shortlisted: true
  }
];
