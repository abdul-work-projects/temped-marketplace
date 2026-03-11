'use client';

import { X, Mail, Phone, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  phone?: string;
  subjects?: string[];
}

export default function ContactModal({ isOpen, onClose, name, email, phone, subjects }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-md z-10 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Contact {name}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Mail size={20} className="text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </a>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Phone size={20} className="text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">Phone</p>
                  <p className="text-sm text-muted-foreground">{phone}</p>
                </div>
              </a>
            )}

            {subjects && subjects.length > 0 && (
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={20} className="text-primary" />
                  <p className="text-sm font-bold text-foreground">Subjects</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="mt-6 w-full"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
