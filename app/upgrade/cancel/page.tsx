'use client';

import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-8">
          Your payment was not completed. No charges were made.
          You can try again whenever you&apos;re ready.
        </p>

        <Button variant="outline" asChild className="h-12 text-base px-8">
          <Link href="/upgrade">
            <ArrowLeft size={18} />
            Back to Upgrade
          </Link>
        </Button>
      </div>
    </div>
  );
}
