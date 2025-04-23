import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/src/utils/supabase/middleware';
import { cookies } from 'next/headers';
import { createClient } from './utils/supabase/server';

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // --- 1. Handle i18n ---
  const i18nResponse = handleI18nRouting(request);
  // If next-intl performed a redirect (e.g., adding locale prefix), return it immediately
  if (i18nResponse.status !== 200) {
    return i18nResponse;
  }

  // --- 2. Handle Authentication (Session Refresh) ---
  // updateSession handles reading request cookies and potentially writing response cookies
  let response = i18nResponse; // Start with the response from i18n (might contain rewrites)
  const authResult = await updateSession(request); // Pass response to updateSession

  // Check if updateSession returned a redirect response (e.g., to login)
  if (authResult instanceof NextResponse && authResult.headers.has('location')) {
      return authResult;
  }
  // If updateSession modified the response (e.g., set cookies), use the modified response
  response = authResult ?? response;


  // --- 3. Handle Authorization (Role Check) ---
  // Create a Supabase client instance to read user data using cookies potentially set by updateSession
  const supabase = await createClient();

  // Get the user from the potentially refreshed session
  const { data: { user } } = await supabase.auth.getUser();

  // Define protected paths and required role
  const protectedPaths = ['/analytics', '/permissions', '/export', 'other']; // Paths requiring admin role
  const requiredRole = 'admin';
  const locale = request.nextUrl.pathname.split('/')[1] || routing.defaultLocale;
  const requestedPath = request.nextUrl.pathname.replace(`/${locale}`, '') || '/';

  // Check if the requested path requires authorization
  const isPathProtected = protectedPaths.some(path => requestedPath.startsWith(path));

  if (isPathProtected) {
    // If user is not logged in (should be caught by updateSession, but acts as safeguard)
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      return NextResponse.redirect(loginUrl);
    }

    // User is logged in, fetch their role from the database
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users') // Your table storing user roles
        .select('role') // The column storing the role
        .eq('id', user.id)
        .single();

      // Handle potential errors during profile fetch
      if (profileError || !profile) {
        console.error("Middleware: Error fetching profile or profile not found.", profileError);
        const unauthorizedUrl = request.nextUrl.clone();
        unauthorizedUrl.pathname = `/${locale}/unauthorized`; // Redirect to an unauthorized page
        return NextResponse.redirect(unauthorizedUrl);
      }

      // Check if the user has the required role
      if (profile.role !== requiredRole) {
        // User does not have the required role, redirect them
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${locale}/dashboard`; // Redirect non-admins to dashboard
        return NextResponse.redirect(redirectUrl);
      }
      // User has the required role, allow access (do nothing, proceed to step 4)

    } catch (e) {
        console.error("Middleware: Unexpected error during role check", e);
        const errorUrl = request.nextUrl.clone();
        errorUrl.pathname = `/${locale}/unauthorized`; // Redirect on unexpected errors
        return NextResponse.redirect(errorUrl);
    }
  }

  // --- 4. Allow Request ---
  // If not redirected by i18n, auth, or authorization, allow the request
  // Return the response potentially modified by updateSession (e.g., with session cookies)
  // or the original i18nResponse if authResult was null
  return response;
}

// Configuration for the middleware matcher
export const config = {
  matcher: [
    // Skip internal paths and static files
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ]
};