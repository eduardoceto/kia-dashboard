import React, { createContext, useContext, useState, useEffect } from "react"; // Import React
import { createClient } from "@/src/utils/supabase/client"; 


type ManagerContextType = {
    isManager: boolean | null;
    setIsManager: (isManager: boolean | null) => void;
    profile: any;
};

export const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

export interface ManagerProviderProps {
    [propName: string]: any;
}

export const ManagerContextProvider = (props: ManagerProviderProps) => {
    const { children } = props;
    const [isManager, setIsManager] = useState<boolean | null>(null);
    const [profile, setProfile] = useState<any>(null); // Add state for profile
    const supabase = createClient();


    useEffect(() => {
        const checkManagerRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsManager(false); // No user, not a manager
                setProfile(null);
                return;
            }

            const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            setProfile(userProfile); // Store profile data

            if (profileError) {
                console.error('Error fetching user profile:', profileError);
                setIsManager(null); // Error state
                return;
            }

            if (userProfile?.role === 'admin') {
                setIsManager(true);
            } else {
                setIsManager(false);
            }
        };

        checkManagerRole();
    }, [supabase]); // Add supabase as dependency

    const value = {
        isManager,
        setIsManager,
        profile, // Provide profile through context
    };

    // Use React.createElement instead of JSX to avoid issues in .ts files
    return <ManagerContext.Provider value={value} {...props} />;


};

export const useManager  = () => {
    const context = useContext(ManagerContext);
    if (context === undefined) {
        throw new Error("useManager must be used within a ManagerProvider");
    }
    return context;
    
};