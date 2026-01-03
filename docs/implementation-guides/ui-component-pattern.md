# UI Component Implementation Pattern

This guide documents the UI component patterns used in this project. All UI pages and components should follow these conventions for consistency and maintainability.

## Overview

UI components in this project use React with Next.js App Router, TypeScript, and shadcn/ui components. State management is handled with React hooks, and API calls are made with fetch.

## Reference Implementation

Study the canonical example:
- `/app/items/page.tsx` - Complete CRUD interface with drawer forms
- `/components/section-form.tsx` - Form component pattern
- `/components/data-table.tsx` - Advanced table pattern

## Page Component Pattern

### Basic Structure

```typescript
'use client'  // Required for client-side interactivity

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function EntityPage() {
  // 1. State management
  const [entities, setEntities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 2. Data fetching
  useEffect(() => {
    fetchEntities()
  }, [])

  // 3. API functions
  async function fetchEntities() {
    try {
      setIsLoading(true)
      const res = await fetch('/api/entities')
      const data = await res.json()
      setEntities(data)
    } catch (error) {
      setError(error.message)
      toast.error('Failed to load entities')
    } finally {
      setIsLoading(false)
    }
  }

  // 4. Render with loading/empty/error states
  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} />
  if (entities.length === 0) return <EmptyState />

  return (
    <div>
      {/* Page content */}
    </div>
  )
}
```

## State Management

### Component State with useState

```typescript
// Simple values
const [isOpen, setIsOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
const [selectedId, setSelectedId] = useState<number | null>(null)

// Arrays
const [items, setItems] = useState<Item[]>([])

// Objects
const [formData, setFormData] = useState({
  name: '',
  price: 0
})

// Update object state
setFormData(prev => ({ ...prev, name: 'New Name' }))

// Add to array
setItems(prev => [...prev, newItem])

// Remove from array
setItems(prev => prev.filter(item => item.id !== id))

// Update in array
setItems(prev => prev.map(item =>
  item.id === id ? { ...item, ...updates } : item
))
```

### Side Effects with useEffect

```typescript
// Fetch on mount
useEffect(() => {
  fetchData()
}, [])  // Empty dependency array = run once

// Fetch when dependency changes
useEffect(() => {
  fetchDataWithFilter(filterValue)
}, [filterValue])  // Re-run when filterValue changes

// Cleanup
useEffect(() => {
  const interval = setInterval(() => {
    fetchData()
  }, 30000)  // Poll every 30 seconds

  return () => clearInterval(interval)  // Cleanup on unmount
}, [])
```

## API Integration

### Fetch Pattern

```typescript
async function fetchEntities() {
  try {
    setIsLoading(true)
    setError(null)

    const response = await fetch('/api/entities')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    setEntities(data)
  } catch (error) {
    console.error('Fetch error:', error)
    setError(error.message)
    toast.error('Failed to load data')
  } finally {
    setIsLoading(false)
  }
}
```

### Create (POST)

```typescript
async function handleCreate(formData: CreateEntityDto) {
  try {
    const response = await fetch('/api/entities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create')
    }

    const created = await response.json()

    // Update local state
    setEntities(prev => [...prev, created])

    // Show success message
    toast.success('Entity created successfully')

    // Close form
    setIsFormOpen(false)
  } catch (error) {
    toast.error(error.message)
  }
}
```

### Update (PATCH)

```typescript
async function handleUpdate(id: number, formData: UpdateEntityDto) {
  try {
    const response = await fetch(`/api/entities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error('Failed to update')
    }

    const updated = await response.json()

    // Update in state
    setEntities(prev => prev.map(item =>
      item.id === id ? updated : item
    ))

    toast.success('Updated successfully')
    setIsFormOpen(false)
  } catch (error) {
    toast.error(error.message)
  }
}
```

### Delete (DELETE)

```typescript
async function handleDelete(id: number) {
  // Confirm before deleting
  if (!confirm('Are you sure you want to delete this item?')) {
    return
  }

  try {
    const response = await fetch(`/api/entities/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete')
    }

    // Remove from state
    setEntities(prev => prev.filter(item => item.id !== id))

    toast.success('Deleted successfully')
  } catch (error) {
    toast.error(error.message)
  }
}
```

## Form Patterns

### Drawer Form (Recommended for CRUD)

```typescript
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

export default function EntityPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)

  function openCreateForm() {
    setEditingEntity(null)
    setIsDrawerOpen(true)
  }

  function openEditForm(entity: Entity) {
    setEditingEntity(entity)
    setIsDrawerOpen(true)
  }

  return (
    <>
      <Button onClick={openCreateForm}>Create New</Button>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingEntity ? 'Edit Entity' : 'Create Entity'}
            </DrawerTitle>
          </DrawerHeader>

          <EntityForm
            entity={editingEntity}
            onSuccess={() => {
              setIsDrawerOpen(false)
              fetchEntities()  // Refresh list
            }}
            onCancel={() => setIsDrawerOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}
```

### Form Component

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EntityFormProps {
  entity?: Entity | null
  onSuccess: () => void
  onCancel: () => void
}

export function EntityForm({ entity, onSuccess, onCancel }: EntityFormProps) {
  const [formData, setFormData] = useState({
    name: entity?.name || '',
    amount: entity?.amount || 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = entity
        ? `/api/entities/${entity.id}`
        : '/api/entities'

      const method = entity ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success(entity ? 'Updated' : 'Created')
      onSuccess()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            name: e.target.value
          }))}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

## UI State Patterns

### Loading State

```typescript
{isLoading && (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)}
```

### Empty State

```typescript
{entities.length === 0 && (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <p className="text-muted-foreground mb-4">
      No entities found
    </p>
    <Button onClick={openCreateForm}>
      Create First Entity
    </Button>
  </div>
)}
```

### Error State

```typescript
{error && (
  <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
    <h3 className="font-semibold text-destructive">Error</h3>
    <p className="text-sm">{error}</p>
    <Button onClick={fetchEntities} className="mt-2">
      Retry
    </Button>
  </div>
)}
```

## Toast Notifications

```typescript
import { toast } from 'sonner'

// Success
toast.success('Operation completed successfully')

// Error
toast.error('Something went wrong')

// Info
toast.info('Information message')

// With description
toast.success('Item created', {
  description: 'The item has been added to your list'
})

// Loading state
const toastId = toast.loading('Saving...')
// Later...
toast.success('Saved!', { id: toastId })
```

## Common UI Components

### Button Variants

```typescript
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Link</Button>
<Button variant="secondary">Secondary</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

### Card Layout

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Data Table

```typescript
import { DataTable } from '@/components/data-table'

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button onClick={() => handleEdit(row.original)}>
        Edit
      </Button>
    )
  }
]

<DataTable columns={columns} data={entities} />
```

## Responsive Design

### Mobile-Aware Drawer

```typescript
import { useIsMobile } from '@/hooks/use-mobile'

export default function Page() {
  const isMobile = useIsMobile()

  return (
    <Drawer
      direction={isMobile ? 'bottom' : 'right'}
      open={isOpen}
    >
      {/* Content */}
    </Drawer>
  )
}
```

### Responsive Grid

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>{/* ... */}</Card>
  ))}
</div>
```

## TypeScript Types

```typescript
// Define interfaces for your data
interface Entity {
  id: number
  name: string
  amount: number
  created_at: string
}

// Form data types
interface CreateEntityDto {
  name: string
  amount: number
}

type UpdateEntityDto = Partial<CreateEntityDto>

// Component props
interface EntityFormProps {
  entity?: Entity | null
  onSuccess: () => void
  onCancel: () => void
}
```

## Checklist for New UI Pages

- [ ] Use 'use client' directive
- [ ] Set up state with useState
- [ ] Fetch data in useEffect
- [ ] Handle loading state with Skeleton
- [ ] Handle empty state with helpful message
- [ ] Handle error state with retry option
- [ ] Implement CRUD operations
- [ ] Use toast notifications for feedback
- [ ] Use Drawer for forms (not Dialog)
- [ ] Validate form inputs
- [ ] Disable buttons during submission
- [ ] Update local state after mutations
- [ ] Implement responsive design
- [ ] Add TypeScript types
- [ ] Test with Arabic/RTL content

---

**Last Updated:** December 29, 2025
