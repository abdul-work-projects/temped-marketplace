'use client';

import { useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import { Announcement } from '@/types';

interface AnnouncementBarProps {
  announcement: Announcement | null;
}

export default function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  // Check if this specific announcement was already dismissed
  const storageKey = `announcement-dismissed-${announcement.id}`;
  if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, '1');
    setDismissed(true);
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-3 mb-6">
      <Megaphone size={18} className="text-primary shrink-0" />
      <p className="text-sm text-foreground flex-1">{announcement.message}</p>
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
