'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

// In-memory cache: "bucket:path" -> { url, expiresAt }
const cache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Generates a signed URL for a file in Supabase storage.
 * Handles both full public URLs (legacy) and plain storage paths.
 * Caches results in memory so revisiting a page doesn't flash a blank image.
 */
export function useSignedUrl(bucket: string, pathOrUrl: string | undefined): string | null {
  const supabaseRef = useRef(createClient());

  const getCached = (): string | null => {
    if (!pathOrUrl) return null;
    const key = `${bucket}:${pathOrUrl}`;
    const entry = cache.get(key);
    // Use cache if it has > 5 min left before expiry
    if (entry && entry.expiresAt > Date.now() + 5 * 60 * 1000) {
      return entry.url;
    }
    return null;
  };

  const [url, setUrl] = useState<string | null>(getCached);

  useEffect(() => {
    if (!pathOrUrl) {
      setUrl(null);
      return;
    }

    const key = `${bucket}:${pathOrUrl}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
      setUrl(cached.url);
      return;
    }

    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = pathOrUrl.indexOf(marker);
    const storagePath = idx !== -1 ? pathOrUrl.substring(idx + marker.length) : pathOrUrl;

    supabaseRef.current.storage
      .from(bucket)
      .createSignedUrl(storagePath, 3600)
      .then(({ data }: { data: { signedUrl: string } | null }) => {
        if (data?.signedUrl) {
          cache.set(key, { url: data.signedUrl, expiresAt: Date.now() + 3600 * 1000 });
          setUrl(data.signedUrl);
        }
      });
  }, [bucket, pathOrUrl]);

  return url;
}
