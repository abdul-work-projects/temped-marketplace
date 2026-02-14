'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Job, School } from '@/types';

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

interface JobWithSchool {
  job: Job;
  school: School;
}

export function useOpenJobs(filters?: {
  educationPhase?: string;
  jobType?: string;
  subject?: string;
}) {
  const [jobs, setJobs] = useState<JobWithSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchJobs = useCallback(async () => {
    setLoading(true);

    try {
      let query = supabaseRef.current
        .from('jobs')
        .select('*, schools(*)')
        .eq('progress', 'Open')
        .order('created_at', { ascending: false });

      if (filters?.educationPhase) {
        query = query.eq('education_phase', filters.educationPhase);
      }
      if (filters?.jobType) {
        query = query.eq('job_type', filters.jobType);
      }

      const { data } = await query;

      if (data) {
        const mapped = data
          .filter((row: Record<string, unknown>) => row.schools)
          .map((row: Record<string, unknown>) => ({
            job: mapJobRow(row),
            school: mapSchoolRow(row.schools as Record<string, unknown>),
          }));

        // Client-side subject filter (since subject matching is complex)
        if (filters?.subject) {
          setJobs(mapped.filter((j: JobWithSchool) => j.job.subject.toLowerCase().includes(filters.subject!.toLowerCase())));
        } else {
          setJobs(mapped);
        }
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [filters?.educationPhase, filters?.jobType, filters?.subject]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, refetch: fetchJobs };
}

export function useJobDetail(jobId: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchJob = useCallback(async () => {
    if (!jobId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabaseRef.current
        .from('jobs')
        .select('*, schools(*)')
        .eq('id', jobId)
        .single();

      if (data) {
        setJob(mapJobRow(data));
        if (data.schools) {
          setSchool(mapSchoolRow(data.schools as Record<string, unknown>));
        }
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, school, loading, refetch: fetchJob };
}

export function useApplyToJob() {
  const [applying, setApplying] = useState(false);
  const supabaseRef = useRef(createClient());

  const apply = async (jobId: string, teacherId: string, coverLetter?: string) => {
    setApplying(true);
    try {
      const { error } = await supabaseRef.current
        .from('applications')
        .insert({
          job_id: jobId,
          teacher_id: teacherId,
          status: 'Applied',
          cover_letter: coverLetter || null,
        });

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Apply failed' };
    } finally {
      setApplying(false);
    }
  };

  return { apply, applying };
}

export function useWithdrawApplication() {
  const [withdrawing, setWithdrawing] = useState(false);
  const supabaseRef = useRef(createClient());

  const withdraw = async (jobId: string, teacherId: string) => {
    setWithdrawing(true);
    try {
      const { error } = await supabaseRef.current
        .from('applications')
        .delete()
        .eq('job_id', jobId)
        .eq('teacher_id', teacherId);

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Withdraw failed' };
    } finally {
      setWithdrawing(false);
    }
  };

  return { withdraw, withdrawing };
}

export function useCheckApplication(jobId: string | undefined, teacherId: string | undefined) {
  const [applied, setApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const check = useCallback(async () => {
    if (!jobId || !teacherId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabaseRef.current
        .from('applications')
        .select('id, status')
        .eq('job_id', jobId)
        .eq('teacher_id', teacherId)
        .maybeSingle();

      setApplied(!!data);
      setApplicationId(data?.id || null);
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [jobId, teacherId]);

  useEffect(() => {
    check();
  }, [check]);

  return { applied, applicationId, loading, refetch: check };
}

export function useSchoolById(schoolId: string | undefined) {
  const [school, setSchool] = useState<School | null>(null);
  const [schoolJobs, setSchoolJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!schoolId) { setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await supabaseRef.current
          .from('schools')
          .select('*')
          .eq('id', schoolId)
          .single();

        if (data) {
          setSchool(mapSchoolRow(data));

          // Fetch school's open jobs
          const { data: jobsData } = await supabaseRef.current
            .from('jobs')
            .select('*')
            .eq('school_id', schoolId)
            .eq('progress', 'Open')
            .order('created_at', { ascending: false });

          if (jobsData) {
            setSchoolJobs(jobsData.map(mapJobRow));
          }
        }
      } catch {
        // prevent loading stuck
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [schoolId]);

  return { school, schoolJobs, loading };
}
