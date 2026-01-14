'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  User,
  Settings,
  Briefcase,
  FileText,
  LogOut,
  Home,
  Users,
  Clock
} from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  links: SidebarLink[];
  userEmail?: string;
}

export default function Sidebar({ links, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#a435f0] flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1c1d1f]">
            TempEd
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#a435f0] bg-purple-50'
                  : 'text-[#1c1d1f] hover:text-[#a435f0] hover:bg-gray-50'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200">
        {userEmail && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1c1d1f] flex items-center justify-center text-white text-sm font-bold">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1c1d1f] truncate font-medium">{userEmail}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-[#1c1d1f] hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

// Predefined sidebar links for teachers
export const teacherSidebarLinks: SidebarLink[] = [
  {
    label: 'My Profile',
    href: '/teacher/profile',
    icon: <User size={20} />
  },
  {
    label: 'Profile Setup',
    href: '/teacher/setup',
    icon: <Settings size={20} />
  },
  {
    label: 'Available Jobs',
    href: '/teacher/dashboard',
    icon: <Briefcase size={20} />
  },
  {
    label: 'Jobs Applied',
    href: '/teacher/applications',
    icon: <FileText size={20} />
  }
];

// Predefined sidebar links for schools
export const schoolSidebarLinks: SidebarLink[] = [
  {
    label: 'My Profile',
    href: '/school/profile',
    icon: <User size={20} />
  },
  {
    label: 'Profile Setup',
    href: '/school/setup',
    icon: <Settings size={20} />
  },
  {
    label: 'Job Postings',
    href: '/school/dashboard',
    icon: <Briefcase size={20} />
  },
  {
    label: 'Active Listings',
    href: '/school/active',
    icon: <Clock size={20} />
  }
];
