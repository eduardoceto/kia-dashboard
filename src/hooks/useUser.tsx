"use client";

import React, { createContext, useContext, useState, useEffect } from "react"; // Import React
import { createClient } from "@/src/utils/supabase/client"; // Import the specific error type if available
import { Loader2 } from "lucide-react";

// Define a more specific type for the profile if possible
// For now, using 'any' but adding 'role' for clarity
type UserProfile = {
    id: string
    employee_id: string
    role: string | null
    first_name: string
    last_name: string
    email: string | null
    is_active: boolean
    created_at: string
    locale: string
    area_id: string
} | null;


type UserContextType = {
    profile: UserProfile; // Use the specific type
    loading: boolean;
    isManager: boolean; // Add isManager flag
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

// No need for duplicate interface definition
// export interface UserProviderProps {
//     [propName: string]: any;
// }

export interface UserProviderProps {
    children: React.ReactNode; // Explicitly type children
}

export const UserContextProvider = (props: UserProviderProps) => {
    const { children } = props; // Destructure children
    const [profile, setProfile] = useState<UserProfile>(null);
    const [isManager, setIsManager] = useState<boolean>(false); // Add isManager state
    const [loading, setLoading] = useState(true); // Keep loading state
    const supabase = createClient();


    useEffect(() => {
        const checkUserAndRole = async () => { // Renamed function for clarity
            setIsManager(false); // Reset manager status
            setProfile(null); // Reset profile
            setLoading(true); // Start loading indicator here

            let sessionData = null;
            let authError = null;

            try {
                // Wrap getUser in its own try-catch
                try {
                    const { data, error } = await supabase.auth.getUser();
                    sessionData = data;
                    authError = error;
                } catch (getUserError) {
                    // Catch errors thrown directly by getUser, including AuthSessionMissingError
                    console.warn("Error calling supabase.auth.getUser():", getUserError);
                    authError = getUserError; // Assign the caught error
                }

                
                if (authError || !sessionData?.user) {
                    setLoading(false); 
                    return; 
                }

               
                const user = sessionData.user;

               
                const { data: userProfile, error: profileError } = await supabase
                    .from('users')
                    .select('*') 
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching user profile:', profileError);
                    
                } else {
                    
                    setProfile(userProfile);
                    
                    if (userProfile?.role === 'admin') {
                        setIsManager(true);
                    }
                }

            } catch (error) {
                // Catch potential errors from profile fetching or other logic
                console.error("Error in checkUserAndRole (outer catch):", error);
                // Ensure state is reset in case of unexpected errors
                setProfile(null);
                setIsManager(false);
            } finally {
                setLoading(false); // Stop loading regardless of outcome
            }
        };

        // Initial check on mount
        checkUserAndRole();

        // Add listener for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
             console.log("Auth state changed:", event);
             if (event === 'SIGNED_OUT') {
                 // User logged out, directly reset state
                 setProfile(null);
                 setIsManager(false);
                 setLoading(false); // Ensure loading is false on logout
             } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                 // User logged in, token refreshed, or user data updated
                 // Re-check user and role
                 checkUserAndRole();
             }
             // Handle other events if necessary
        });

        // Cleanup subscription on unmount
        return () => {
            subscription?.unsubscribe();
        };

    }, [supabase]); // Dependency array only includes supabase client instance

    const value = {
        profile,
        loading,
        isManager, // Pass isManager state in the context value
    };

    // Optional: Render children only when initial loading is done,
    // or let consuming components handle the loading state.
    if (loading && profile === null) { // Example: Show loading only on initial load
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <div className="flex flex-col items-center space-y-4 text-[#05141F]">
                    <Loader2 className="h-12 w-12 animate-spin" />
                    <p className="text-lg font-medium">Cargando usuario...</p>
                    <p className="text-sm text-muted-foreground">Por favor espera un momento.</p>
                </div>
            </main>
        );
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;


};

// useUser hook remains the same, but the returned context now includes isManager
export const useUser  = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context; // Returns { profile, loading, isManager }

};