'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subscription, Payment } from '@/types';

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

function mapPaymentRow(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    teacherId: row.teacher_id as string,
    paymentId: row.payment_id as string,
    pfPaymentId: row.pf_payment_id as string | undefined,
    amount: row.amount as number,
    amountGross: row.amount_gross as number | undefined,
    amountFee: row.amount_fee as number | undefined,
    amountNet: row.amount_net as number | undefined,
    status: row.status as string,
    itemName: row.item_name as string | undefined,
    paidAt: row.paid_at as string | undefined,
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
      const { data } = await supabaseRef.current
        .from('subscriptions')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const sub = mapSubscriptionRow(data);
        setSubscription(sub);
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
 * Fetch payment history for a teacher.
 */
export function usePayments(teacherId: string | undefined) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchPayments = useCallback(async () => {
    if (!teacherId) { setLoading(false); return; }

    try {
      const { data } = await supabaseRef.current
        .from('payments')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      setPayments((data || []).map(mapPaymentRow));
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, refetch: fetchPayments };
}

/**
 * Lightweight check for sidebar — just returns whether teacher has active access.
 * Uses teacher_id looked up from user_id. Re-checks when userId changes.
 */
export function useHasAccess(userId: string | undefined, userType: string | undefined) {
  const [hasAccess, setHasAccess] = useState(false);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!userId || userType !== 'teacher') return;

    const check = async () => {
      try {
        const { data: teacher } = await supabaseRef.current
          .from('teachers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (!teacher) return;

        const { data: sub } = await supabaseRef.current
          .from('subscriptions')
          .select('id, plan_type, expires_at')
          .eq('teacher_id', teacher.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();

        if (sub) {
          const isActive = !sub.expires_at || new Date(sub.expires_at as string) > new Date();
          setHasAccess(isActive);
        } else {
          setHasAccess(false);
        }
      } catch {
        // no subscription
      }
    };

    check();
  }, [userId, userType]);

  return hasAccess;
}
