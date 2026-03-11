'use client';

import { X, Megaphone } from 'lucide-react';
import { Announcement } from '@/types';

interface AnnouncementBarProps {
  announcement: Announcement | null;
  onDismiss?: (id: string) => void;
}

export default function AnnouncementBar({ announcement, onDismiss }: AnnouncementBarProps) {
  if (!announcement) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-3 mb-6">
      <Megaphone size={18} className="text-primary shrink-0" />
      <p className="text-sm text-foreground flex-1">{announcement.message}</p>
      <button
        onClick={() => onDismiss?.(announcement.id)}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
