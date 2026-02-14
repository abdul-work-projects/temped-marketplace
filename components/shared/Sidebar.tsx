'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Settings,
  Briefcase,
  FileText,
  LogOut,
  Users,
  ShieldCheck,
  MessageSquare,
  LayoutDashboard,
  GraduationCap,
  School,
  PlusCircle,
  X,
  Tag,
} from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  links: SidebarLink[];
  userEmail?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const PP_CACHE_KEY = 'sidebar-profile-pic-path';

function getCachedPath(userId: string): string | undefined {
  try {
    const raw = sessionStorage.getItem(PP_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed.userId === userId) return parsed.path;
  } catch { /* ignore */ }
  return undefined;
}

function setCachedPath(userId: string, path: string) {
  try { sessionStorage.setItem(PP_CACHE_KEY, JSON.stringify({ userId, path })); } catch { /* ignore */ }
}

function useProfilePicturePath(): string | undefined {
  const { user } = useAuth();
  const supabaseRef = useRef(createClient());
  const [path, setPath] = useState<string | undefined>(() => user ? getCachedPath(user.id) : undefined);

  const fetchPath = useCallback(async () => {
    if (!user) return;
    const table = user.type === 'teacher' ? 'teachers' : user.type === 'school' ? 'schools' : null;
    if (!table) return;

    const { data } = await supabaseRef.current
      .from(table)
      .select('profile_picture')
      .eq('user_id', user.id)
      .single();

    if (data?.profile_picture) {
      setCachedPath(user.id, data.profile_picture);
      setPath(data.profile_picture);
    }
  }, [user]);

  useEffect(() => { fetchPath(); }, [fetchPath]);

  return path;
}

export default function Sidebar({ links, userEmail, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const profilePicPath = useProfilePicturePath();
  const profilePicUrl = useSignedUrl('profile-pictures', profilePicPath);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    onClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            TempEd
          </h1>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-primary bg-primary/5'
                  : 'text-foreground hover:text-primary hover:bg-muted/50'
              }`}
            >
              {link.icon}
              <span className="flex-1">{link.label}</span>
              {link.badge != null && link.badge > 0 && (
                <span className="ml-auto min-w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold px-1.5">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section — always at bottom */}
      <div className="border-t border-border mt-auto">
        {userEmail && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  userEmail[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate font-medium">{userEmail}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-foreground hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border h-screen sticky top-0 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="relative w-64 h-full bg-card flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

// Predefined sidebar links for teachers
export const teacherSidebarLinks: SidebarLink[] = [
  {
    label: 'My Profile',
    href: '/teacher/profile',
    icon: <User size={20} />,
  },
  {
    label: 'Profile Setup',
    href: '/teacher/setup',
    icon: <Settings size={20} />,
  },
  {
    label: 'Available Jobs',
    href: '/teacher/dashboard',
    icon: <Briefcase size={20} />,
  },
  {
    label: 'Jobs Applied',
    href: '/teacher/applications',
    icon: <FileText size={20} />,
  },
];

// Predefined sidebar links for schools
export const schoolSidebarLinks: SidebarLink[] = [
  {
    label: 'My Profile',
    href: '/school/profile',
    icon: <User size={20} />,
  },
  {
    label: 'Profile Setup',
    href: '/school/setup',
    icon: <Settings size={20} />,
  },
  {
    label: 'Job Postings',
    href: '/school/dashboard',
    icon: <Briefcase size={20} />,
  },
  {
    label: 'Post New Job',
    href: '/school/post-job',
    icon: <PlusCircle size={20} />,
  },
];

// Predefined sidebar links for admins
export const adminSidebarLinks: SidebarLink[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Testimonials',
    href: '/admin/testimonials',
    icon: <MessageSquare size={20} />,
  },
  {
    label: 'Verify Teachers',
    href: '/admin/verify',
    icon: <ShieldCheck size={20} />,
  },
  {
    label: 'Verify Schools',
    href: '/admin/verify-schools',
    icon: <ShieldCheck size={20} />,
  },
  {
    label: 'Teachers',
    href: '/admin/teachers',
    icon: <GraduationCap size={20} />,
  },
  {
    label: 'Schools',
    href: '/admin/schools',
    icon: <School size={20} />,
  },
  {
    label: 'Tags',
    href: '/admin/tags',
    icon: <Tag size={20} />,
  },
];
