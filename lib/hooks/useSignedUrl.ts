'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

// L1: In-memory cache (fastest, cleared on page refresh)
const memCache = new Map<string, { url: string; expiresAt: number }>();

// L2: sessionStorage helpers (persists across page navigations/refreshes)
const SS_PREFIX = 'signed-url:';

function ssGet(key: string): { url: string; expiresAt: number } | null {
  try {
    const raw = sessionStorage.getItem(SS_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ssSet(key: string, entry: { url: string; expiresAt: number }) {
  try {
    sessionStorage.setItem(SS_PREFIX + key, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

/** Check both cache layers, return URL if still valid (>5 min remaining) */
function getCached(key: string): string | null {
  const minExpiry = Date.now() + 5 * 60 * 1000;

  // L1: in-memory
  const mem = memCache.get(key);
  if (mem && mem.expiresAt > minExpiry) return mem.url;

  // L2: sessionStorage
  const ss = ssGet(key);
  if (ss && ss.expiresAt > minExpiry) {
    // Promote to L1
    memCache.set(key, ss);
    return ss.url;
  }

  return null;
}

/** Write to both cache layers */
function setCache(key: string, url: string, expiresAt: number) {
  const entry = { url, expiresAt };
  memCache.set(key, entry);
  ssSet(key, entry);
}

/**
 * Generates a signed URL for a file in Supabase storage.
 * Handles both full public URLs (legacy) and plain storage paths.
 * Caches results in memory + sessionStorage so page refreshes serve from browser disk cache.
 */
export function useSignedUrl(bucket: string, pathOrUrl: string | undefined): string | null {
  const supabaseRef = useRef(createClient());

  const initCached = (): string | null => {
    if (!pathOrUrl) return null;
    // External URLs don't need signing
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
    return getCached(`${bucket}:${pathOrUrl}`);
  };

  const [url, setUrl] = useState<string | null>(initCached);

  useEffect(() => {
    if (!pathOrUrl) {
      setUrl(null);
      return;
    }

    // External URLs (e.g. Google avatar) — use directly, no signing needed
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      setUrl(pathOrUrl);
      return;
    }

    const key = `${bucket}:${pathOrUrl}`;
    const cached = getCached(key);
    if (cached) {
      setUrl(cached);
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
          setCache(key, data.signedUrl, Date.now() + 3600 * 1000);
          setUrl(data.signedUrl);
        }
      });
  }, [bucket, pathOrUrl]);

  return url;
}
