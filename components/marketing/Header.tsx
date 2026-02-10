'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketingHeader() {
  const pathname = usePathname();

  const isTeacherPage = pathname === '/teacher-home' || pathname === '/';
  const isSchoolPage = pathname === '/school-home';

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">TempEd</span>
          </Link>

          {/* Navigation Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-full p-1">
            <Link
              href="/teacher-home"
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isTeacherPage
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Teachers
            </Link>
            <Link
              href="/school-home"
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isSchoolPage
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Schools
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
