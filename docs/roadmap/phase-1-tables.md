# Phase 1: Tables Management (Complete Feature)

**Timeline:** Week 2 (after auth) | **Priority:** 🎯 CRITICAL

## Objective

Build a **complete, working table management system** from database to UI. Staff can create, view, and manage tables with status tracking (AVAILABLE/OCCUPIED/RESERVED).

## What Gets Built (Full Stack)

### 1. Service Layer (/lib/services/table.service.ts)
```typescript
✅ createTable(number, userId)
✅ getAllTables(statusFilter?)
✅ getAvailableTables()
✅ getTableById(id)
✅ updateTableStatus(id, status, userId)
✅ deleteTable(id, userId)
```

### 2. API Routes (/app/api/tables/)
```typescript
✅ GET /api/tables - List all (with status filter)
✅ GET /api/tables/available - Available only
✅ POST /api/tables - Create (Manager/Admin)
✅ GET /api/tables/{id} - Get one
✅ PATCH /api/tables/{id}/status - Update status
✅ DELETE /api/tables/{id} - Soft delete (Manager/Admin)
```

### 3. UI Components
```typescript
✅ /app/tables/page.tsx - Main page (replace UnderDevelopment)
✅ /components/table-grid.tsx - Visual table grid
✅ /components/table-card.tsx - Individual table display
✅ /components/table-status-badge.tsx - Status badge
✅ /components/table-form.tsx - Create/edit form (drawer)
```

### 4. Features
- ✅ Visual table grid showing all tables
- ✅ Color-coded status (🟢 Available, 🔴 Occupied, 🟡 Reserved)
- ✅ Click to change status
- ✅ Create new tables (Manager/Admin only)
- ✅ Delete tables (Manager/Admin only)
- ✅ Filter by status
- ✅ Responsive mobile layout

## Implementation Steps

### Step 1: Service Layer (30 min)
Create `/lib/services/table.service.ts`:
- Follow pattern from `item.service.ts`
- CRUD operations
- Soft delete implementation
- Audit trail tracking

### Step 2: API Routes (45 min)
Create `/app/api/tables/` routes:
- Collection: `route.ts` (GET list, POST create)
- Resource: `[id]/route.ts` (GET one, DELETE)
- Action: `[id]/status/route.ts` (PATCH update status)
- Auth checks on Manager/Admin for create/delete

### Step 3: UI Page (1-2 hours)
Edit `/app/tables/page.tsx`:
- Fetch tables on mount
- Grid/list view
- Status filtering
- Create/delete buttons
- Loading/empty/error states

### Step 4: Components (1-2 hours)
Create table components:
- Grid layout for desktop
- List layout for mobile
- Form in drawer for create
- Status badges with colors

### Step 5: Testing (30 min)
- Test all API endpoints
- Test all role permissions
- Test status changes
- Test create/delete
- Test mobile responsiveness

## Database Schema (Already Exists)

```prisma
model Table {
  id              Int         @id @default(autoincrement())
  number          Int         @unique
  status          StatusEnum  @default(AVAILABLE)
  isdeleted       Boolean     @default(false)
  BaseEntity      BaseEntity  @relation(...)
  Receipt         Receipt[]
}

enum StatusEnum {
  AVAILABLE
  OCCUPIED
  RESERVED
}
```

## Acceptance Criteria (Done When...)

- [ ] All 6 API endpoints working
- [ ] `/app/tables/page.tsx` shows tables (no UnderDevelopment)
- [ ] Can create tables (Manager/Admin only)
- [ ] Can delete tables (Manager/Admin only)
- [ ] Can change status (all authenticated users)
- [ ] Status filter works
- [ ] Color coding shows correctly
- [ ] Toast notifications work
- [ ] Audit trail tracks all changes
- [ ] Works on mobile
- [ ] No console errors

## Files Created/Modified

```
NEW FILES:
- /lib/services/table.service.ts
- /app/api/tables/route.ts
- /app/api/tables/available/route.ts
- /app/api/tables/[id]/route.ts
- /app/api/tables/[id]/status/route.ts
- /components/table-grid.tsx
- /components/table-card.tsx
- /components/table-status-badge.tsx
- /components/table-form.tsx

MODIFIED FILES:
- /app/tables/page.tsx (replace UnderDevelopment)
```

## Next Phase

After tables are complete, move to **Phase 2: Orders** where we'll create receipts and link them to these tables.

---
**Phase Version:** 2.0 (Vertical Slice)
**Last Updated:** December 29, 2025
