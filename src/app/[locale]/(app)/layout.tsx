import HeaderSide from "@/src/components/headerSide";
import type { ReactNode } from "react";
import LogUploadProvider from "@/src/providers/LogUploadProvider";
import UserProvider from "@/src/providers/UserProvider";


export default async function AppLayout({ children }: { children: ReactNode }) {
    
    return(
        <> 
            <UserProvider>
                <LogUploadProvider />
                <HeaderSide>
                    {children}
                </HeaderSide>
            </UserProvider>
        </>
    );
}
