'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetch = useCallback(async () => {
    const { data } = await supabaseRef.current
      .from('tags')
      .select('*')
      .order('name');
    setTags(
      (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        createdAt: row.created_at as string,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { tags, loading, refetch: fetch };
}

export function useManageTags() {
  const supabaseRef = useRef(createClient());

  const addTag = useCallback(async (name: string) => {
    const { error } = await supabaseRef.current
      .from('tags')
      .insert({ name: name.trim() });
    return { success: !error, error: error?.message };
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    const { error } = await supabaseRef.current
      .from('tags')
      .delete()
      .eq('id', id);
    return { success: !error, error: error?.message };
  }, []);

  const updateTag = useCallback(async (id: string, name: string) => {
    const { error } = await supabaseRef.current
      .from('tags')
      .update({ name: name.trim() })
      .eq('id', id);
    return { success: !error, error: error?.message };
  }, []);

  return { addTag, deleteTag, updateTag };
}
