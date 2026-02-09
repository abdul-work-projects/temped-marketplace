'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Testimonial {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromType: 'teacher' | 'school';
  comment: string;
  status: string;
  createdAt: string;
  senderName: string;
}

export interface MyTestimonial {
  id: string;
  toUserId: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export function useCreateTestimonial() {
  const [submitting, setSubmitting] = useState(false);
  const supabaseRef = useRef(createClient());

  const createTestimonial = async ({
    fromUserId,
    toUserId,
    fromType,
    comment,
  }: {
    fromUserId: string;
    toUserId: string;
    fromType: 'teacher' | 'school';
    comment: string;
  }) => {
    setSubmitting(true);
    try {
      const { error } = await supabaseRef.current
        .from('testimonials')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          from_type: fromType,
          comment,
          status: 'pending',
        });

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Failed to submit review' };
    } finally {
      setSubmitting(false);
    }
  };

  const updateTestimonial = async (id: string, comment: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabaseRef.current
        .from('testimonials')
        .update({ comment, status: 'pending' })
        .eq('id', id);

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Failed to update review' };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabaseRef.current
        .from('testimonials')
        .delete()
        .eq('id', id);

      return { success: !error, error: error?.message };
    } catch {
      return { success: false, error: 'Failed to delete review' };
    } finally {
      setSubmitting(false);
    }
  };

  return { createTestimonial, updateTestimonial, deleteTestimonial, submitting };
}

export function useMyTestimonials(fromUserId: string | undefined) {
  const [testimonials, setTestimonials] = useState<MyTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchMyTestimonials = useCallback(async () => {
    if (!fromUserId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabaseRef.current
        .from('testimonials')
        .select('id, to_user_id, comment, status, created_at')
        .eq('from_user_id', fromUserId)
        .order('created_at', { ascending: false });

      if (data) {
        setTestimonials(data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          toUserId: row.to_user_id as string,
          comment: row.comment as string,
          status: row.status as MyTestimonial['status'],
          createdAt: row.created_at as string,
        })));
      }
    } catch {
      // prevent loading stuck
    } finally {
      setLoading(false);
    }
  }, [fromUserId]);

  useEffect(() => {
    fetchMyTestimonials();
  }, [fetchMyTestimonials]);

  return { testimonials, loading, refetch: fetchMyTestimonials };
}

export function useTestimonials(toUserId: string | undefined) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!toUserId) { setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await supabaseRef.current
          .from('testimonials')
          .select('*')
          .eq('to_user_id', toUserId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          // Resolve sender names
          const resolved: Testimonial[] = [];

          for (const row of data) {
            const fromType = row.from_type as 'teacher' | 'school';
            let senderName = 'Unknown';

            if (fromType === 'teacher') {
              const { data: t } = await supabaseRef.current
                .from('teachers')
                .select('first_name, surname')
                .eq('user_id', row.from_user_id)
                .single();
              if (t) senderName = `${t.first_name} ${t.surname}`;
            } else {
              const { data: s } = await supabaseRef.current
                .from('schools')
                .select('name')
                .eq('user_id', row.from_user_id)
                .single();
              if (s) senderName = s.name as string;
            }

            resolved.push({
              id: row.id as string,
              fromUserId: row.from_user_id as string,
              toUserId: row.to_user_id as string,
              fromType,
              comment: row.comment as string,
              status: row.status as string,
              createdAt: row.created_at as string,
              senderName,
            });
          }

          setTestimonials(resolved);
        } else {
          setTestimonials([]);
        }
      } catch {
        // prevent loading stuck
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [toUserId]);

  return { testimonials, loading };
}
