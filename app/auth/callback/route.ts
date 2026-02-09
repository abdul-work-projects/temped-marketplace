import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedType = searchParams.get('user_type') as 'teacher' | 'school' | null;
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user_type was already set (email/password signup or previous Google login)
        const hadUserType = !!user.user_metadata?.user_type;

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        let finalType = profile?.user_type;

        // If signup passed a user_type and the profile has the default (teacher),
        // update to the requested type (e.g. user chose "School" on signup page).
        if (requestedType && profile && profile.user_type !== requestedType) {
          await supabase
            .from('profiles')
            .update({ user_type: requestedType })
            .eq('id', user.id);

          // If switching to school, create the school record
          if (requestedType === 'school') {
            const { data: existingSchool } = await supabase
              .from('schools')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (!existingSchool) {
              await supabase.from('schools').insert({
                user_id: user.id,
                name: user.user_metadata?.full_name || '',
                email: user.email!,
              });
            }
          }

          finalType = requestedType;
        }

        // Populate profile with Google account data (name, avatar) if available
        const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || '') as string;
        const avatarUrl = (user.user_metadata?.avatar_url || '') as string;

        if (fullName || avatarUrl) {
          if (finalType === 'teacher') {
            const nameParts = fullName.trim().split(/\s+/);
            const firstName = nameParts[0] || '';
            const surname = nameParts.slice(1).join(' ') || '';

            const updates: Record<string, string> = {};
            if (firstName) updates.first_name = firstName;
            if (surname) updates.surname = surname;
            if (avatarUrl) updates.profile_picture = avatarUrl;

            if (Object.keys(updates).length > 0) {
              await supabase
                .from('teachers')
                .update(updates)
                .eq('user_id', user.id)
                .eq('first_name', ''); // Only update if name is still empty (first signup)
            }
          } else if (finalType === 'school') {
            const updates: Record<string, string> = {};
            if (fullName) updates.name = fullName;
            if (avatarUrl) updates.profile_picture = avatarUrl;

            if (Object.keys(updates).length > 0) {
              await supabase
                .from('schools')
                .update(updates)
                .eq('user_id', user.id)
                .eq('name', ''); // Only update if name is still empty (first signup)
            }
          }
        }

        // New Google user from login page — no type was chosen yet.
        // Redirect to type selection before going to dashboard.
        if (!hadUserType && !requestedType) {
          return NextResponse.redirect(`${origin}/auth/select-type`);
        }

        // Persist user_type in JWT metadata so client-side AuthContext can read it.
        // updateUser patches the record but doesn't re-sign the JWT,
        // so refreshSession gets a new JWT with the updated claims.
        if (finalType) {
          await supabase.auth.updateUser({ data: { user_type: finalType } });
          await supabase.auth.refreshSession();
        }

        if (finalType === 'school') {
          return NextResponse.redirect(`${origin}/school/dashboard`);
        } else if (finalType === 'admin') {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        } else {
          return NextResponse.redirect(`${origin}/teacher/dashboard`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`);
}
