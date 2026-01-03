# Service Layer Implementation Pattern

This guide documents the service layer pattern used in this project. All service modules should follow these conventions for consistency and maintainability.

## Overview

Services contain all business logic and database operations. They are server-only modules that encapsulate data access, validation, and business rules.

## Reference Implementation

The canonical example is `/lib/services/item.service.ts`. Study this file for complete implementation details.

## Core Principles

### 1. Server-Only Modules

All services must use the 'server-only' import to prevent client-side bundle bloat:

```typescript
import 'server-only'
import prisma from '@/lib/prisma'
```

**Why:** Services contain database logic and should never run in the browser.

### 2. Async Functions

All service functions must be async (return Promises):

```typescript
export async function createItem(data: CreateItemDto, userId: number) {
  // Implementation
}
```

**Why:** All Prisma operations are asynchronous.

### 3. Audit Trail Tracking

All mutations must track who performed the action:

```typescript
// Create operations
const item = await prisma.item.create({
  data: {
    ...itemData,
    BaseEntity: {
      create: {
        created_by: userId,    // Track creator
        upadated_by: userId    // Note: typo in schema
      }
    }
  }
})

// Update operations
await prisma.baseEntity.update({
  where: { entity_id: item.id },
  data: {
    upadated_at: new Date(),
    upadated_by: userId
  }
})
```

**Important Schema Notes:**
- Field is `upadated_at` NOT `updated_at` (typo in schema)
- Field is `upadated_by` NOT `updated_by` (typo in schema)
- Use these exact names in your code

### 4. Soft Delete Implementation

Never hard delete records. Always use soft delete:

```typescript
export async function deleteItem(itemId: number, userId: number) {
  await prisma.baseEntity.update({
    where: { entity_id: itemId },
    data: {
      isdeleted: true,
      deleted_at: new Date(),
      deleted_by: userId,
      upadated_at: new Date(),
      upadated_by: userId
    }
  })

  // Update the main entity
  await prisma.item.update({
    where: { id: itemId },
    data: { isdeleted: true }
  })
}
```

**Why:** Preserves data for audit trails and historical reporting.

### 5. Decimal Serialization

All `Decimal` types must be serialized before returning:

```typescript
import { serializeDecimal } from '@/lib/utils/decimal'

// Serialize individual decimal
return {
  ...item,
  price: serializeDecimal(item.price)
}

// Serialize array of items
return items.map(item => ({
  ...item,
  price: serializeDecimal(item.price)
}))
```

**Why:** Prisma's Decimal type is not JSON-serializable by default.

### 6. Input Validation

Validate all inputs before database operations:

```typescript
if (!data.name || data.name.trim() === '') {
  throw new Error('Item name is required')
}

if (data.price < 0) {
  throw new Error('Price cannot be negative')
}
```

**Recommended:** Use Zod schemas for complex validation (see `/lib/dto` folder).

### 7. Error Handling

Throw descriptive errors that API routes can catch:

```typescript
// Check existence
const item = await prisma.item.findUnique({
  where: { id: itemId }
})

if (!item) {
  throw new Error('Item not found')
}

if (item.isdeleted) {
  throw new Error('Item has been deleted')
}

// Validate relationships
const section = await prisma.section.findUnique({
  where: { id: data.section_id }
})

if (!section || section.isdeleted) {
  throw new Error('Invalid section ID')
}
```

## Common Service Patterns

### CRUD Operations

#### Create
```typescript
export async function createEntity(
  data: CreateEntityDto,
  userId: number
) {
  // 1. Validate input
  validateInput(data)

  // 2. Check relationships
  await validateRelationships(data)

  // 3. Create with audit trail
  const entity = await prisma.entity.create({
    data: {
      ...data,
      BaseEntity: {
        create: {
          created_by: userId,
          upadated_by: userId
        }
      }
    },
    include: {
      BaseEntity: true,
      // Include related data
    }
  })

  // 4. Serialize decimals
  return serializeEntity(entity)
}
```

#### Read (List)
```typescript
export async function getAllEntities(filters?: EntityFilters) {
  const entities = await prisma.entity.findMany({
    where: {
      isdeleted: false,  // Exclude soft-deleted
      // Apply filters
      ...(filters?.someFilter && { someField: filters.someFilter })
    },
    include: {
      // Include related data
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return entities.map(serializeEntity)
}
```

#### Read (Single)
```typescript
export async function getEntityById(id: number) {
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: {
      BaseEntity: true,
      // Include related data
    }
  })

  if (!entity || entity.isdeleted) {
    throw new Error('Entity not found')
  }

  return serializeEntity(entity)
}
```

#### Update
```typescript
export async function updateEntity(
  id: number,
  data: UpdateEntityDto,
  userId: number
) {
  // 1. Verify exists
  const existing = await getEntityById(id)

  // 2. Validate input
  validateInput(data)

  // 3. Use transaction for multiple updates
  const updated = await prisma.$transaction(async (tx) => {
    // Update main entity
    const entity = await tx.entity.update({
      where: { id },
      data: {
        ...data,
        upadated_at: new Date()
      },
      include: {
        // Include related data
      }
    })

    // Update audit trail
    await tx.baseEntity.update({
      where: { entity_id: id },
      data: {
        upadated_at: new Date(),
        upadated_by: userId
      }
    })

    return entity
  })

  return serializeEntity(updated)
}
```

#### Delete (Soft)
```typescript
export async function deleteEntity(id: number, userId: number) {
  // 1. Verify exists
  await getEntityById(id)

  // 2. Soft delete
  await prisma.baseEntity.update({
    where: { entity_id: id },
    data: {
      isdeleted: true,
      deleted_at: new Date(),
      deleted_by: userId,
      upadated_at: new Date(),
      upadated_by: userId
    }
  })

  await prisma.entity.update({
    where: { id },
    data: { isdeleted: true }
  })
}
```

## Transaction Usage

Use transactions for operations that must succeed or fail together:

```typescript
export async function complexOperation(data: ComplexDto, userId: number) {
  return await prisma.$transaction(async (tx) => {
    // All operations use 'tx' instead of 'prisma'
    const entity1 = await tx.entity1.create({ /* ... */ })
    const entity2 = await tx.entity2.create({ /* ... */ })

    // If any operation fails, all are rolled back
    return { entity1, entity2 }
  })
}
```

**When to use transactions:**
- Creating related entities that must both exist
- Updating multiple tables that must stay consistent
- Complex business logic requiring atomicity

## File Structure

```typescript
// /lib/services/entity.service.ts
import 'server-only'
import prisma from '@/lib/prisma'
import { serializeDecimal } from '@/lib/utils/decimal'
import type { CreateEntityDto, UpdateEntityDto } from '@/lib/dto/entity.dto'

// Create
export async function createEntity(data: CreateEntityDto, userId: number) { }

// Read
export async function getAllEntities() { }
export async function getEntityById(id: number) { }

// Update
export async function updateEntity(id: number, data: UpdateEntityDto, userId: number) { }

// Delete
export async function deleteEntity(id: number, userId: number) { }

// Helper functions (not exported)
function serializeEntity(entity: any) {
  return {
    ...entity,
    // Serialize decimals
    someDecimalField: entity.someDecimalField ? serializeDecimal(entity.someDecimalField) : null
  }
}

function validateInput(data: any) {
  // Validation logic
}
```

## TypeScript Types

Define DTOs (Data Transfer Objects) for type safety:

```typescript
// /lib/dto/entity.dto.ts
import { z } from 'zod'

export const CreateEntitySchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().min(0),
  // ... other fields
})

export type CreateEntityDto = z.infer<typeof CreateEntitySchema>
export type UpdateEntityDto = Partial<CreateEntityDto>
```

## Testing Considerations

When writing tests for services:

```typescript
// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    entity: {
      create: jest.fn(),
      findMany: jest.fn(),
      // ... other methods
    }
  }
}))

describe('EntityService', () => {
  it('should create entity with audit trail', async () => {
    // Test implementation
  })

  it('should throw error for invalid input', async () => {
    await expect(createEntity({}, 1)).rejects.toThrow()
  })
})
```

## Common Pitfalls to Avoid

1. **❌ Don't forget 'server-only' import**
   ```typescript
   // BAD: Missing server-only
   import prisma from '@/lib/prisma'

   // GOOD
   import 'server-only'
   import prisma from '@/lib/prisma'
   ```

2. **❌ Don't hard delete**
   ```typescript
   // BAD: Hard delete
   await prisma.entity.delete({ where: { id } })

   // GOOD: Soft delete
   await prisma.entity.update({
     where: { id },
     data: { isdeleted: true }
   })
   ```

3. **❌ Don't forget decimal serialization**
   ```typescript
   // BAD: Return Decimal directly
   return item

   // GOOD: Serialize decimals
   return {
     ...item,
     price: serializeDecimal(item.price)
   }
   ```

4. **❌ Don't skip audit trail**
   ```typescript
   // BAD: No audit tracking
   await prisma.entity.create({ data })

   // GOOD: Track creator
   await prisma.entity.create({
     data: {
       ...data,
       BaseEntity: {
         create: {
           created_by: userId,
           upadated_by: userId
         }
       }
     }
   })
   ```

## Checklist for New Services

- [ ] Import 'server-only' at the top
- [ ] All functions are async
- [ ] Create operations include audit trail (created_by, upadated_by)
- [ ] Update operations update audit trail (upadated_at, upadated_by)
- [ ] Delete operations use soft delete
- [ ] Decimal fields are serialized
- [ ] Input validation present
- [ ] Errors are descriptive
- [ ] Relationships validated
- [ ] Transactions used where needed
- [ ] TypeScript types defined
- [ ] Follows file structure pattern

---

**Last Updated:** December 29, 2025
