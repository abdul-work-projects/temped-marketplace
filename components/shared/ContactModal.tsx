'use client';

import { X, Mail, Phone } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  phone?: string;
}

export default function ContactModal({ isOpen, onClose, name, email, phone }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1c1d1f]">Contact {name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail size={20} className="text-[#2563eb]" />
            <div>
              <p className="text-sm font-bold text-[#1c1d1f]">Email</p>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
          </a>

          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Phone size={20} className="text-[#2563eb]" />
              <div>
                <p className="text-sm font-bold text-[#1c1d1f]">Phone</p>
                <p className="text-sm text-gray-600">{phone}</p>
              </div>
            </a>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 text-sm font-bold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
