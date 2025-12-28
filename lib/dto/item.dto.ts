import { z } from 'zod'

/**
 * Validation schema for creating a new item
 */
export const createItemDto = z.object({
  name: z
    .string({
      required_error: 'Item name is required',
      invalid_type_error: 'Item name must be a string',
    })
    .min(1, 'Item name cannot be empty')
    .max(255, 'Item name cannot exceed 255 characters')
    .trim(),

  section_id: z.coerce
    .number({
      required_error: 'Section ID is required',
      invalid_type_error: 'Section ID must be a number',
    })
    .int('Section ID must be an integer')
    .positive('Section ID must be positive'),

  price: z
    .string({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a string',
    })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Price must be a valid number with up to 2 decimal places',
    }),

  image_id: z.coerce
    .number({
      invalid_type_error: 'Image ID must be a number',
    })
    .int('Image ID must be an integer')
    .positive('Image ID must be positive')
    .optional()
    .nullable(),

  description: z
    .string({
      invalid_type_error: 'Description must be a string',
    })
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim()
    .optional()
    .nullable(),
})

/**
 * Validation schema for updating an existing item
 */
export const updateItemDto = z.object({
  name: z
    .string({
      invalid_type_error: 'Item name must be a string',
    })
    .min(1, 'Item name cannot be empty')
    .max(255, 'Item name cannot exceed 255 characters')
    .trim()
    .optional(),

  section_id: z.coerce
    .number({
      invalid_type_error: 'Section ID must be a number',
    })
    .int('Section ID must be an integer')
    .positive('Section ID must be positive')
    .optional(),

  price: z
    .string({
      invalid_type_error: 'Price must be a string',
    })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Price must be a valid number with up to 2 decimal places',
    })
    .optional(),

  image_id: z.coerce
    .number({
      invalid_type_error: 'Image ID must be a number',
    })
    .int('Image ID must be an integer')
    .positive('Image ID must be positive')
    .optional()
    .nullable(),

  description: z
    .string({
      invalid_type_error: 'Description must be a string',
    })
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim()
    .optional()
    .nullable(),
})

/**
 * Validation schema for item ID parameter
 */
export const itemIdDto = z.object({
  id: z.coerce
    .number({
      required_error: 'Item ID is required',
      invalid_type_error: 'Item ID must be a number',
    })
    .int('Item ID must be an integer')
    .positive('Item ID must be positive'),
})

/**
 * Type definitions inferred from schemas
 */
export type CreateItemDto = z.infer<typeof createItemDto>
export type UpdateItemDto = z.infer<typeof updateItemDto>
export type ItemIdDto = z.infer<typeof itemIdDto>
