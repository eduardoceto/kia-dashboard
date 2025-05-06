import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/src/utils/supabase/middleware';

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


  return response;
}

// Configuration for the middleware matcher
export const config = {
  matcher: [
    // Skip internal paths and static files
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ]
};
