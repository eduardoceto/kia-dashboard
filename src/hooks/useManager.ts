import { createClient } from "@/src/utils/supabase/client"; // Import the CLIENT client
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js"; // Import User type

// Define the shape of your profile data from the public table
type UserProfile = {
    id: string; // Assuming the profile table has the user's ID
    role: string | null;
    name: string | null;
    email: string | null;
    // Add other fields from your 'profiles' table as needed
};

export const useManager = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isManager, setIsManager] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [authUser, setAuthUser] = useState<User | null>(null); // Store the auth user

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            setIsLoading(true);
            setError(null);
            const supabase = createClient(); // Use client-side client

            // 1. Get the authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error("Auth Error:", authError.message);
                setError("Failed to get user authentication status.");
                setAuthUser(null);
                setUserProfile(null);
                setIsManager(false);
                setIsLoading(false);
                return;
            }

            if (!user) {
                // No user logged in
                setAuthUser(null);
                setUserProfile(null);
                setIsManager(false);
                setIsLoading(false);
                return;
            }

            // User is authenticated, store auth user info
            setAuthUser(user);

            // 2. Fetch the user's profile from the public table using their ID
            try {
                // Replace 'profiles' with your actual table name
                // Replace 'id' with the column name in 'profiles' that matches user.id
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles') // YOUR PUBLIC TABLE NAME
                    .select('*') // Select specific columns like 'role, name, email' for efficiency
                    .eq('id', user.id) // Filter by the authenticated user's ID
                    .single(); // Expect only one row

                if (profileError) {
                    // Handle case where profile might not exist yet or other DB errors
                    console.error("Profile Fetch Error:", profileError.message);
                    if (profileError.code === 'PGRST116') { // Code for 'No rows found' with .single()
                         setError("User profile not found.");
                    } else {
                        setError("Failed to fetch user profile.");
                    }
                    setUserProfile(null);
                    setIsManager(false);
                } else if (profileData) {
                    const typedProfile = profileData as UserProfile; // Cast to your defined type
                    setUserProfile(typedProfile);
                    // 3. Check the role
                    setIsManager(typedProfile.role === 'manager'); // Case-sensitive check
                } else {
                     // Should not happen with .single() unless error occurred, but good practice
                    setError("User profile not found.");
                    setUserProfile(null);
                    setIsManager(false);
                }

            } catch (catchError: any) {
                console.error("Unexpected Error:", catchError);
                setError(catchError.message || "An unexpected error occurred.");
                setUserProfile(null);
                setIsManager(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserAndProfile();
        // Re-run if auth state changes (optional, depends on how you handle login/logout)
        // const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        //   fetchUserAndProfile();
        // });

        // return () => {
        //   authListener?.subscription.unsubscribe();
        // };
    }, []); // Run once on mount

    return {
        userProfile, // The full profile data from your public table
        authUser,    // The user object from Supabase Auth
        isManager,   // Boolean indicating if the user is a manager
        isLoading,   // Loading state
        error        // Error message, if any
    };
};