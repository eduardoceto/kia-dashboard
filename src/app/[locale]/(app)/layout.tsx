import HeaderSide from "@/src/components/headerSide";
import type { ReactNode } from "react";
import { createClient } from "@/src/utils/supabase/server";
import { redirect } from "next/navigation";
import getUserInfo from "@/src/actions/getUserInfo";
import LogUploadProvider from "@/src/providers/LogUploadProvider";

import ManagerProvider from "@/src/providers/ManagerProvider";
import UserProvider from "@/src/providers/UserProvider";




export default async function AppLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }


    return(
        <>
            <ManagerProvider>
            <UserProvider>
                <LogUploadProvider />
                <HeaderSide>
                    {children}
                </HeaderSide>
            </UserProvider>
            </ManagerProvider>
        </>
    );
}
