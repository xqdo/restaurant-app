# API Route Implementation Pattern

This guide documents the API route pattern used in this project. All API routes should follow these conventions for consistency and maintainability.

## Overview

API routes handle HTTP requests, validate authentication/authorization, call service layer functions, and return standardized responses.

## Reference Implementation

Study these existing routes:
- `/app/api/items/route.ts` - GET (list), POST (create)
- `/app/api/items/[id]/route.ts` - GET (detail), PATCH (update), DELETE (soft delete)
- `/app/api/sections/route.ts` - Collection endpoint pattern

## File Structure

### Collection Endpoints
```
/app/api/entities/
└── route.ts          # GET (list all), POST (create new)
```

### Resource Endpoints
```
/app/api/entities/[id]/
└── route.ts          # GET (one), PATCH (update), DELETE (delete)
```

### Nested/Action Endpoints
```
/app/api/entities/[id]/
└── action/route.ts   # POST, PUT, PATCH for specific actions
```

## Standard HTTP Methods

| Method | Purpose | Returns | Service Function |
|--------|---------|---------|-----------------|
| GET | List resources | Array | `getAll...()` |
| GET | Get single resource | Object | `get...ById()` |
| POST | Create resource | Created object | `create...()` |
| PUT/PATCH | Update resource | Updated object | `update...()` |
| DELETE | Delete resource | Success message | `delete...()` |

## Route Implementation Pattern

### GET (List All)

```typescript
// /app/api/entities/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAllEntities } from '@/lib/services/entity.service'
import { successResponse } from '@/lib/utils/api-response'
import { handleError } from '@/lib/utils/error-handler'

export async function GET(request: NextRequest) {
  try {
    // 1. Extract query parameters
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter')

    // 2. Call service layer
    const entities = await getAllEntities({ filter })

    // 3. Return standardized success response
    return successResponse(entities)
  } catch (error) {
    // 4. Handle errors
    return handleError(error)
  }
}
```

### GET (Single Resource)

```typescript
// /app/api/entities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getEntityById } from '@/lib/services/entity.service'
import { successResponse, errorResponse } from '@/lib/utils/api-response'
import { handleError } from '@/lib/utils/error-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Parse and validate ID
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return errorResponse('Invalid ID', 400)
    }

    // 2. Call service
    const entity = await getEntityById(id)

    // 3. Return response
    return successResponse(entity)
  } catch (error) {
    return handleError(error)
  }
}
```

### POST (Create)

```typescript
// /app/api/entities/route.ts
import { NextRequest } from 'next/server'
import { createEntity } from '@/lib/services/entity.service'
import { successResponse, errorResponse } from '@/lib/utils/api-response'
import { handleError } from '@/lib/utils/error-handler'
import { getCurrentUser } from '@/lib/middleware/auth.middleware'
import { CreateEntitySchema } from '@/lib/dto/entity.dto'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // 2. Validate permissions (if needed)
    if (!user.roles.includes('Admin') && !user.roles.includes('Manager')) {
      return errorResponse('Forbidden - Admin or Manager role required', 403)
    }

    // 3. Parse request body
    const body = await request.json()

    // 4. Validate input with Zod (optional but recommended)
    const validatedData = CreateEntitySchema.parse(body)

    // 5. Call service with user ID
    const entity = await createEntity(validatedData, user.id)

    // 6. Return created resource with 201 status
    return successResponse(entity, 201)
  } catch (error) {
    return handleError(error)
  }
}
```

### PATCH (Update)

```typescript
// /app/api/entities/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const user = await getCurrentUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // 2. Validate ID
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return errorResponse('Invalid ID', 400)
    }

    // 3. Parse and validate body
    const body = await request.json()
    const validatedData = UpdateEntitySchema.parse(body)

    // 4. Call service
    const updated = await updateEntity(id, validatedData, user.id)

    // 5. Return updated resource
    return successResponse(updated)
  } catch (error) {
    return handleError(error)
  }
}
```

### DELETE (Soft Delete)

```typescript
// /app/api/entities/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate and authorize
    const user = await getCurrentUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    if (!user.roles.includes('Admin') && !user.roles.includes('Manager')) {
      return errorResponse('Forbidden', 403)
    }

    // 2. Validate ID
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return errorResponse('Invalid ID', 400)
    }

    // 3. Call service (soft delete)
    await deleteEntity(id, user.id)

    // 4. Return success message
    return successResponse({ message: 'Entity deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
}
```

## Authentication & Authorization

### Extract Current User

```typescript
import { getCurrentUser } from '@/lib/middleware/auth.middleware'

const user = await getCurrentUser(request)
if (!user) {
  return errorResponse('Unauthorized', 401)
}

// user object contains:
// - id: number
// - username: string
// - roles: string[]
```

### Check Roles

```typescript
// Single role
if (!user.roles.includes('Admin')) {
  return errorResponse('Forbidden - Admin role required', 403)
}

// Multiple roles (any)
if (!user.roles.includes('Admin') && !user.roles.includes('Manager')) {
  return errorResponse('Forbidden', 403)
}

// Multiple roles (all) - less common
const hasAllRoles = ['Admin', 'Manager'].every(role =>
  user.roles.includes(role)
)
```

## Response Formatting

Use utility functions for consistent responses:

### Success Response

```typescript
import { successResponse } from '@/lib/utils/api-response'

// With data
return successResponse(data)                    // Status: 200
return successResponse(data, 201)              // Status: 201

// Data can be:
return successResponse({ id: 1, name: 'Item' })       // Object
return successResponse([item1, item2])                // Array
return successResponse({ message: 'Success' })        // Message only
```

### Error Response

```typescript
import { errorResponse } from '@/lib/utils/api-response'

return errorResponse('Error message', 400)      // Bad Request
return errorResponse('Unauthorized', 401)       // Unauthorized
return errorResponse('Forbidden', 403)          // Forbidden
return errorResponse('Not Found', 404)          // Not Found
return errorResponse('Conflict', 409)           // Conflict
return errorResponse('Server Error', 500)       // Internal Error
```

### Handle Errors

```typescript
import { handleError } from '@/lib/utils/error-handler'

try {
  // ... route logic
} catch (error) {
  return handleError(error)  // Automatically formats error response
}
```

## Query Parameters

### Extract Query Parameters

```typescript
const { searchParams } = new URL(request.url)

// Single values
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '10')
const search = searchParams.get('search') || ''

// Booleans
const isActive = searchParams.get('is_active') === 'true'

// Dates
const startDate = searchParams.get('start_date')
  ? new Date(searchParams.get('start_date')!)
  : undefined
```

### Pagination

```typescript
const page = parseInt(searchParams.get('page') || '1')
const perPage = parseInt(searchParams.get('perPage') || '10')

const result = await getEntitiesPaginated({
  page,
  perPage,
  // ... other filters
})

return successResponse({
  data: result.items,
  pagination: {
    page,
    perPage,
    total: result.total,
    totalPages: Math.ceil(result.total / perPage)
  }
})
```

## Request Body Parsing

### JSON Body

```typescript
const body = await request.json()

// With validation
import { CreateEntitySchema } from '@/lib/dto/entity.dto'
const validatedData = CreateEntitySchema.parse(body)
```

### Form Data (for file uploads)

```typescript
const formData = await request.formData()
const file = formData.get('image') as File
const name = formData.get('name') as string

// Validate file
if (!file) {
  return errorResponse('Image file is required', 400)
}

if (file.size > 5 * 1024 * 1024) {  // 5MB
  return errorResponse('File size exceeds 5MB', 400)
}
```

## Error Handling Patterns

### Standard Try-Catch

```typescript
export async function GET(request: NextRequest) {
  try {
    // Route logic
    const data = await someService()
    return successResponse(data)
  } catch (error) {
    return handleError(error)
  }
}
```

### Specific Error Handling

```typescript
try {
  const entity = await getEntityById(id)
  return successResponse(entity)
} catch (error) {
  // Check for specific errors
  if (error instanceof Error) {
    if (error.message === 'Entity not found') {
      return errorResponse('Entity not found', 404)
    }
  }
  // Generic error handling
  return handleError(error)
}
```

### Validation Errors (Zod)

```typescript
import { z } from 'zod'

try {
  const validatedData = CreateEntitySchema.parse(body)
  // ... continue
} catch (error) {
  if (error instanceof z.ZodError) {
    return errorResponse(
      error.errors.map(e => e.message).join(', '),
      400
    )
  }
  return handleError(error)
}
```

## Common Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate key, constraint violation |
| 500 | Internal Server Error | Unexpected server error |

## Testing API Routes

```typescript
import { GET, POST } from './route'
import { NextRequest } from 'next/server'

describe('Entity API Routes', () => {
  describe('GET /api/entities', () => {
    it('should return list of entities', async () => {
      const request = new NextRequest('http://localhost/api/entities')
      const response = await GET(request)
      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/entities', () => {
    it('should create entity', async () => {
      const request = new NextRequest('http://localhost/api/entities', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      })
      const response = await POST(request)
      expect(response.status).toBe(201)
    })

    it('should reject unauthorized request', async () => {
      // Test without auth token
    })
  })
})
```

## Complete Example

```typescript
// /app/api/entities/[id]/route.ts
import 'server-only'
import { NextRequest } from 'next/server'
import { getEntityById, updateEntity, deleteEntity } from '@/lib/services/entity.service'
import { successResponse, errorResponse } from '@/lib/utils/api-response'
import { handleError } from '@/lib/utils/error-handler'
import { getCurrentUser } from '@/lib/middleware/auth.middleware'
import { UpdateEntitySchema } from '@/lib/dto/entity.dto'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return errorResponse('Invalid ID', 400)

    const entity = await getEntityById(id)
    return successResponse(entity)
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return errorResponse('Unauthorized', 401)
    if (!user.roles.includes('Admin')) {
      return errorResponse('Forbidden', 403)
    }

    const id = parseInt(params.id)
    if (isNaN(id)) return errorResponse('Invalid ID', 400)

    const body = await request.json()
    const validatedData = UpdateEntitySchema.parse(body)

    const updated = await updateEntity(id, validatedData, user.id)
    return successResponse(updated)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return errorResponse('Unauthorized', 401)
    if (!user.roles.includes('Admin')) {
      return errorResponse('Forbidden', 403)
    }

    const id = parseInt(params.id)
    if (isNaN(id)) return errorResponse('Invalid ID', 400)

    await deleteEntity(id, user.id)
    return successResponse({ message: 'Deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
}
```

## Checklist for New API Routes

- [ ] Import 'server-only' if route contains sensitive logic
- [ ] Authenticate user for protected endpoints
- [ ] Validate authorization/roles
- [ ] Validate and parse ID parameters
- [ ] Validate request body with Zod schema
- [ ] Call appropriate service function
- [ ] Pass user ID to service for audit trail
- [ ] Use standardized response functions
- [ ] Handle errors with try-catch
- [ ] Return appropriate HTTP status codes
- [ ] TypeScript types for params and body
- [ ] Add JSDoc comments for complex routes

---

**Last Updated:** December 29, 2025
