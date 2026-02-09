'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase } from 'lucide-react';

export default function MarketingHeader() {
  const pathname = usePathname();

  const isTeacherPage = pathname === '/teacher-home' || pathname === '/';
  const isSchoolPage = pathname === '/school-home';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#2563eb] flex items-center justify-center">
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1c1d1f]">TempEd</span>
          </Link>

          {/* Navigation Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <Link
              href="/teacher-home"
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isTeacherPage
                  ? 'bg-[#2563eb] text-white'
                  : 'text-gray-600 hover:text-[#1c1d1f]'
              }`}
            >
              For Teachers
            </Link>
            <Link
              href="/school-home"
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isSchoolPage
                  ? 'bg-[#2563eb] text-white'
                  : 'text-gray-600 hover:text-[#1c1d1f]'
              }`}
            >
              For Schools
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-bold text-[#1c1d1f] hover:text-[#2563eb] transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
