'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1c1d1f]">{isEdit ? 'Edit Review' : 'Write a Review'}</h3>
          <button onClick={onClose} disabled={submitting} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Share your experience working with <span className="font-bold text-[#1c1d1f]">{recipientName}</span>
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review here..."
          rows={5}
          disabled={submitting}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent disabled:opacity-50 resize-none"
        />

        <p className="text-xs text-gray-400 mt-2">Your review will be reviewed by our team and may take up to 7 days to go live.</p>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 text-sm font-bold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !comment.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEdit ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              isEdit ? 'Update Review' : 'Submit Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
