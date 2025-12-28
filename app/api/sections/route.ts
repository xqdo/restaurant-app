import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { createSectionDto } from '@/lib/dto/section.dto'
import { successResponse } from '@/lib/utils/api-response'
import { handleApiError } from '@/lib/utils/error-handler'
import * as sectionService from '@/lib/services/section.service'

/**
 * GET /api/sections
 * Get all non-deleted sections
 */
export async function GET() {
  try {
    // Require authentication
    await requireAuth()

    // Get all sections
    const sections = await sectionService.getAllSections()

    return successResponse(sections)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/sections
 * Create a new section
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication and get user ID
    const session = await requireAuth()
    const userId = parseInt(session.userId)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createSectionDto.parse(body)

    // Create section
    const section = await sectionService.createSection(validatedData, userId)

    return successResponse(section, 'Section created successfully', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
