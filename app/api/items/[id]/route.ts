import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { itemIdDto, updateItemDto } from '@/lib/dto/item.dto'
import { successResponse } from '@/lib/utils/api-response'
import { handleApiError } from '@/lib/utils/error-handler'
import * as itemService from '@/lib/services/item.service'

/**
 * GET /api/items/:id
 * Get a single item by ID
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
    const { id } = itemIdDto.parse(resolvedParams)

    // Get item
    const item = await itemService.getItemById(id)

    return successResponse(item)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/items/:id
 * Update an item
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
    const { id } = itemIdDto.parse(resolvedParams)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateItemDto.parse(body)

    // Update item
    const item = await itemService.updateItem(id, validatedData, userId)

    return successResponse(item, 'Item updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/items/:id
 * Soft delete an item
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
    const { id } = itemIdDto.parse(resolvedParams)

    // Delete item
    await itemService.deleteItem(id, userId)

    return successResponse(null, 'Item deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
