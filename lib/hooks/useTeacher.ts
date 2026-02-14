'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Teacher, Experience, TeacherDocument, DocumentType } from '@/types';
import { mapTeacherRow } from '@/lib/utils/mapTeacherRow';

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

export function useTeacherProfile(userId: string | undefined) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const hasFetchedRef = useRef(false);

  const fetchTeacher = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    if (!hasFetchedRef.current) setLoading(true);

    try {
      const { data, error: fetchError } = await supabaseRef.current
        .from('teachers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      if (data) {
        setTeacher(mapTeacherRow(data));

        // Fetch experiences
        const { data: expData } = await supabaseRef.current
          .from('teacher_experiences')
          .select('*')
          .eq('teacher_id', data.id)
          .order('start_date', { ascending: false });

        if (expData) {
          setExperiences(expData.map((e: Record<string, unknown>) => ({
            id: e.id as string,
            title: e.title as string,
            company: e.company as string,
            startDate: e.start_date as string,
            endDate: (e.end_date as string) || undefined,
            description: (e.description as string) || undefined,
          })));
        }
      }
    } catch {
      // Supabase client threw — prevent loading from getting stuck
    } finally {
      hasFetchedRef.current = true;
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  return { teacher, experiences, loading, error, refetch: fetchTeacher };
}

export function useTeacherById(teacherId: string | undefined) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await supabaseRef.current
          .from('teachers')
          .select('*')
          .eq('id', teacherId)
          .single();

        if (data) {
          setTeacher(mapTeacherRow(data));

          const { data: expData } = await supabaseRef.current
            .from('teacher_experiences')
            .select('*')
            .eq('teacher_id', data.id)
            .order('start_date', { ascending: false });

          if (expData) {
            setExperiences(expData.map((e: Record<string, unknown>) => ({
              id: e.id as string,
              title: e.title as string,
              company: e.company as string,
              startDate: e.start_date as string,
              endDate: (e.end_date as string) || undefined,
              description: (e.description as string) || undefined,
            })));
          }
        }
      } catch {
        // prevent loading stuck
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [teacherId]);

  return { teacher, experiences, loading };
}

export function useUpdateTeacher() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const updateTeacher = async (
    teacherId: string,
    updates: Record<string, unknown>,
    experiences?: Experience[]
  ) => {
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabaseRef.current
        .from('teachers')
        .update(updates)
        .eq('id', teacherId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      // Handle experiences if provided
      if (experiences) {
        // Delete existing experiences
        await supabaseRef.current
          .from('teacher_experiences')
          .delete()
          .eq('teacher_id', teacherId);

        // Insert new experiences
        if (experiences.length > 0) {
          const expRows = experiences.map(e => ({
            teacher_id: teacherId,
            title: e.title,
            company: e.company,
            start_date: e.startDate,
            end_date: e.endDate || null,
            description: e.description || null,
          }));

          const { error: expError } = await supabaseRef.current
            .from('teacher_experiences')
            .insert(expRows);

          if (expError) {
            setError(expError.message);
            return false;
          }
        }
      }

      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { updateTeacher, saving, error };
}

export function useTeacherApplications(teacherId: string | undefined) {
  const [applications, setApplications] = useState<Array<{
    id: string;
    jobId: string;
    teacherId: string;
    status: string;
    shortlisted: boolean;
    coverLetter?: string;
    appliedAt: string;
    job?: {
      id: string;
      title: string;
      subject: string;
      startDate: string;
      endDate: string;
      educationPhase: string;
      jobType: string;
      progress: string;
      schoolId: string;
    };
    school?: {
      id: string;
      userId: string;
      name: string;
      address?: string;
      location?: { lat: number; lng: number };
    };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await supabaseRef.current
          .from('applications')
          .select(`
            *,
            jobs (
              id, title, subject, start_date, end_date, education_phase, job_type, progress, school_id,
              schools (id, user_id, name, address, location)
            )
          `)
          .eq('teacher_id', teacherId)
          .order('applied_at', { ascending: false });

        if (data) {
          setApplications(data.map((a: Record<string, unknown>) => {
            const job = a.jobs as Record<string, unknown> | null;
            const school = job?.schools as Record<string, unknown> | null;
            return {
              id: a.id as string,
              jobId: a.job_id as string,
              teacherId: a.teacher_id as string,
              status: a.status as string,
              shortlisted: a.shortlisted as boolean,
              coverLetter: (a.cover_letter as string) || undefined,
              appliedAt: a.applied_at as string,
              job: job ? {
                id: job.id as string,
                title: job.title as string,
                subject: job.subject as string,
                startDate: job.start_date as string,
                endDate: job.end_date as string,
                educationPhase: job.education_phase as string,
                jobType: job.job_type as string,
                progress: job.progress as string,
                schoolId: job.school_id as string,
              } : undefined,
              school: school ? {
                id: school.id as string,
                userId: school.user_id as string,
                name: school.name as string,
                address: school.address as string | undefined,
                location: school.location as { lat: number; lng: number } | undefined,
              } : undefined,
            };
          }));
        }
      } catch {
        // prevent loading stuck
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [teacherId]);

  return { applications, loading };
}

export function useTeacherDocuments(teacherId: string | undefined) {
  const [documents, setDocuments] = useState<TeacherDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const hasFetchedDocsRef = useRef(false);

  const fetchDocuments = useCallback(async () => {
    if (!teacherId) { setLoading(false); return; }
    if (!hasFetchedDocsRef.current) setLoading(true);

    try {
      const { data } = await supabaseRef.current
        .from('teacher_documents')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (data) {
        setDocuments(data.map(mapDocumentRow));
      }
    } catch {
      // prevent loading stuck
    } finally {
      hasFetchedDocsRef.current = true;
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, refetch: fetchDocuments };
}

export function useUploadDocument() {
  const [uploading, setUploading] = useState(false);
  const supabaseRef = useRef(createClient());

  const uploadDocument = async (
    teacherId: string,
    documentType: DocumentType,
    fileUrl: string,
    fileName?: string
  ) => {
    setUploading(true);
    try {
      const { data, error } = await supabaseRef.current
        .from('teacher_documents')
        .insert({
          teacher_id: teacherId,
          document_type: documentType,
          file_url: fileUrl,
          file_name: fileName || null,
        })
        .select()
        .single();

      return { data: data ? mapDocumentRow(data) : null, error: error?.message };
    } catch {
      return { data: null, error: 'Upload failed' };
    } finally {
      setUploading(false);
    }
  };

  return { uploadDocument, uploading };
}

export function useDeleteDocument() {
  const supabaseRef = useRef(createClient());

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabaseRef.current
        .from('teacher_documents')
        .delete()
        .eq('id', documentId);

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Delete failed' };
    }
  };

  return { deleteDocument };
}
