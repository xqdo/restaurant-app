import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { errorResponse } from './api-response'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse('Validation error', 400, error.errors)
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return errorResponse('Record already exists', 409)
    }
    if (error.code === 'P2025') {
      return errorResponse('Record not found', 404)
    }
    return errorResponse('Database error', 500)
  }

  // Generic error
  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  return errorResponse('Internal server error', 500)
}
