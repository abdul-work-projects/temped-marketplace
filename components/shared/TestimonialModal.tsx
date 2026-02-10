'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  recipientName: string;
  submitting: boolean;
  initialComment?: string;
}

export default function TestimonialModal({ isOpen, onClose, onSubmit, recipientName, submitting, initialComment }: TestimonialModalProps) {
  const [comment, setComment] = useState(initialComment || '');
  const isEdit = !!initialComment;

  useEffect(() => {
    setComment(initialComment || '');
  }, [initialComment]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onSubmit(comment.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => !submitting && onClose()} />
      <div className="relative bg-card rounded-lg shadow-xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">{isEdit ? 'Edit Review' : 'Write a Review'}</h3>
          <button onClick={onClose} disabled={submitting} className="text-muted-foreground hover:text-foreground disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Share your experience working with <span className="font-bold text-foreground">{recipientName}</span>
        </p>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review here..."
          rows={5}
          disabled={submitting}
          className="resize-none"
        />

        <p className="text-xs text-muted-foreground mt-2">Your review will be reviewed by our team and may take up to 7 days to go live.</p>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !comment.trim()}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEdit ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              isEdit ? 'Update Review' : 'Submit Review'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
