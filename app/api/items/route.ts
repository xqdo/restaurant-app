import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { createItemDto } from '@/lib/dto/item.dto'
import { successResponse } from '@/lib/utils/api-response'
import { handleApiError } from '@/lib/utils/error-handler'
import * as itemService from '@/lib/services/item.service'

/**
 * GET /api/items
 * Get all non-deleted items
 */
export async function GET() {
  try {
    // Require authentication
    await requireAuth()

    // Get all items
    const items = await itemService.getAllItems()

    return successResponse(items)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/items
 * Create a new item
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication and get user ID
    const session = await requireAuth()
    const userId = parseInt(session.userId)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createItemDto.parse(body)

    // Create item
    const item = await itemService.createItem(validatedData, userId)

    return successResponse(item, 'Item created successfully', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
