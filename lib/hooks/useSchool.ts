'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { School, Job, Application, Teacher } from '@/types';
import { mapTeacherRow } from '@/lib/utils/mapTeacherRow';

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
    verificationStatus: row.verification_status as School['verificationStatus'],
    verifiedBy: row.verified_by as string | undefined,
    verifiedAt: row.verified_at as string | undefined,
    rejectionReason: row.rejection_reason as string | undefined,
    createdAt: row.created_at as string,
  };
}

function mapJobRow(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    title: row.title as string,
    description: row.description as string,
    subject: row.subject as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    applicationDeadline: row.application_deadline as string,
    requiredQualifications: row.required_qualifications as string,
    educationPhase: row.education_phase as Job['educationPhase'],
    jobType: (row.job_type as Job['jobType']) || 'Temporary',
    progress: (row.progress as Job['progress']) || 'Open',
    tags: (row.tags as string[]) || [],
    createdAt: row.created_at as string,
  };
}

export function useSchoolProfile(userId: string | undefined) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const fetchSchool = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    try {
      const { data, error: fetchError } = await supabaseRef.current
        .from('schools')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setSchool(mapSchoolRow(data));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSchool();
  }, [fetchSchool]);

  return { school, loading, error, refetch: fetchSchool };
}

export function useUpdateSchool() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const updateSchool = async (schoolId: string, updates: Record<string, unknown>) => {
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabaseRef.current
        .from('schools')
        .update(updates)
        .eq('id', schoolId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { updateSchool, saving, error };
}

export function useSchoolJobs(schoolId: string | undefined) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchJobs = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    setLoading(true);

    try {
      const { data } = await supabaseRef.current
        .from('jobs')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (data) {
        setJobs(data.map(mapJobRow));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, refetch: fetchJobs };
}

export function useCreateJob() {
  const [creating, setCreating] = useState(false);
  const supabaseRef = useRef(createClient());

  const createJob = async (job: Record<string, unknown>) => {
    setCreating(true);
    try {
      const { data, error } = await supabaseRef.current
        .from('jobs')
        .insert(job)
        .select()
        .single();

      return { data, error: error?.message };
    } catch {
      return { data: null, error: 'Create failed' };
    } finally {
      setCreating(false);
    }
  };

  return { createJob, creating };
}

export function useUpdateJob() {
  const [updating, setUpdating] = useState(false);
  const supabaseRef = useRef(createClient());

  const updateJob = async (jobId: string, updates: Record<string, unknown>) => {
    setUpdating(true);
    try {
      const { error } = await supabaseRef.current
        .from('jobs')
        .update(updates)
        .eq('id', jobId);

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Update failed' };
    } finally {
      setUpdating(false);
    }
  };

  return { updateJob, updating };
}

export function useDeleteJob() {
  const [deleting, setDeleting] = useState(false);
  const supabaseRef = useRef(createClient());

  const deleteJob = async (jobId: string) => {
    setDeleting(true);
    try {
      const { error } = await supabaseRef.current
        .from('jobs')
        .delete()
        .eq('id', jobId);

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Delete failed' };
    } finally {
      setDeleting(false);
    }
  };

  return { deleteJob, deleting };
}

interface ApplicantData {
  application: Application;
  teacher: Teacher;
}

export function useJobApplicants(jobId: string | undefined) {
  const [applicants, setApplicants] = useState<ApplicantData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchApplicants = useCallback(async () => {
    if (!jobId) { setLoading(false); return; }
    setLoading(true);

    try {
      const { data } = await supabaseRef.current
        .from('applications')
        .select('*, teachers(*)')
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (data) {
        setApplicants(data.map((row: Record<string, unknown>) => {
          const t = row.teachers as Record<string, unknown>;
          return {
            application: {
              id: row.id as string,
              jobId: row.job_id as string,
              teacherId: row.teacher_id as string,
              status: row.status as Application['status'],
              shortlisted: (row.shortlisted as boolean) || false,
              coverLetter: (row.cover_letter as string) || undefined,
              appliedAt: row.applied_at as string,
            },
            teacher: mapTeacherRow(t),
          };
        }));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  return { applicants, loading, refetch: fetchApplicants };
}

export function useUpdateApplication() {
  const supabaseRef = useRef(createClient());

  const updateApplication = async (applicationId: string, updates: Record<string, unknown>) => {
    try {
      const { error } = await supabaseRef.current
        .from('applications')
        .update(updates)
        .eq('id', applicationId);

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Update failed' };
    }
  };

  return { updateApplication };
}
