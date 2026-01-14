'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ActiveListingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since active listings are shown there
    router.push('/school/dashboard');
  }, [router]);

  return null;
}
