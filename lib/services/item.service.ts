import 'server-only'
import { prisma } from '@/lib/prisma'
import { serializeDecimal, parseDecimalInput } from '@/lib/utils/decimal'
import type { CreateItemDto, UpdateItemDto } from '@/lib/dto/item.dto'

/**
 * Service layer for Item operations
 * Handles all business logic and database interactions for items
 */

/**
 * Get all non-deleted items
 */
export async function getAllItems() {
  const items = await prisma.item.findMany({
    where: {
      baseEntity: {
        isdeleted: false,
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      section_id: true,
      image_id: true,
      description: true,
      section: {
        select: {
          id: true,
          name: true,
        },
      },
      image: {
        select: {
          id: true,
          path: true,
        },
      },
      baseEntity: {
        select: {
          created_at: true,
          updated_at: true,
        },
      },
    },
    orderBy: [{ section_id: 'asc' }, { id: 'asc' }],
  })

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: serializeDecimal(item.price),
    sectionId: item.section_id,
    imageId: item.image_id,
    description: item.description,
    section: item.section,
    image: item.image,
    createdAt: item.baseEntity.created_at,
    updatedAt: item.baseEntity.updated_at,
  }))
}

/**
 * Get a single item by ID with full details
 */
export async function getItemById(id: number) {
  const item = await prisma.item.findFirst({
    where: {
      id,
      baseEntity: {
        isdeleted: false,
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      section_id: true,
      image_id: true,
      description: true,
      section: {
        select: {
          id: true,
          name: true,
        },
      },
      image: {
        select: {
          id: true,
          path: true,
        },
      },
      baseEntity: {
        select: {
          created_at: true,
          updated_at: true,
          created_by: true,
          updated_by: true,
        },
      },
    },
  })

  if (!item) {
    throw new Error('Item not found')
  }

  return {
    id: item.id,
    name: item.name,
    price: serializeDecimal(item.price),
    sectionId: item.section_id,
    imageId: item.image_id,
    description: item.description,
    section: item.section,
    image: item.image,
    createdAt: item.baseEntity.created_at,
    updatedAt: item.baseEntity.updated_at,
    createdBy: item.baseEntity.created_by,
    updatedBy: item.baseEntity.updated_by,
  }
}

/**
 * Create a new item with audit trail
 */
export async function createItem(data: CreateItemDto, userId: number) {
  // Validate section exists
  const section = await prisma.section.findFirst({
    where: {
      id: data.section_id,
      baseEntity: {
        isdeleted: false,
      },
    },
  })

  if (!section) {
    throw new Error('Section not found')
  }

  // Validate image exists if provided
  if (data.image_id) {
    const image = await prisma.image.findUnique({
      where: { id: data.image_id },
    })

    if (!image) {
      throw new Error('Image not found')
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create base entity first
    const baseEntity = await tx.baseEntity.create({
      data: {
        created_at: new Date(),
        created_by: userId,
        isdeleted: false,
      },
    })

    // Create item with base entity
    const item = await tx.item.create({
      data: {
        name: data.name,
        section_id: data.section_id,
        price: parseDecimalInput(data.price),
        image_id: data.image_id || null,
        description: data.description || null,
        base_entity_id: baseEntity.id,
      },
      select: {
        id: true,
        name: true,
        price: true,
        section_id: true,
        image_id: true,
        description: true,
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        image: {
          select: {
            id: true,
            path: true,
          },
        },
        baseEntity: {
          select: {
            created_at: true,
            created_by: true,
          },
        },
      },
    })

    return {
      id: item.id,
      name: item.name,
      price: serializeDecimal(item.price),
      sectionId: item.section_id,
      imageId: item.image_id,
      description: item.description,
      section: item.section,
      image: item.image,
      createdAt: item.baseEntity.created_at,
      createdBy: item.baseEntity.created_by,
    }
  })

  return result
}

/**
 * Update an existing item with audit trail
 */
export async function updateItem(
  id: number,
  data: UpdateItemDto,
  userId: number
) {
  // Check item exists and is not deleted
  const existingItem = await prisma.item.findFirst({
    where: {
      id,
      baseEntity: {
        isdeleted: false,
      },
    },
  })

  if (!existingItem) {
    throw new Error('Item not found')
  }

  // Validate section exists if provided
  if (data.section_id !== undefined) {
    const section = await prisma.section.findFirst({
      where: {
        id: data.section_id,
        baseEntity: {
          isdeleted: false,
        },
      },
    })

    if (!section) {
      throw new Error('Section not found')
    }
  }

  // Validate image exists if provided
  if (data.image_id !== undefined && data.image_id !== null) {
    const image = await prisma.image.findUnique({
      where: { id: data.image_id },
    })

    if (!image) {
      throw new Error('Image not found')
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update base entity audit fields
    await tx.baseEntity.update({
      where: { id: existingItem.base_entity_id },
      data: {
        updated_at: new Date(),
        updated_by: userId,
      },
    })

    // Prepare update data
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.section_id !== undefined) updateData.section_id = data.section_id
    if (data.price !== undefined)
      updateData.price = parseDecimalInput(data.price)
    if (data.image_id !== undefined) updateData.image_id = data.image_id
    if (data.description !== undefined) updateData.description = data.description

    // Update item if there are changes
    const item = await tx.item.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        price: true,
        section_id: true,
        image_id: true,
        description: true,
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        image: {
          select: {
            id: true,
            path: true,
          },
        },
        baseEntity: {
          select: {
            created_at: true,
            updated_at: true,
            created_by: true,
            updated_by: true,
          },
        },
      },
    })

    return {
      id: item.id,
      name: item.name,
      price: serializeDecimal(item.price),
      sectionId: item.section_id,
      imageId: item.image_id,
      description: item.description,
      section: item.section,
      image: item.image,
      createdAt: item.baseEntity.created_at,
      updatedAt: item.baseEntity.updated_at,
      createdBy: item.baseEntity.created_by,
      updatedBy: item.baseEntity.updated_by,
    }
  })

  return result
}

/**
 * Soft delete an item
 */
export async function deleteItem(id: number, userId: number) {
  // Check if item exists and is not already deleted
  const existingItem = await prisma.item.findFirst({
    where: {
      id,
      baseEntity: {
        isdeleted: false,
      },
    },
  })

  if (!existingItem) {
    throw new Error('Item not found')
  }

  await prisma.baseEntity.update({
    where: { id: existingItem.base_entity_id },
    data: {
      deleted_at: new Date(),
      deleted_by: userId,
      isdeleted: true,
    },
  })

  return { success: true }
}
