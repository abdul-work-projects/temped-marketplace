'use client';

import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeacherProfile } from '@/lib/hooks/useTeacher';
import { useSubscription, usePayments } from '@/lib/hooks/useSubscription';
import { Loader2, Crown, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
        <CheckCircle size={12} /> Active
      </span>
    );
  }
  if (status === 'COMPLETE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
        <CheckCircle size={12} /> Complete
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700">
        <Clock size={12} /> Pending
      </span>
    );
  }
  if (status === 'CANCELLED' || status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
        <XCircle size={12} /> Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
      {status}
    </span>
  );
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { teacher, loading: teacherLoading } = useTeacherProfile(user?.id);
  const { subscription, hasAccess, loading: subLoading } = useSubscription(teacher?.id);
  const { payments, loading: paymentsLoading } = usePayments(teacher?.id);

  const loading = teacherLoading || subLoading || paymentsLoading;

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="min-h-screen">
        <div className="py-8 px-4 sm:px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-1">Subscription</h1>
              <p className="text-muted-foreground">Manage your subscription and view payment history</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Active Subscription */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden mb-8">
                  <div className="h-1.5 bg-primary/70" />
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <CreditCard size={20} />
                      Current Plan
                    </h2>

                    {hasAccess && subscription ? (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                          <Crown size={24} className="text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-foreground">
                              {subscription.planType === 'lifetime' ? 'Founding Teacher — Lifetime Access' : 'Monthly Plan'}
                            </h3>
                            <StatusBadge status={subscription.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {subscription.planType === 'lifetime'
                              ? 'You have permanent access to all TempEd features. No recurring charges.'
                              : subscription.expiresAt
                                ? `Renews on ${format(new Date(subscription.expiresAt), 'dd MMMM yyyy')}`
                                : 'Active subscription'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Member since {format(new Date(subscription.startsAt), 'dd MMMM yyyy')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">You don&apos;t have an active subscription.</p>
                        <Button asChild>
                          <Link href="/upgrade">
                            <Crown size={16} />
                            Get Lifetime Access
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment History */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-foreground mb-4">Payment History</h2>

                    {payments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No payments yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-left">
                              <th className="pb-3 font-bold text-muted-foreground">Date</th>
                              <th className="pb-3 font-bold text-muted-foreground">Description</th>
                              <th className="pb-3 font-bold text-muted-foreground text-right">Amount</th>
                              <th className="pb-3 font-bold text-muted-foreground text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((p) => (
                              <tr key={p.id} className="border-b border-border last:border-0">
                                <td className="py-3 text-foreground">
                                  {format(new Date(p.createdAt), 'dd MMM yyyy')}
                                </td>
                                <td className="py-3 text-foreground">
                                  {p.itemName || 'Payment'}
                                </td>
                                <td className="py-3 text-foreground text-right font-medium">
                                  R{(p.amountGross ?? p.amount).toFixed(2)}
                                </td>
                                <td className="py-3 text-right">
                                  <StatusBadge status={p.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
