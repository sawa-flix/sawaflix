import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/creator/profile
 * Fetches the authenticated user's profile data (including all user details)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user profile from users table with all editable fields
    const { data: profile, error: fetchError } = await supabase
      .from('users')
      .select(`
        id, 
        username, 
        bio, 
        profile_image_url, 
        cover_image_url, 
        social_links, 
        region,
        ethnic_group,
        village,
        language_preference,
        location_region,
        favored_genres,
        created_at
      `)
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Profile fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: fetchError.message },
        { status: 500 }
      )
    }

    // Map database fields to frontend format for compatibility
    return NextResponse.json({
      id: profile.id,
      displayName: profile.username || '',
      bio: profile.bio || '',
      profileImage: profile.profile_image_url || '',
      bannerImage: profile.cover_image_url || '',
      socialLinks: profile.social_links || [],
      region: profile.region || '',
      ethnicGroup: profile.ethnic_group || '',
      village: profile.village || '',
      languagePreference: profile.language_preference || '',
      locationRegion: profile.location_region || '',
      favoredGenres: profile.favored_genres || [],
      createdAt: profile.created_at
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/creator/profile
 * Updates the authenticated user's profile with all fields
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      displayName,
      bio,
      profileImage,
      bannerImage,
      socialLinks = [],
      region,
      ethnicGroup,
      village,
      languagePreference,
      locationRegion,
      favoredGenres = []
    } = body

    // Validate required fields
    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      )
    }

    // Prepare update data with proper field mapping
    const updateData: any = {
      username: displayName.trim(),
      bio: bio?.trim() || '',
      social_links: socialLinks || [],
      region: region || null,
      ethnic_group: ethnicGroup || null,
      village: village || null,
      language_preference: languagePreference || null,
      location_region: locationRegion || null,
      favored_genres: favoredGenres && favoredGenres.length > 0 ? favoredGenres : null
    }

    // Only update image URLs if they're provided
    if (profileImage) {
      updateData.profile_image_url = profileImage
    }
    if (bannerImage) {
      updateData.cover_image_url = bannerImage
    }

    // Update user profile in database
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        displayName,
        bio,
        profileImage,
        bannerImage,
        socialLinks,
        region,
        ethnicGroup,
        village,
        languagePreference,
        locationRegion,
        favoredGenres
      }
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
