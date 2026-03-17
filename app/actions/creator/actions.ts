'use server'
import { createClient } from '@/utils/supabase/server'
// import { revalidatePath } from 'next/cache'

interface ProfileUpdate {
    stage_name?: string;
    bio?: string;
}

export async function editProfile(formData: FormData) {
    const supabase = await createClient()

    // Extract and type-cast the data
    const profileData: ProfileUpdate = {
        stage_name: formData.get('stage_name') as string,
        bio: formData.get('bio') as string,
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error("Authentication required to update profile")
    }

    const { error } = await supabase
        .from('creator_profiles')
        .update(profileData)
        .eq('creator_id', user.id)

    if (error) {
        console.error('Update Error:', error.message)
        throw new Error(error.message)
    }

    //   revalidatePath('/creator/profile') *this route does not exist so i commented it out till the front end guys do this one
    return { success: true }
}