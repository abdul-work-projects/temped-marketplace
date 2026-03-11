'use client';

import { useState } from 'react';
import { useAdminAnnouncements } from '@/lib/hooks/useAnnouncements';
import { AnnouncementTarget } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAnnouncementsPage() {
  const { announcements, loading, createAnnouncement, toggleActive, deleteAnnouncement } = useAdminAnnouncements();
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<AnnouncementTarget>('all');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    await createAnnouncement(message.trim(), target);
    setMessage('');
    setTarget('all');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">Announcements</h1>
            <p className="text-muted-foreground">Create and manage announcements shown on teacher and school dashboards</p>
          </div>

          {/* Create form */}
          <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-6 mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4">New Announcement</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="message" className="font-bold">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter announcement message..."
                  maxLength={500}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{message.length}/500</p>
              </div>

              <div>
                <Label htmlFor="target" className="font-bold">Audience</Label>
                <select
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as AnnouncementTarget)}
                  className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Users</option>
                  <option value="teacher">Teachers Only</option>
                  <option value="school">Schools Only</option>
                </select>
              </div>

              <Button type="submit" disabled={submitting || !message.trim()}>
                <Plus size={16} />
                {submitting ? 'Creating...' : 'Create Announcement'}
              </Button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              All Announcements ({announcements.length})
            </h2>

            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-2xl border bg-card p-4 ${a.isActive ? 'border-primary/30' : 'border-border opacity-60'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{a.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                          a.target === 'all' ? 'bg-blue-50 text-blue-700' :
                          a.target === 'teacher' ? 'bg-green-50 text-green-700' :
                          'bg-purple-50 text-purple-700'
                        }`}>
                          {a.target === 'all' ? 'All Users' : a.target === 'teacher' ? 'Teachers' : 'Schools'}
                        </span>
                        <span>{format(new Date(a.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                        {a.isActive ? (
                          <span className="text-green-600 font-medium">Active</span>
                        ) : (
                          <span className="text-muted-foreground font-medium">Inactive</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleActive(a.id, !a.isActive)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title={a.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {a.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(a.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
