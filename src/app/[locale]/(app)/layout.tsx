import HeaderSide from "@/src/components/headerSide";
import type { ReactNode } from "react";
import { createClient } from "@/src/utils/supabase/server";
import { redirect } from "next/navigation";
import getUserInfo from "@/src/actions/getUserInfo";
import LogUploadProvider from "@/src/providers/LogUploadProvider";

import ManagerProvider from "@/src/providers/ManagerProvider";




export default async function AppLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // Determine avatar representation: URL or a specific string identifier
    let avatarRepresentation: string | null = user.user_metadata?.avatar_url ?? null;
    if (!avatarRepresentation) {
        // Use a specific string when there's no avatar URL
        avatarRepresentation = 'default_icon';
    }

    const userProfile = await getUserInfo();

    return(
        <>
            <ManagerProvider>
                <LogUploadProvider />
                <HeaderSide userProfile={userProfile}>
                    {children}
                </HeaderSide>
            </ManagerProvider>
        </>
    );
}
