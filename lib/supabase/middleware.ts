import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() validates the JWT signature against Supabase's published public keys.
  // More secure than getSession() (no signature validation) and faster than getUser()
  // (no network call to Supabase Auth API on every navigation/prefetch).
  const { data: claimsData } = await supabase.auth.getClaims();

  const claims = claimsData?.claims ?? null;
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ['/', '/teacher-home', '/school-home', '/auth/login', '/auth/signup', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith('/auth/')
  );

  // If not authenticated and trying to access protected route
  if (!claims && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth pages, redirect to dashboard.
  if (claims && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    const userType = claims.user_metadata?.user_type;
    const url = request.nextUrl.clone();
    if (userType === 'school') {
      url.pathname = '/school/dashboard';
    } else if (userType === 'admin') {
      url.pathname = '/admin/dashboard';
    } else {
      url.pathname = '/teacher/dashboard';
    }
    return NextResponse.redirect(url);
  }

  // Protect admin routes using validated JWT claims
  if (claims && pathname.startsWith('/admin')) {
    const userType = claims.user_metadata?.user_type;
    if (userType !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
