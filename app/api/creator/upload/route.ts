import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/creator/upload
 * Handles profile image uploads to Supabase storage (user-profile-assets bucket)
 * Used for all user profile images (profile picture and banner)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'No category provided' },
        { status: 400 }
      )
    }

    // Log file details for debugging
    console.log('Upload initiated:', {
      fileName: file.name,
      fileSize: file.size,
      fileMimeType: file.type,
      category
    })

    // Validate file type (check MIME type and extension)
    const validImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    const unsupportedWebExtensions = ['heic', 'heif']

    if (fileExtension && unsupportedWebExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'HEIC/HEIF files cannot be displayed in browsers. Please convert to JPG or PNG before uploading.' },
        { status: 400 }
      )
    }
    
    // Accept if MIME type is image/* OR if extension is valid
    const hasMimeType = validImageMimeTypes.includes(file.type) || file.type.startsWith('image/')
    const hasValidExtension = fileExtension && validExtensions.includes(fileExtension)
    
    console.log('File validation:', {
      mimeType: file.type,
      extension: fileExtension,
      hasMimeType,
      hasValidExtension,
      fileName: file.name,
      validMimeTypes: validImageMimeTypes,
      validExtensions
    })
    
    // If no MIME type but has valid extension, allow it (FormData sometimes strips MIME type)
    if (!hasMimeType && !hasValidExtension) {
      console.error('File validation failed', {
        fileName: file.name,
        mimeType: file.type,
        extension: fileExtension
      })
      return NextResponse.json(
        { error: `Invalid file format. Received: ${file.type || 'unknown'}, Extension: .${fileExtension || 'none'}. Only JPG, PNG, WebP, and GIF are allowed.` },
        { status: 400 }
      )
    }

    // Validate file size (20MB max for banners, 5MB for profile images)
    const maxSize = category === 'cover_image' ? 20 * 1024 * 1024 : 5 * 1024 * 1024
    const maxSizeMB = maxSize / (1024 * 1024)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSizeMB}MB limit` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `${user.id}/${category}/${timestamp}.${ext}`

    console.log('Uploading file:', { filename, bucket: 'user-profile-assets' })

    // Upload to Supabase storage (user-profile-assets bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-profile-assets')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if file exists
      })

    if (uploadError) {
      console.error('Storage upload error:', {
        message: uploadError.message,
        status: uploadError.status,
        statusCode: uploadError.statusCode,
        details: uploadError,
        filename,
        fileSize: file.size,
        fileMimeType: file.type
      })

      const isRlsError = uploadError.message?.toLowerCase().includes('row-level security')
      const errorMessage = isRlsError
        ? 'Upload permission denied. Please sign in again and retry.'
        : uploadError.message?.toLowerCase().includes('payload too large') || uploadError.message?.toLowerCase().includes('exceeded')
          ? `File size exceeds the ${maxSizeMB}MB limit for this image type.`
          : 'Failed to upload file to storage. Please check file format and size.'

      return NextResponse.json(
        { error: errorMessage, details: uploadError.message },
        { status: isRlsError ? 403 : 500 }
      )
    }

    console.log('Upload successful:', { filename, path: uploadData?.path })

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-profile-assets')
      .getPublicUrl(uploadData.path)

    const publicUrl = urlData.publicUrl
    const dbColumn = category === 'cover_image' ? 'cover_image_url' : 'profile_image_url'

    const { error: dbError } = await supabase
      .from('users')
      .update({ [dbColumn]: publicUrl })
      .eq('id', user.id)

    if (dbError) {
      console.error('Failed to save image URL to profile:', dbError)
      await supabase.storage.from('user-profile-assets').remove([uploadData.path])
      return NextResponse.json(
        { error: 'Image uploaded but failed to save to your profile. Please try again.', details: dbError.message },
        { status: 500 }
      )
    }

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard/edit-profile')

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uploadData.path,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
