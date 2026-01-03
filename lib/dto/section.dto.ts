import { z } from 'zod'

/**
 * Validation schema for creating a new section
 */
export const createSectionDto = z.object({
  name: z
    .string({
      message: 'Section name must be a string',
    })
    .min(1, 'Section name cannot be empty')
    .max(255, 'Section name cannot exceed 255 characters')
    .trim(),
})

/**
 * Validation schema for updating an existing section
 */
export const updateSectionDto = z.object({
  name: z
    .string({
      message: 'Section name must be a string',
    })
    .min(1, 'Section name cannot be empty')
    .max(255, 'Section name cannot exceed 255 characters')
    .trim()
    .optional(),
})

/**
 * Validation schema for section ID parameter
 */
export const sectionIdDto = z.object({
  id: z.coerce
    .number({
      message: 'Section ID must be a number',
    })
    .int('Section ID must be an integer')
    .positive('Section ID must be positive'),
})

/**
 * Type definitions inferred from schemas
 */
export type CreateSectionDto = z.infer<typeof createSectionDto>
export type UpdateSectionDto = z.infer<typeof updateSectionDto>
export type SectionIdDto = z.infer<typeof sectionIdDto>
