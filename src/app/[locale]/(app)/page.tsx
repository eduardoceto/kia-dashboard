import { redirect } from "next/navigation";

// Add params to the function signature to access the locale
export default function Home({ params }: { params: { locale: string } }) {
  // Use the locale from params in the redirect path
  redirect(`/${params.locale}/dashboard`);
  return null; // Keep returning null as redirect throws an error
}