import { Teacher, EducationPhase } from '@/types';

export function mapTeacherRow(row: Record<string, unknown>): Teacher {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    firstName: row.first_name as string,
    surname: row.surname as string,
    email: row.email as string,
    description: row.description as string | undefined,
    profilePicture: row.profile_picture as string | undefined,
    educationPhases: (row.education_phases as EducationPhase[]) || [],
    subjects: (row.subjects as Record<string, string[]>) || {},
    address: row.address as string | undefined,
    location: row.location as { lat: number; lng: number } | undefined,
    distanceRadius: (row.distance_radius as number) || 50,
    dateOfBirth: row.date_of_birth as string | undefined,
    idNumber: row.id_number as string | undefined,
    sports: (row.sports as Record<string, string[]>) || {},
    artsCulture: (row.arts_culture as Record<string, string[]>) || {},
    teacherReferences: (row.teacher_references as Teacher['teacherReferences']) || [],
    profileCompleteness: (row.profile_completeness as number) || 0,
    createdAt: row.created_at as string,
  };
}
