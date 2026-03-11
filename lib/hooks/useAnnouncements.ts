'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Announcement, AnnouncementTarget } from '@/types';

function mapRow(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    message: row.message as string,
    target: row.target as AnnouncementTarget,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

/**
 * Fetch the latest active announcement for a given user type.
 */
export function useActiveAnnouncement(userType: 'teacher' | 'school') {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabaseRef.current
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .in('target', [userType, 'all'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setAnnouncement(mapRow(data));
    };
    fetch();
  }, [userType]);

  return announcement;
}

/**
 * Admin hook: CRUD for announcements.
 */
export function useAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabaseRef.current
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    setAnnouncements((data || []).map(mapRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createAnnouncement = async (message: string, target: AnnouncementTarget) => {
    const { error } = await supabaseRef.current
      .from('announcements')
      .insert({ message, target, is_active: true });
    if (!error) await fetchAll();
    return { success: !error };
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabaseRef.current
      .from('announcements')
      .update({ is_active: isActive })
      .eq('id', id);
    if (!error) await fetchAll();
    return { success: !error };
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabaseRef.current
      .from('announcements')
      .delete()
      .eq('id', id);
    if (!error) await fetchAll();
    return { success: !error };
  };

  return { announcements, loading, createAnnouncement, toggleActive, deleteAnnouncement, refetch: fetchAll };
}
