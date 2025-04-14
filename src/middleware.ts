import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest, NextResponse } from 'next/server'; // Import NextResponse
import { updateSession } from '@/src/utils/supabase/middleware';

// Create the next-intl middleware instance
const handleI18nRouting = createIntlMiddleware(routing);

// Define your main middleware function
export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first
  const i18nResponse = handleI18nRouting(request);

  // If next-intl returned a response (e.g., redirect for locale), return it
  if (i18nResponse.status !== 200 || i18nResponse.headers.get('x-middleware-rewrite')) {
      return i18nResponse;
  }

  // 2. If next-intl didn't redirect/rewrite, run the Supabase auth middleware
  // Pass the original request, not the i18nResponse
  const authResponse = await updateSession(request);

  // If auth middleware returns a response (e.g., redirect to login), return it
  if (authResponse) {
      // Check if authResponse is already a NextResponse, otherwise wrap it if needed
      // (updateSession should ideally return NextResponse directly)
      return authResponse instanceof NextResponse ? authResponse : new NextResponse(authResponse.body, authResponse);
  }

  // If neither middleware returned a response, return the response from next-intl
  // (which might contain locale headers but didn't redirect/rewrite)
  return i18nResponse;
}

// Make the combined function the default export
export default middleware;

// Keep your existing config
export const config = {
  matcher: [
    // Skip internal paths and files
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
    // Match specific paths if needed, ensure this doesn't conflict
    // '/([\\w-]+)?/users/(.+)', // Review if this specific matcher is still needed with the main one
  ]
};