# Phase 7: Audit Logs (Complete Feature)

**Timeline:** Week 9 | **Priority:** 📋 LOW

## Objective

Build **complete audit logging system** for compliance, security, and activity tracking. Admins can view all system activity, filter logs, and export data.

## What Gets Built (Full Stack)

### 1. Service Layer (/lib/services/audit.service.ts)
```typescript
✅ createLog(userId, event, metadata?) - Log an event
✅ getAllLogs(filters, pagination)
✅ getUserLogs(userId, pagination)
✅ getReceiptLogs(receiptId)
✅ getEventLogs(eventType, pagination)
```

### 2. API Routes
```typescript
✅ GET /api/audit/logs - List all (with filters and pagination)
✅ GET /api/audit/logs/user/{userId} - User activity
✅ GET /api/audit/logs/receipt/{receiptId} - Receipt audit trail
✅ GET /api/audit/logs/events/{eventType} - Filter by event type
```

### 3. Export Service (/lib/services/export.service.ts)
```typescript
✅ exportLogs(filters, format) - Export audit logs
```

### 4. UI Components
```typescript
✅ /app/audit/page.tsx - Audit logs viewer (NEW PAGE)
✅ /components/audit-log-table.tsx - Logs table
✅ /components/log-filters.tsx - Filter controls
✅ /components/log-detail-dialog.tsx - Event details
```

### 5. Features
- ✅ View all system activity
- ✅ Filter by user, event type, date range
- ✅ Search functionality
- ✅ Pagination (50 logs per page)
- ✅ View event details
- ✅ Export logs to CSV
- ✅ Receipt audit trail
- ✅ User activity timeline

## Implementation Steps

### Step 1: Service Layer (1-2 hours)
Create `/lib/services/audit.service.ts`:
- Query Log table with filters
- Join with User table for username
- Pagination support
- Event type filtering
- Date range filtering

### Step 2: API Routes (1 hour)
Create audit API routes:
- Main logs endpoint with all filters
- User-specific logs
- Receipt-specific logs
- Event-specific logs
- Auth: Admin only

### Step 3: Audit Page UI (2 hours)
Create `/app/audit/page.tsx`:
- Logs table with columns: time, user, event, entity
- Filter controls (user, event, date range)
- Pagination controls
- Click to view details
- Export button

### Step 4: Log Event Integration (2-3 hours)
Add logging to existing features:
- Login/logout events
- User create/update/delete
- Receipt create/update/complete
- Item create/update/delete
- Table status changes
- Discount application
- And more...

### Step 5: Export Functionality (1 hour)
Create CSV export:
- Generate CSV from logs
- Include all relevant fields
- Download as file
- Log the export action itself

### Step 6: Testing (45 min)
- Test log filtering
- Test pagination
- Test event detail view
- Test export
- Test Admin-only access
- Verify all events logging correctly

## Event Types

```typescript
enum AuditEvent {
  // Authentication
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',

  // Users
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',

  // Orders
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_DELETED = 'ORDER_DELETED',

  // Items
  ITEM_CREATED = 'ITEM_CREATED',
  ITEM_UPDATED = 'ITEM_UPDATED',
  ITEM_DELETED = 'ITEM_DELETED',

  // Tables
  TABLE_STATUS_CHANGED = 'TABLE_STATUS_CHANGED',

  // Discounts
  DISCOUNT_APPLIED = 'DISCOUNT_APPLIED',

  // Delivery
  DELIVERY_ASSIGNED = 'DELIVERY_ASSIGNED',
  DELIVERY_PAYMENT_UPDATED = 'DELIVERY_PAYMENT_UPDATED',

  // Reports
  REPORT_EXPORTED = 'REPORT_EXPORTED',
  AUDIT_EXPORTED = 'AUDIT_EXPORTED'
}
```

## Database Schema (Already Exists)

```prisma
model Log {
  id            Int       @id @default(autoincrement())
  user_id       Int?
  event         String
  occurred_at   DateTime  @default(now())
  User          User?     @relation(...)
}
```

**Enhancement Needed:**
Consider adding:
- `entity_type` (e.g., "Receipt", "User")
- `entity_id` (ID of affected record)
- `metadata` (JSONB for additional details)

## Logging Helper

Create utility function:
```typescript
// /lib/utils/audit-logger.ts
export async function logEvent(
  userId: number | null,
  event: AuditEvent,
  entityType?: string,
  entityId?: number,
  metadata?: Record<string, any>
) {
  await prisma.log.create({
    data: {
      user_id: userId,
      event,
      // If schema enhanced:
      // entity_type: entityType,
      // entity_id: entityId,
      // metadata: metadata ? JSON.stringify(metadata) : null
    }
  })
}
```

Use in services:
```typescript
// Example in receipt.service.ts
export async function createReceipt(data, userId) {
  const receipt = await prisma.receipt.create({ ... })

  await logEvent(
    userId,
    'ORDER_CREATED',
    'Receipt',
    receipt.id,
    { table_id: data.table_id }
  )

  return receipt
}
```

## Acceptance Criteria (Done When...)

- [ ] All 4 API endpoints working
- [ ] `/app/audit/page.tsx` displays logs (NEW PAGE)
- [ ] Can filter by user, event, date
- [ ] Pagination works
- [ ] Can view event details
- [ ] Can export logs to CSV
- [ ] All major events are logged:
  - [ ] Login/logout
  - [ ] User management
  - [ ] Order creation/completion
  - [ ] Discount application
  - [ ] Table status changes
  - [ ] Item changes
- [ ] Admin-only access enforced
- [ ] Works on desktop (large tables)
- [ ] No console errors

## Files Created/Modified

```
NEW FILES:
- /lib/services/audit.service.ts
- /lib/utils/audit-logger.ts
- /app/api/audit/logs/route.ts
- /app/api/audit/logs/user/[userId]/route.ts
- /app/api/audit/logs/receipt/[receiptId]/route.ts
- /app/api/audit/logs/events/[eventType]/route.ts
- /app/audit/page.tsx (NEW PAGE)
- /components/audit-log-table.tsx
- /components/log-filters.tsx
- /components/log-detail-dialog.tsx

MODIFIED FILES (add logging):
- /lib/services/auth.service.ts
- /lib/services/user.service.ts
- /lib/services/receipt.service.ts
- /lib/services/item.service.ts
- /lib/services/table.service.ts
- /lib/services/discount.service.ts
- /lib/services/delivery.service.ts
```

## Completion Milestone

🎉 **Phase 7 completes the entire roadmap!**

With audit logs done, the restaurant management system has:
- ✅ Authentication & user management
- ✅ Table management
- ✅ Order/receipt management
- ✅ Kitchen workflow
- ✅ Discount system
- ✅ Delivery operations
- ✅ Analytics & reports
- ✅ Audit logging

**All 49 API endpoints implemented.**
**All 8 pages fully functional.**
**Complete restaurant operations system ready for production.**

---
**Phase Version:** 2.0 (Vertical Slice)
**Last Updated:** December 29, 2025
