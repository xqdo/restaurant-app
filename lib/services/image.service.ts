import 'server-only'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/utils/file-upload'

/**
 * Service layer for Image operations
 * Handles all business logic and database interactions for images
 */

/**
 * Get all images with item count
 */
export async function getAllImages() {
  const images = await prisma.image.findMany({
    select: {
      id: true,
      path: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  })

  return images.map((image) => ({
    id: image.id,
    path: image.path,
    itemCount: image._count.items,
  }))
}

/**
 * Get a single image by ID
 */
export async function getImageById(id: number) {
  const image = await prisma.image.findUnique({
    where: { id },
    select: {
      id: true,
      path: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  })

  if (!image) {
    throw new Error('Image not found')
  }

  return {
    id: image.id,
    path: image.path,
    itemCount: image._count.items,
  }
}

/**
 * Create a new image record
 */
export async function createImage(path: string) {
  const image = await prisma.image.create({
    data: {
      path,
    },
    select: {
      id: true,
      path: true,
    },
  })

  return image
}

/**
 * Delete an image with safety check
 */
export async function deleteImage(id: number) {
  // Check if image exists
  const image = await prisma.image.findUnique({
    where: { id },
  })

  if (!image) {
    throw new Error('Image not found')
  }

  // Check if image is used by any non-deleted items
  const itemsUsingImage = await prisma.item.count({
    where: {
      image_id: id,
      baseEntity: {
        isdeleted: false,
      },
    },
  })

  if (itemsUsingImage > 0) {
    throw new Error(
      `Cannot delete image that is in use by ${itemsUsingImage} item(s)`
    )
  }

  // Delete from database
  await prisma.image.delete({
    where: { id },
  })

  // Delete physical file (non-blocking if fails)
  try {
    await deleteFile(image.path)
  } catch (error) {
    console.error('Failed to delete physical file:', error)
    // Don't throw - database record is already deleted
  }

  return { success: true }
}
