'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { UserType } from '@/types';

export default function SelectTypePage() {
  const { user, isLoading, confirmUserType } = useAuth();
  const [selecting, setSelecting] = useState<UserType | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSelect = async (type: UserType) => {
    setSelecting(type);
    setError('');

    try {
      const result = await confirmUserType(type);

      if (!result.success) {
        setError(result.error || 'Failed to update account type. Please try again.');
        setSelecting(null);
        return;
      }

      router.push(type === 'school' ? '/school/dashboard' : '/teacher/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setSelecting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 w-full">
          <div className="w-12 h-12 bg-[#2563eb] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-3xl font-bold text-[#1c1d1f]">TempEd</span>
        </Link>

        <h2 className="text-center text-2xl font-bold text-[#1c1d1f] mb-2">
          Welcome to TempEd
        </h2>
        <p className="text-center text-gray-600 mb-8">
          How will you be using TempEd?
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleSelect('teacher')}
            disabled={selecting !== null}
            className="w-full flex items-center gap-4 p-6 border-2 border-gray-300 hover:border-[#2563eb] transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selecting === 'teacher' ? (
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-[#2563eb]" />
              </div>
            )}
            <div className="text-left">
              <p className="font-bold text-[#1c1d1f] text-lg">I&apos;m a Teacher</p>
              <p className="text-sm text-gray-600">Find teaching opportunities at schools</p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('school')}
            disabled={selecting !== null}
            className="w-full flex items-center gap-4 p-6 border-2 border-gray-300 hover:border-[#2563eb] transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selecting === 'school' ? (
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-[#2563eb]" />
              </div>
            )}
            <div className="text-left">
              <p className="font-bold text-[#1c1d1f] text-lg">I&apos;m a School</p>
              <p className="text-sm text-gray-600">Post jobs and find qualified teachers</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
