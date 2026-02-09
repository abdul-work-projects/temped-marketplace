'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Generates a signed URL for a file in Supabase storage.
 * Handles both full public URLs (legacy) and plain storage paths.
 */
export function useSignedUrl(bucket: string, pathOrUrl: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!pathOrUrl) {
      setUrl(null);
      return;
    }

    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = pathOrUrl.indexOf(marker);
    const storagePath = idx !== -1 ? pathOrUrl.substring(idx + marker.length) : pathOrUrl;

    supabaseRef.current.storage
      .from(bucket)
      .createSignedUrl(storagePath, 3600)
      .then(({ data }: { data: { signedUrl: string } | null }) => {
        if (data?.signedUrl) setUrl(data.signedUrl);
      });
  }, [bucket, pathOrUrl]);

  return url;
}
