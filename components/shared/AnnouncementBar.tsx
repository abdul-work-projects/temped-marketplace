'use client';

import { useState, useSyncExternalStore } from 'react';
import { X, Megaphone } from 'lucide-react';

interface AnnouncementBarProps {
  message: string;
  storageKey: string;
}

function getSnapshot(key: string) {
  return () => sessionStorage.getItem(key);
}

function getServerSnapshot() {
  return () => null;
}

function subscribe() {
  // sessionStorage doesn't fire events in the same tab, so this is a no-op.
  // The only mutation happens via handleDismiss which also sets local state.
  return () => {};
}

export default function AnnouncementBar({ message, storageKey }: AnnouncementBarProps) {
  const stored = useSyncExternalStore(subscribe, getSnapshot(storageKey), getServerSnapshot());
  const [localDismissed, setLocalDismissed] = useState(false);

  const handleDismiss = () => {
    sessionStorage.setItem(storageKey, '1');
    setLocalDismissed(true);
  };

  if (localDismissed || stored || !message) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-3 mb-6">
      <Megaphone size={18} className="text-primary shrink-0" />
      <p className="text-sm text-foreground flex-1">{message}</p>
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
