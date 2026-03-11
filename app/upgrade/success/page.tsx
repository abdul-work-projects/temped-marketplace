'use client';

import { useEffect } from 'react';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

export default function PaymentSuccessPage() {
  const { user } = useAuth();

  // Clear cached access state so sidebar re-checks subscription
  useEffect(() => {
    sessionStorage.removeItem('temped-has-access');
  }, []);
  const dashboardUrl =
    user?.type === 'school' ? '/school/dashboard' : '/teacher/dashboard';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
          <Crown size={16} />
          Founding Teacher
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-2">
          You now have lifetime access to TempEd.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Your payment has been processed and your account has been upgraded.
          You&apos;re one of the founding teachers on the platform.
        </p>

        <Button asChild className="h-12 text-base font-bold px-8">
          <Link href={dashboardUrl}>
            Go to Dashboard
            <ArrowRight size={18} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
