import React, { createContext, useContext, useState, useEffect } from "react"; // Import React
import { createClient } from "@/src/utils/supabase/client"; 



type UserContextType = {
    profile: any;
    loading: boolean;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export interface UserProviderProps {
    [propName: string]: any;
}

export interface UserProviderProps {
    children: React.ReactNode; // Explicitly type children
}

export const UserContextProvider = (props: UserProviderProps) => {
    const { children } = props; // Destructure children
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true); // Keep loading state
    // const { theme } = useTheme(); // Remove if not used elsewhere in this component
    const supabase = createClient();


    useEffect(() => {
        const checkUser = async () => {
            // No need to setLoading(true) here if it starts as true
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setProfile(null);
                    return;
                }

                const { data: userProfile, error: profileError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching user profile:', profileError);
                    setProfile(null);
                    return;
                }

                setProfile(userProfile);

            } catch (error) {
                console.error("Error in checkManagerRole:", error);
                setProfile(null);
            } finally {
                setLoading(false); // Stop loading regardless of outcome
            }
        };


        if (loading) {
             checkUser();
        }
    }, [supabase, loading]); // Keep supabase dependency, loading might be added if needed for re-fetch logic

    const value = {
        profile,
        loading, // Pass loading state in the context value
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;


};

export const useUser  = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;

};