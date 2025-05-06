import { redirect } from "next/navigation";

// The component can be sync if no other async operations are present
export default function Home({ params }: { params: { locale: string } }) {
  // Access params directly as it's already resolved for page components
  const { locale } = params;
  // Use the locale in the redirect path
  redirect(`/${locale}/dashboard`);
  // The redirect function throws an error to stop rendering and initiate the redirect,
  // so a return statement here is effectively unreachable but can be kept if preferred.
  // return null;
}