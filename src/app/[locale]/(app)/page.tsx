import { redirect } from "next/navigation";


export default function Home({ params }: { params: { locale: string } }) {

  const { locale } = params;

  redirect(`/${locale}/dashboard`);

}