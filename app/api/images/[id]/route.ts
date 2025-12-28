import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { imageIdDto } from '@/lib/dto/image.dto'
import { successResponse } from '@/lib/utils/api-response'
import { handleApiError } from '@/lib/utils/error-handler'
import * as imageService from '@/lib/services/image.service'

/**
 * GET /api/images/:id
 * Get a single image by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth()

    // Await and validate params
    const resolvedParams = await params
    const { id } = imageIdDto.parse(resolvedParams)

    // Get image
    const image = await imageService.getImageById(id)

    return successResponse(image)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/images/:id
 * Delete an image
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth()

    // Await and validate params
    const resolvedParams = await params
    const { id } = imageIdDto.parse(resolvedParams)

    // Delete image
    await imageService.deleteImage(id)

    return successResponse(null, 'Image deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
