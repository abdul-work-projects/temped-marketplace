'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subscription } from '@/types';

function mapSubscriptionRow(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as string,
    teacherId: row.teacher_id as string,
    planType: row.plan_type as Subscription['planType'],
    status: row.status as Subscription['status'],
    paymentId: row.payment_id as string | undefined,
    startsAt: row.starts_at as string,
    expiresAt: row.expires_at as string | undefined,
    createdAt: row.created_at as string,
  };
}

/**
 * Check if a teacher has an active subscription (lifetime or non-expired monthly).
 */
export function useSubscription(teacherId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchSubscription = useCallback(async () => {
    if (!teacherId) { setLoading(false); return; }

    try {
      // Get active subscription: lifetime (no expiry) or monthly with future expiry
      const { data } = await supabaseRef.current
        .from('subscriptions')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const sub = mapSubscriptionRow(data);
        setSubscription(sub);
        // Active if lifetime (no expiry) or expiry is in the future
        const isActive = !sub.expiresAt || new Date(sub.expiresAt) > new Date();
        setHasAccess(isActive);
      } else {
        setSubscription(null);
        setHasAccess(false);
      }
    } catch {
      setSubscription(null);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, hasAccess, loading, refetch: fetchSubscription };
}

/**
 * Lightweight check for sidebar — just returns whether teacher has active access.
 * Uses teacher_id looked up from user_id.
 */
export function useHasAccess(userId: string | undefined, userType: string | undefined) {
  const [hasAccess, setHasAccess] = useState(false);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!userId || userType !== 'teacher') return;

    const check = async () => {
      try {
        // Get teacher ID
        const { data: teacher } = await supabaseRef.current
          .from('teachers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (!teacher) return;

        // Check for active subscription
        const { data: sub } = await supabaseRef.current
          .from('subscriptions')
          .select('id, plan_type, expires_at')
          .eq('teacher_id', teacher.id)
          .eq('status', 'active')
          .limit(1)
          .single();

        if (sub) {
          const isActive = !sub.expires_at || new Date(sub.expires_at as string) > new Date();
          setHasAccess(isActive);
        }
      } catch {
        // no subscription
      }
    };

    check();
  }, [userId, userType]);

  return hasAccess;
}
