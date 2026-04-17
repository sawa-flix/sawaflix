'use server'

import { createClient } from '@/utils/supabase/server'
// import { revalidatePath } from 'next/cache'


export async function updateCreatorMedia(
    formData: FormData,
    type: 'avatar' | 'banner'
) {
    const supabase = await createClient()
    const file = formData.get('file') as File

    if (!file) {
        throw new Error("No file selected for upload.")
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized")
    const isAvatar = type === 'avatar'
    const columnName = isAvatar ? 'profile_picture_url' : 'banner_url'
    const bucket = 'creator-assets'

    const fileExtension = file.name.split('.').pop()
    const filePath = `${user.id}/${type}_${Date.now()}.${fileExtension}`

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            upsert: true,
            contentType: file.type
        })

    if (uploadError) {
        console.error("Storage Error:", uploadError.message)
        throw new Error("Failed to upload image.")
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    const { error: updateError } = await supabase
        .from('creator_profiles')
        .update({ [columnName]: publicUrl })
        .eq('creator_id', user.id)

    if (updateError) {
        console.error("Database Update Error:", updateError.message)
        throw new Error("Image uploaded but failed to update profile link.")
    }

    //   revalidatePath('/creator/profile')

    return {
        success: true,
        url: publicUrl
    }
}