import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { successResponse } from '@/lib/utils/api-response'
import { handleApiError } from '@/lib/utils/error-handler'
import {
  validateImageFile,
  generateUniqueFilename,
  saveFile,
} from '@/lib/utils/file-upload'
import * as imageService from '@/lib/services/image.service'

/**
 * GET /api/images
 * Get all images
 */
export async function GET() {
  try {
    // Require authentication
    await requireAuth()

    // Get all images
    const images = await imageService.getAllImages()

    return successResponse(images)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/images
 * Upload a new image
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth()

    // Parse form data (not JSON for file uploads)
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)

    // Save file to disk
    const path = await saveFile(file, filename)

    // Create image record in database
    const image = await imageService.createImage(path)

    return successResponse(
      {
        ...image,
        url: path, // Include full URL for client convenience
      },
      'Image uploaded successfully',
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
