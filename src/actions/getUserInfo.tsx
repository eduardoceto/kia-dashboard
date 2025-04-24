import { createClient } from "../utils/supabase/server"; // Changed import path
import { UserProfile } from "@/types";

const GetUserInfo = async (): Promise<UserProfile> => {
    const supabase = await createClient();
    const { data: sessionData , error: sessionError } = await supabase.auth.getUser();
    if (sessionError) {
        throw new Error("Failed to fetch user");
    }

    const supaid = sessionData.user?.id;

    const { data, error } = await supabase.from('users').select('*').eq('id', supaid).single();

    if (error) {
        throw new Error("Failed to fetch user profile");
    }

    const userProfile = {
        employee_id: data.employee_id || null,
        email: data.email,
        full_name: data.full_name || null,
        role: data.role,
        is_active: data.is_active,
        created_at: data.created_at,
        id: data.id,
        locale: data.locale
    };

    return userProfile;
}

export default GetUserInfo;