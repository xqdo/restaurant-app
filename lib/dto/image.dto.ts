import { z } from 'zod'

/**
 * Validation schema for creating a new image
 */
export const createImageDto = z.object({
  path: z
    .string({
      message: 'Image path must be a string',
    })
    .min(1, 'Image path cannot be empty')
    .max(255, 'Image path cannot exceed 255 characters')
    .trim(),
})

/**
 * Validation schema for image ID parameter
 */
export const imageIdDto = z.object({
  id: z.coerce
    .number({
      message: 'Image ID must be a number',
    })
    .int('Image ID must be an integer')
    .positive('Image ID must be positive'),
})

/**
 * Type definitions inferred from schemas
 */
export type CreateImageDto = z.infer<typeof createImageDto>
export type ImageIdDto = z.infer<typeof imageIdDto>
