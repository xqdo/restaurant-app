# Phase 3: Kitchen Workflow (Complete Feature)

**Timeline:** Week 5 | **Priority:** 🔥 HIGH

## Objective

Build **complete kitchen display system** where kitchen staff see pending orders, update item status, and complete orders. Completes the order lifecycle.

## What Gets Built (Full Stack)

### 1. Service Layer (/lib/services/kitchen.service.ts)
```typescript
✅ getPendingItems() - All pending/preparing items
✅ getItemsByReceipt() - Grouped by order
✅ updateItemStatus(receiptId, itemId, status, userId)
✅ completeReceipt(receiptId, userId)
```

### 2. API Routes (/app/api/kitchen/ + /app/api/receipts/)
```typescript
✅ GET /api/kitchen/pending - All pending items
✅ GET /api/kitchen/by-table - Grouped by receipt
✅ PUT /api/receipts/{receiptId}/items/{itemId}/status - Update status
✅ PUT /api/receipts/{id}/complete - Complete receipt
```

### 3. UI Components
```typescript
✅ /app/kitchen/page.tsx - Kitchen display (NEW PAGE)
✅ /components/kitchen-display.tsx - Main display
✅ /components/order-status-tracker.tsx - Status buttons
✅ /components/receipt-item-card.tsx - Item display card
```

### 4. Features
- ✅ View all pending orders
- ✅ Group by table/receipt
- ✅ Update item status: pending → preparing → ready → done
- ✅ Complete entire order
- ✅ Release table back to AVAILABLE
- ✅ Real-time-ish updates (poll every 30s)
- ✅ Priority sorting (oldest first)

## Implementation Steps

### Step 1: Service Layer (45 min)
Create `/lib/services/kitchen.service.ts`:
- Query items with status pending/preparing
- Include receipt and table info
- Sort by creation time (oldest first)
- Status update with validation

### Step 2: API Routes (45 min)
Create kitchen API routes:
- `/api/kitchen/pending` - List items
- `/api/kitchen/by-table` - Grouped view
- Update receipt service: add `completeReceipt()`
- Add status update endpoint
- Auth: Kitchen and Admin roles only

### Step 3: Kitchen Display UI (2-3 hours)
Create `/app/kitchen/page.tsx`:
- Fetch pending items
- Display in cards/rows
- Group by receipt option
- Status update buttons
- Auto-refresh every 30 seconds
- Show table number, item name, quantity, notes

### Step 4: Status Update UI (1 hour)
Create status tracker:
- Visual status progression
- Buttons for each status
- Validate transitions (can't skip steps)
- Toast on success
- Re-fetch data after update

### Step 5: Order Completion (45 min)
Add complete receipt functionality:
- Button to mark order complete
- Update all items to "done"
- Set table back to AVAILABLE
- Record completion time

### Step 6: Testing (30 min)
- Test status updates work
- Test can't skip status steps
- Test order completion
- Test table released properly
- Test Kitchen role access
- Test auto-refresh

## Item Status Workflow

```
pending → preparing → ready → done
```

**Rules:**
- Can't skip steps
- Only Kitchen/Admin can update
- All items must be "done" before completing receipt
- Completion releases table

## Database (Already Exists)

```prisma
model ReceiptItem {
  status  String  @default("pending")
  // "pending", "preparing", "ready", "done"
}

model Receipt {
  completed_at  DateTime?
}
```

## Acceptance Criteria (Done When...)

- [ ] All 4 API endpoints working
- [ ] `/app/kitchen/page.tsx` displays pending items (NEW)
- [ ] Can update item status
- [ ] Status validation prevents skipping
- [ ] Can complete orders
- [ ] Table released on completion
- [ ] Items sorted by creation time
- [ ] Auto-refresh works
- [ ] Kitchen role access enforced
- [ ] Toast notifications work
- [ ] Works on kitchen display (large screen)
- [ ] No console errors

## Files Created/Modified

```
NEW FILES:
- /lib/services/kitchen.service.ts
- /app/api/kitchen/pending/route.ts
- /app/api/kitchen/by-table/route.ts
- /app/api/receipts/[receiptId]/items/[itemId]/status/route.ts
- /app/api/receipts/[id]/complete/route.ts
- /app/kitchen/page.tsx (NEW PAGE)
- /components/kitchen-display.tsx
- /components/order-status-tracker.tsx
- /components/receipt-item-card.tsx

MODIFIED FILES:
- /lib/services/receipt.service.ts (add completeReceipt)
- /lib/services/table.service.ts (may need table release helper)
```

## Next Phase

After kitchen is complete, move to **Phase 4: Discounts** to add promotional pricing and discount management.

---
**Phase Version:** 2.0 (Vertical Slice)
**Last Updated:** December 29, 2025
