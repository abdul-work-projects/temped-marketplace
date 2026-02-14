'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">TempEd</span>
          </Link>

          {/* Auth Buttons — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-foreground hover:bg-muted transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown — auth buttons only */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-2 px-2">
              <Button variant="ghost" size="sm" asChild className="w-full justify-center">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Log In</Link>
              </Button>
              <Button size="sm" asChild className="w-full justify-center">
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
