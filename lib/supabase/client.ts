import { createBrowserClient } from '@supabase/ssr';

// In-memory mutex lock that replaces navigator.locks.
// - navigator.locks deadlocks in React dev/strict mode (double-mount)
// - A no-op lock causes race conditions (concurrent token refreshes corrupt session)
// - This mutex serializes access with a timeout fallback: if the previous holder
//   hangs (e.g., slow network), we proceed after the timeout instead of blocking forever.
const locks = new Map<string, Promise<unknown>>();

const memoryLock = async <R>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => {
  const existing = locks.get(name);

  let resolve: () => void;
  const next = new Promise<void>((r) => { resolve = r; });
  locks.set(name, next);

  if (existing) {
    // Wait for the previous lock holder, but not forever.
    // If it hangs (slow network, stuck refresh), proceed after timeout.
    const timeout = acquireTimeout > 0 ? acquireTimeout : 5000;
    await Promise.race([
      existing,
      new Promise<void>((r) => setTimeout(r, timeout)),
    ]);
  }

  try {
    return await fn();
  } finally {
    resolve!();
    if (locks.get(name) === next) {
      locks.delete(name);
    }
  }
};

type BrowserClient = ReturnType<typeof createBrowserClient>;

let client: BrowserClient | null = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        detectSessionInUrl: true,
        lock: memoryLock,
      },
    }
  );
  return client;
}
