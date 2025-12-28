import 'server-only'
import { prisma } from '@/lib/prisma'
import type { CreateSectionDto, UpdateSectionDto } from '@/lib/dto/section.dto'

/**
 * Service layer for Section operations
 * Handles all business logic and database interactions for sections
 */

/**
 * Get all non-deleted sections with item count
 */
export async function getAllSections() {
  const sections = await prisma.section.findMany({
    where: {
      baseEntity: {
        isdeleted: false,
      },
    },
    select: {
      id: true,
      name: true,
      baseEntity: {
        select: {
          created_at: true,
          updated_at: true,
        },
      },
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

  return sections.map((section) => ({
    id: section.id,
    name: section.name,
    itemCount: section._count.items,
    createdAt: section.baseEntity.created_at,
    updatedAt: section.baseEntity.updated_at,
  }))
}

/**
 * Get a single section by ID with full details
 */
export async function getSectionById(id: number) {
  const section = await prisma.section.findFirst({
    where: {
      id,
      baseEntity: {
        isdeleted: false,
      },
    },
    select: {
      id: true,
      name: true,
      baseEntity: {
        select: {
          created_at: true,
          updated_at: true,
          created_by: true,
          updated_by: true,
        },
      },
      items: {
        where: {
          baseEntity: {
            isdeleted: false,
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
        },
      },
    },
  })

  if (!section) {
    throw new Error('Section not found')
  }

  return {
    id: section.id,
    name: section.name,
    items: section.items,
    createdAt: section.baseEntity.created_at,
    updatedAt: section.baseEntity.updated_at,
    createdBy: section.baseEntity.created_by,
    updatedBy: section.baseEntity.updated_by,
  }
}

/**
 * Create a new section with base entity
 */
export async function createSection(data: CreateSectionDto, userId: number) {
  const result = await prisma.$transaction(async (tx) => {
    // Create base entity first
    const baseEntity = await tx.baseEntity.create({
      data: {
        created_at: new Date(),
        created_by: userId,
        isdeleted: false,
      },
    })

    // Create section with base entity
    const section = await tx.section.create({
      data: {
        name: data.name,
        base_entity_id: baseEntity.id,
      },
      select: {
        id: true,
        name: true,
        baseEntity: {
          select: {
            created_at: true,
            created_by: true,
          },
        },
      },
    })

    return {
      id: section.id,
      name: section.name,
      createdAt: section.baseEntity.created_at,
      createdBy: section.baseEntity.created_by,
    }
  })

  return result
}

/**
 * Update an existing section
 */
export async function updateSection(
  id: number,
  data: UpdateSectionDto,
  userId: number
) {
  // First check if section exists and is not deleted
  const existingSection = await prisma.section.findFirst({
    where: {
      id,
      baseEntity: {
        isdeleted: false,
      },
    },
  })

  if (!existingSection) {
    throw new Error('Section not found')
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update base entity audit fields
    await tx.baseEntity.update({
      where: { id: existingSection.base_entity_id },
      data: {
        updated_at: new Date(),
        updated_by: userId,
      },
    })

    // Update section if name is provided
    if (data.name !== undefined) {
      const section = await tx.section.update({
        where: { id },
        data: {
          name: data.name,
        },
        select: {
          id: true,
          name: true,
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
        id: section.id,
        name: section.name,
        createdAt: section.baseEntity.created_at,
        updatedAt: section.baseEntity.updated_at,
        createdBy: section.baseEntity.created_by,
        updatedBy: section.baseEntity.updated_by,
      }
    }

    // If no updates, just return the existing section
    const section = await tx.section.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
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
      id: section!.id,
      name: section!.name,
      createdAt: section!.baseEntity.created_at,
      updatedAt: section!.baseEntity.updated_at,
      createdBy: section!.baseEntity.created_by,
      updatedBy: section!.baseEntity.updated_by,
    }
  })

  return result
}

/**
 * Soft delete a section
 */
export async function deleteSection(id: number, userId: number) {
  // First check if section exists and is not already deleted
  const existingSection = await prisma.section.findFirst({
    where: {
      id,
      baseEntity: {
        isdeleted: false,
      },
    },
  })

  if (!existingSection) {
    throw new Error('Section not found')
  }

  await prisma.baseEntity.update({
    where: { id: existingSection.base_entity_id },
    data: {
      deleted_at: new Date(),
      deleted_by: userId,
      isdeleted: true,
    },
  })

  return { success: true }
}
