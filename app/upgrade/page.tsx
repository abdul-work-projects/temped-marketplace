'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Check,
  Crown,
  Loader2,
  Shield,
  Briefcase,
  UserCheck,
  Send,
  ClipboardList,
  Star,
  Sparkles,
  Users,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LIFETIME_PRICE = 499; // ZAR
const TOTAL_SPOTS = 1000;

const FEATURES = [
  {
    icon: <Briefcase size={20} className="text-primary" />,
    title: 'Access to All TempEd Job Listings',
    description:
      'See temporary and substitute teaching opportunities from schools near you and apply directly from the platform.',
  },
  {
    icon: <UserCheck size={20} className="text-primary" />,
    title: 'Create a Professional Teacher Profile',
    description:
      'Show schools your qualifications, teaching subjects, experience, and CV so they can quickly evaluate and hire you.',
  },
  {
    icon: <Send size={20} className="text-primary" />,
    title: 'Direct Applications to Schools',
    description:
      'Apply to open positions without agencies or unnecessary middlemen.',
  },
  {
    icon: <ClipboardList size={20} className="text-primary" />,
    title: 'Job Activity Tracking',
    description:
      'Track applications, hiring status, and past teaching jobs completed through TempEd.',
  },
  {
    icon: <Star size={20} className="text-primary" />,
    title: 'Teacher Reviews & Reputation',
    description:
      'Build credibility through reviews from schools after completing jobs.',
  },
  {
    icon: <Sparkles size={20} className="text-primary" />,
    title: 'Early Access to New Features',
    description:
      'As TempEd grows, lifetime members keep access to future improvements and platform updates.',
  },
];

const WHO_IS_THIS_FOR = [
  'Teachers who want short-term or substitute work',
  'Teachers looking for permanent jobs',
  'Coaches looking for permanent or temporary jobs',
];

export default function UpgradePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const supabaseRef = useRef(createClient());

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      // Get the current session token
      const { data: { session } } = await supabaseRef.current.auth.getSession();
      if (!session) {
        setError('Please log in to continue.');
        setLoading(false);
        return;
      }

      // Call our API to generate payment data + signature
      const res = await fetch('/api/payfast/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Create a hidden form and submit it to PayFast
      const form = formRef.current;
      if (!form) return;

      // Clear previous inputs
      form.innerHTML = '';
      form.action = data.processUrl;

      // Add all payment fields as hidden inputs
      for (const [key, value] of Object.entries(data.paymentData)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }

      // Submit the form to redirect to PayFast
      form.submit();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const dashboardUrl =
    user?.type === 'school' ? '/school/dashboard' : '/teacher/dashboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={dashboardUrl}>
              <ArrowLeft size={18} />
              Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Crown size={16} />
            Founding Teacher Offer
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 max-w-3xl mx-auto leading-tight">
            Founding Teacher Lifetime Access — Pay Once, Use TempEd Forever
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the first {TOTAL_SPOTS.toLocaleString()} teachers on TempEd and
            unlock lifetime access to the platform that connects teachers with
            short-term and substitute teaching jobs.
          </p>

          {/* CTA Button */}
          <div className="mt-8">
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="h-12 text-base font-bold px-8"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown size={20} />
                  Get Lifetime Access — R{LIFETIME_PRICE}
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <Shield size={14} />
              <span>Secure payment via Payfast</span>
            </div>
          </div>
        </div>

        {/* Why This Exists */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Why This Exists
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              TempEd was built to solve a simple problem: schools need teachers
              fast, and teachers need flexible opportunities.
            </p>
            <p>
              Instead of waiting for agencies or relying on outdated systems,
              TempEd lets schools post temporary teaching jobs, and teachers
              apply instantly.
            </p>
            <p>
              To launch the platform and reward early adopters, we&apos;re
              offering lifetime access to the first{' '}
              {TOTAL_SPOTS.toLocaleString()} teachers who join.
            </p>
            <p className="font-medium text-foreground">
              In the near future, TempEd will move to a subscription model —
              which lifetime members never have to pay for.
            </p>
          </div>
        </div>

        {/* What You Get */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            What You Get With Lifetime Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="border border-border rounded-lg p-5 bg-card"
              >
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <h3 className="font-bold text-foreground text-sm">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime Deal Details */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Lifetime Deal Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  One-Time Payment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pay once and keep access forever.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Timer size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  Limited to the First {TOTAL_SPOTS.toLocaleString()} Teachers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Once the first {TOTAL_SPOTS.toLocaleString()} accounts are
                  claimed, the lifetime offer disappears and TempEd moves to
                  subscription pricing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who This Is For */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Who This Is For
          </h2>
          <ul className="space-y-3">
            {WHO_IS_THIS_FOR.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check size={18} className="text-primary shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Spots Remaining Banner */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users size={20} className="text-yellow-700" />
              <h3 className="text-lg font-bold text-yellow-800">
                Founding Teacher Spots Remaining
              </h3>
            </div>
            <p className="text-sm text-yellow-700">
              Only {TOTAL_SPOTS.toLocaleString()} lifetime memberships will ever
              be available. When they&apos;re gone, they&apos;re gone.
            </p>
          </div>
        </div>

        {/* CTA Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-card border-2 border-primary rounded-2xl overflow-hidden shadow-lg">
            {/* Price Header */}
            <div className="bg-primary/5 p-8 text-center border-b border-primary/20">
              <p className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
                Lifetime Access
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-foreground">
                  R{LIFETIME_PRICE}
                </span>
                <span className="text-muted-foreground text-lg">/once-off</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Pay once, access forever
              </p>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Claim Your Lifetime Access
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Become one of the first teachers on TempEd and lock in permanent
                access today.
              </p>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-12 text-base font-bold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown size={20} />
                    Get Lifetime Access — R{LIFETIME_PRICE}
                  </>
                )}
              </Button>

              {error && (
                <p className="text-sm text-red-600 mt-3">{error}</p>
              )}

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield size={14} />
                <span>Secure payment via Payfast</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden form for PayFast redirect */}
      <form ref={formRef} method="post" className="hidden" />
    </div>
  );
}
