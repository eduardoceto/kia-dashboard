import { createClient } from "../utils/supabase/server"; // Changed import path
import { cookies } from "next/headers";
import { UserProfile } from "@/types";

const getUserInfo = async (): Promise<UserProfile> => {
    const supabase = await createClient();
    const { data: sessionData , error: sessionError } = await supabase.auth.getUser();
    if (sessionError) {
        throw new Error("Failed to fetch user");
    }

    const supaid = sessionData.user?.id;

    const { data, error } = await supabase.from('users').select('employee_id, email, role, full_name').eq('id', supaid).single();

    if (error) {
        throw new Error("Failed to fetch user profile");
    }

    const userProfile: UserProfile = {
        employee_id: data.employee_id || null,
        email: data.email,
        name: data.full_name || null,
        role: data.role,
    };

    return userProfile;
}

export default getUserInfo;