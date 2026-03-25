import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const formData = await request.formData()

        const stage_name = formData.get('stage_name') as string | null
        const bio = formData.get('bio') as string | null
        const ethnic_group = formData.get('ethnic_group') as string | null
        const socialLinksRaw = formData.get('social_links') as string | null
        const social_links = socialLinksRaw ? JSON.parse(socialLinksRaw) : null

        // Extract files
        const profile_picture = formData.get('profile_picture') as File | null
        const banner = formData.get('banner') as File | null

        let profile_picture_url = undefined
        let banner_url = undefined

        const uploadImage = async (file: File, folder: string) => {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${folder}_${Date.now()}.${fileExt}`

            const { error } = await supabase.storage
                .from('creator-assets')
                .upload(fileName, file, { upsert: true })

            if (error) throw new Error(`Failed to upload ${folder}: ${error.message}`)

            // Return the public URL
            const { data: publicUrlData } = supabase.storage
                .from('creator-assets')
                .getPublicUrl(fileName)

            return publicUrlData.publicUrl
        }

        // 4. Upload files if they exist in the payload
        if (profile_picture && profile_picture.size > 0) {
            profile_picture_url = await uploadImage(profile_picture, 'profile')
        }

        if (banner && banner.size > 0) {
            banner_url = await uploadImage(banner, 'banner')
        }

        // Only include fields that were actually sent/updated
        const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        }

        if (stage_name !== null) updatePayload.stage_name = stage_name
        if (bio !== null) updatePayload.bio = bio
        if (ethnic_group !== null) updatePayload.ethnic_group = ethnic_group
        if (social_links !== null) updatePayload.social_links = social_links
        if (profile_picture_url) updatePayload.profile_picture_url = profile_picture_url
        if (banner_url) updatePayload.banner_url = banner_url

        // 6. Update the database
        const { error: updateError } = await supabase
            .from('creator_profiles')
            .update(updatePayload)
            .eq('creator_id', user.id) // Ensure they only update their own profile!

        if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`)
        }

        return NextResponse.json({ success: true, message: 'Profile updated successfully' })

    } catch (error: unknown) {
        console.error('Creator Profile Edit Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}