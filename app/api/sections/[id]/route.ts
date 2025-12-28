import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { sectionIdDto, updateSectionDto } from '@/lib/dto/section.dto'
import { successResponse } from '@/lib/utils/api-response'
import { handleApiError } from '@/lib/utils/error-handler'
import * as sectionService from '@/lib/services/section.service'

/**
 * GET /api/sections/:id
 * Get a single section by ID
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
    const { id } = sectionIdDto.parse(resolvedParams)

    // Get section
    const section = await sectionService.getSectionById(id)

    return successResponse(section)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/sections/:id
 * Update a section
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get user ID
    const session = await requireAuth()
    const userId = parseInt(session.userId)

    // Await and validate params
    const resolvedParams = await params
    const { id } = sectionIdDto.parse(resolvedParams)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateSectionDto.parse(body)

    // Update section
    const section = await sectionService.updateSection(id, validatedData, userId)

    return successResponse(section, 'Section updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/sections/:id
 * Soft delete a section
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get user ID
    const session = await requireAuth()
    const userId = parseInt(session.userId)

    // Await and validate params
    const resolvedParams = await params
    const { id } = sectionIdDto.parse(resolvedParams)

    // Delete section
    await sectionService.deleteSection(id, userId)

    return successResponse(null, 'Section deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
