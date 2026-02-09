'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Teacher, School, Testimonial, TeacherDocument, DocumentType, REQUIRED_DOCUMENT_TYPES } from '@/types';
import { mapTeacherRow } from '@/lib/utils/mapTeacherRow';

// Fetch user IDs that are admins, so we can exclude them from teacher lists.
// teachers table has no direct FK to profiles, so we filter client-side.
async function getAdminUserIds(supabase: ReturnType<typeof createClient>): Promise<string[]> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_type', 'admin');
  return (data || []).map((p: { id: string }) => p.id);
}

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalSchools: 0,
    pendingTestimonials: 0,
    pendingDocuments: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const fetch = async () => {
      try {
        const adminIds = await getAdminUserIds(supabaseRef.current);

        let teacherQuery = supabaseRef.current.from('teachers').select('id', { count: 'exact', head: true });
        if (adminIds.length > 0) {
          teacherQuery = teacherQuery.not('user_id', 'in', `(${adminIds.join(',')})`);
        }

        const [teachersRes, schoolsRes, testimonialRes, pendingDocsRes] = await Promise.all([
          teacherQuery,
          supabaseRef.current.from('schools').select('id', { count: 'exact', head: true }),
          supabaseRef.current.from('testimonials').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabaseRef.current.from('teacher_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        setStats({
          totalTeachers: teachersRes.count || 0,
          totalSchools: schoolsRes.count || 0,
          pendingTestimonials: testimonialRes.count || 0,
          pendingDocuments: pendingDocsRes.count || 0,
        });
      } catch {
        // prevent loading stuck
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { stats, loading };
}

export interface TestimonialProfileInfo {
  name: string;
  profileUrl: string;
  type: 'teacher' | 'school';
  address?: string;
  email?: string;
  educationPhases?: string[];
  subjects?: string[];
  schoolType?: string;
  curriculum?: string;
}

async function resolveUserProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  userType: 'teacher' | 'school'
): Promise<TestimonialProfileInfo> {
  if (userType === 'teacher') {
    const { data } = await supabase
      .from('teachers')
      .select('id, first_name, surname, email, address, education_phases, subjects')
      .eq('user_id', userId)
      .single();
    if (data) {
      const subjects = data.subjects as Record<string, string[]> | null;
      return {
        name: `${data.first_name} ${data.surname}`,
        profileUrl: `/admin/teachers/${data.id}`,
        type: 'teacher',
        address: data.address as string | undefined,
        email: data.email as string | undefined,
        educationPhases: data.education_phases as string[] | undefined,
        subjects: subjects ? [...new Set(Object.values(subjects).flat())].slice(0, 4) : undefined,
      };
    }
  } else {
    const { data } = await supabase
      .from('schools')
      .select('id, name, email, address, school_type, curriculum')
      .eq('user_id', userId)
      .single();
    if (data) {
      return {
        name: data.name as string,
        profileUrl: `/admin/schools/${data.id}`,
        type: 'school',
        address: data.address as string | undefined,
        email: data.email as string | undefined,
        schoolType: data.school_type as string | undefined,
        curriculum: data.curriculum as string | undefined,
      };
    }
  }
  return { name: userId, profileUrl: '', type: userType };
}

export interface AdminTestimonial extends Testimonial {
  fromName: string;
  fromProfileUrl: string;
  fromProfile: TestimonialProfileInfo;
  toName: string;
  toProfileUrl: string;
  toProfile: TestimonialProfileInfo;
}

export function useAdminTestimonials(statusFilter: string) {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabaseRef.current
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;

      if (data) {
        const resolved: AdminTestimonial[] = [];
        for (const row of data) {
          const fromType = row.from_type as 'teacher' | 'school';
          const toType = fromType === 'teacher' ? 'school' : 'teacher';
          const [fromProfile, toProfile] = await Promise.all([
            resolveUserProfile(supabaseRef.current, row.from_user_id as string, fromType),
            resolveUserProfile(supabaseRef.current, row.to_user_id as string, toType),
          ]);
          resolved.push({
            id: row.id as string,
            fromUserId: row.from_user_id as string,
            toUserId: row.to_user_id as string,
            fromType,
            comment: row.comment as string,
            status: row.status as Testimonial['status'],
            createdAt: row.created_at as string,
            fromName: fromProfile.name,
            fromProfileUrl: fromProfile.profileUrl,
            fromProfile,
            toName: toProfile.name,
            toProfileUrl: toProfile.profileUrl,
            toProfile,
          });
        }
        setTestimonials(resolved);
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const updateTestimonialStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabaseRef.current
        .from('testimonials')
        .update({ status })
        .eq('id', id);

      if (!error) {
        await fetchTestimonials();
      }
      return { success: !error };
    } catch {
      return { success: false };
    }
  };

  return { testimonials, loading, updateTestimonialStatus, refetch: fetchTestimonials };
}

function mapDocumentRow(row: Record<string, unknown>): TeacherDocument {
  return {
    id: row.id as string,
    teacherId: row.teacher_id as string,
    documentType: row.document_type as DocumentType,
    fileUrl: row.file_url as string,
    fileName: row.file_name as string | undefined,
    status: row.status as TeacherDocument['status'],
    reviewedBy: row.reviewed_by as string | undefined,
    reviewedAt: row.reviewed_at as string | undefined,
    rejectionReason: row.rejection_reason as string | undefined,
    createdAt: row.created_at as string,
  };
}

export function useUnverifiedTeachers() {
  const [teachers, setTeachers] = useState<Array<Teacher & { documents: TeacherDocument[] }>>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const adminIds = await getAdminUserIds(supabaseRef.current);

      let query = supabaseRef.current
        .from('teachers')
        .select('*, teacher_documents(*)')
        .order('created_at', { ascending: false });

      if (adminIds.length > 0) {
        query = query.not('user_id', 'in', `(${adminIds.join(',')})`);
      }

      const { data } = await query;

      if (data) {
        const mapped = data.map((row: Record<string, unknown>) => {
          const docs = (row.teacher_documents as Record<string, unknown>[]) || [];
          return {
            ...mapTeacherRow(row),
            documents: docs.map(mapDocumentRow),
          };
        });
        // Filter to teachers missing any required approved doc type
        const unverified = mapped.filter((t: { documents: TeacherDocument[] }) =>
          REQUIRED_DOCUMENT_TYPES.some((type: DocumentType) =>
            !t.documents.some((d: TeacherDocument) => d.documentType === type && d.status === 'approved')
          )
        );
        setTeachers(unverified);
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return { teachers, loading, refetch: fetchTeachers };
}

export function useAdminTeacherDetail(teacherId: string | undefined) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [documents, setDocuments] = useState<TeacherDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchTeacher = useCallback(async () => {
    if (!teacherId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabaseRef.current
        .from('teachers')
        .select('*, teacher_documents(*)')
        .eq('id', teacherId)
        .single();

      if (data) {
        const docs = (data.teacher_documents as Record<string, unknown>[]) || [];
        setTeacher(mapTeacherRow(data as Record<string, unknown>));
        setDocuments(docs.map(mapDocumentRow).sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  const reviewDocument = async (docId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      const { data: { user } } = await supabaseRef.current.auth.getUser();
      const { error } = await supabaseRef.current
        .from('teacher_documents')
        .update({
          status,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
        })
        .eq('id', docId);

      if (!error) {
        await fetchTeacher();
      }
      return { success: !error };
    } catch {
      return { success: false };
    }
  };

  const updateTeacher = async (id: string, updates: Record<string, unknown>) => {
    try {
      const { error } = await supabaseRef.current
        .from('teachers')
        .update(updates)
        .eq('id', id);

      if (!error) {
        await fetchTeacher();
      }
      return { success: !error };
    } catch {
      return { success: false };
    }
  };

  return { teacher, documents, loading, reviewDocument, updateTeacher, refetch: fetchTeacher };
}

export function useAdminSearchTeachers() {
  const [teachers, setTeachers] = useState<Array<Teacher & { documents: TeacherDocument[] }>>([]);
  const [loading, setLoading] = useState(false);
  const supabaseRef = useRef(createClient());

  const mapWithDocs = (data: Record<string, unknown>[]) =>
    data.map((row: Record<string, unknown>) => {
      const docs = (row.teacher_documents as Record<string, unknown>[]) || [];
      return {
        ...mapTeacherRow(row),
        documents: docs.map(mapDocumentRow),
      };
    });

  const searchTeachers = async (query: string) => {
    setLoading(true);
    try {
      const adminIds = await getAdminUserIds(supabaseRef.current);

      let q = supabaseRef.current
        .from('teachers')
        .select('*, teacher_documents(*)')
        .order('created_at', { ascending: false });

      if (adminIds.length > 0) {
        q = q.not('user_id', 'in', `(${adminIds.join(',')})`);
      }

      if (query) {
        q = q.or(`first_name.ilike.%${query}%,surname.ilike.%${query}%,email.ilike.%${query}%`);
      }

      const { data } = await q.limit(50);
      if (data) {
        setTeachers(mapWithDocs(data as Record<string, unknown>[]));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const adminIds = await getAdminUserIds(supabaseRef.current);

      let q = supabaseRef.current
        .from('teachers')
        .select('*, teacher_documents(*)')
        .order('created_at', { ascending: false });

      if (adminIds.length > 0) {
        q = q.not('user_id', 'in', `(${adminIds.join(',')})`);
      }

      const { data } = await q.limit(50);
      if (data) {
        setTeachers(mapWithDocs(data as Record<string, unknown>[]));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { teachers, loading, searchTeachers };
}

function mapSchoolRow(row: Record<string, unknown>): School {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    email: row.email as string,
    description: row.description as string | undefined,
    profilePicture: row.profile_picture as string | undefined,
    emisNumber: row.emis_number as string | undefined,
    district: row.district as string | undefined,
    schoolType: row.school_type as School['schoolType'],
    ownershipType: row.ownership_type as School['ownershipType'],
    educationDistrict: row.education_district as string | undefined,
    curriculum: row.curriculum as School['curriculum'],
    address: row.address as string | undefined,
    location: row.location as { lat: number; lng: number } | undefined,
    registrationCertificate: row.registration_certificate as string | undefined,
    createdAt: row.created_at as string,
  };
}

export function useAdminSearchSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const supabaseRef = useRef(createClient());

  const searchSchools = async (query: string) => {
    setLoading(true);
    try {
      let q = supabaseRef.current
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (query) {
        q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%,emis_number.ilike.%${query}%`);
      }

      const { data } = await q.limit(50);
      if (data) {
        setSchools(data.map(mapSchoolRow));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data } = await supabaseRef.current
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setSchools(data.map(mapSchoolRow));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { schools, loading, searchSchools };
}

export function useAdminSchoolDetail(schoolId: string | undefined) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchSchool = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabaseRef.current
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (data) {
        setSchool(mapSchoolRow(data));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSchool();
  }, [fetchSchool]);

  const updateSchool = async (id: string, updates: Record<string, unknown>) => {
    try {
      const { error } = await supabaseRef.current
        .from('schools')
        .update(updates)
        .eq('id', id);

      if (!error) {
        await fetchSchool();
      }
      return { success: !error };
    } catch {
      return { success: false };
    }
  };

  return { school, loading, updateSchool, refetch: fetchSchool };
}
