import { redirect } from "next/navigation";

// Make the component async
export default async function Home({ params }: { params: { locale: string } }) {
  // Await the params object to access its properties
  const { locale } = await params;
  // Use the awaited locale in the redirect path
  redirect(`/${locale}/dashboard`);
  // This return statement will likely not be reached due to redirect,
  // but it's good practice to keep it for type safety if redirect logic changes.
  return null;
}