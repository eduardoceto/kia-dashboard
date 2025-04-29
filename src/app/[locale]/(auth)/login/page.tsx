import { createClient } from "@/src/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "./components/LoginForm";

export default async function LoginPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    

    if (user) {
        const { data } = await supabase
        .from('users')
        .select('locale')
        .eq('id', user?.id)
        .single();
        const userLocale = data?.locale;
        
        redirect(`/${userLocale}/dashboard`); // Or use user's locale if available
    }

    return <LoginForm />;
}
