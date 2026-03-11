'use client';

import { useState } from 'react';
import { useAdminSubscriptions } from '@/lib/hooks/useAdmin';
import { Loader2, CreditCard, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminSubscriptionsPage() {
  const { subscriptions, payments, loading } = useAdminSubscriptions();
  const [tab, setTab] = useState<'subscriptions' | 'payments'>('subscriptions');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETE')
    .reduce((sum, p) => sum + (p.amountNet || 0), 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Subscriptions & Payments</h1>
          <p className="text-muted-foreground">Manage subscriptions and view payment history</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard size={18} className="text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Active Subscriptions</p>
            </div>
            <p className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={18} className="text-green-600" />
              <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-green-600">R{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={18} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">Total Payments</p>
            </div>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          <button
            onClick={() => setTab('subscriptions')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'subscriptions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setTab('payments')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'payments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Payments ({payments.length})
          </button>
        </div>

        {/* Subscriptions table */}
        {tab === 'subscriptions' && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Started</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No subscriptions yet
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map(sub => (
                      <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="font-medium">{sub.teacherName}</div>
                          <div className="text-xs text-muted-foreground">{sub.teacherEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {sub.planType.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            sub.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : sub.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(sub.startsAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {sub.expiresAt ? format(new Date(sub.expiresAt), 'MMM d, yyyy') : 'Never'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments table */}
        {tab === 'payments' && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Net</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No payments yet
                      </td>
                    </tr>
                  ) : (
                    payments.map(payment => (
                      <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="font-medium">{payment.teacherName}</div>
                          <div className="text-xs text-muted-foreground">{payment.teacherEmail}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          R{(payment.amountGross || payment.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {payment.amountFee ? `R${payment.amountFee.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 font-medium text-green-600">
                          {payment.amountNet ? `R${payment.amountNet.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            payment.status === 'COMPLETE'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(payment.paidAt || payment.createdAt), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
