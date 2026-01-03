# Phase 2: Orders/Receipts Management (Complete Feature)

**Timeline:** Week 3-4 (2 weeks) | **Priority:** 🎯 CRITICAL

## Objective

Build a **complete order management system** where waiters can create orders for tables, add menu items, and view all orders. This is the revenue-generating feature.

## What Gets Built (Full Stack)

### 1. Service Layer (/lib/services/receipt.service.ts)
```typescript
✅ createReceipt(data, userId)
✅ getAllReceipts(filters)
✅ getReceiptById(id)
✅ updateReceipt(id, data, userId)
✅ deleteReceipt(id, userId)
✅ addItemToReceipt(receiptId, itemData, userId)
✅ removeItemFromReceipt(receiptId, itemId, userId)
```

### 2. API Routes (/app/api/receipts/)
```typescript
✅ GET /api/receipts - List (with filters: table_id, date range, is_delivery)
✅ POST /api/receipts - Create receipt
✅ GET /api/receipts/{id} - Get full details with items
✅ PATCH /api/receipts/{id} - Update receipt
✅ DELETE /api/receipts/{id} - Soft delete
✅ GET /api/receipts/{id}/total - Get totals
```

### 3. UI Components
```typescript
✅ /app/orders/page.tsx - Main page (replace UnderDevelopment)
✅ /components/order-form.tsx - Create/edit order (drawer)
✅ /components/order-list.tsx - Orders data table
✅ /components/order-detail.tsx - Order detail view
✅ /components/item-selector.tsx - Select menu items
✅ /components/receipt-summary.tsx - Order summary
```

### 4. Features
- ✅ Create new orders for tables
- ✅ Add multiple items to order
- ✅ Specify quantities
- ✅ Add special notes per item
- ✅ View all orders with filters
- ✅ View order details
- ✅ Filter by table, date, delivery type
- ✅ Pagination
- ✅ Order summary with subtotal

## Implementation Steps

### Step 1: Service Layer (1-2 hours)
Create `/lib/services/receipt.service.ts`:
- Create receipt with items (use transaction)
- Validate table exists
- Validate items exist in menu
- Set table to OCCUPIED when order created
- All items start with status "pending"

### Step 2: API Routes (1-2 hours)
Create `/app/api/receipts/` routes:
- Collection: `route.ts` (GET with filters, POST create)
- Resource: `[id]/route.ts` (GET detail, PATCH update, DELETE)
- Nested: `[id]/total/route.ts` (GET totals)
- Auth check: Waiter, Manager, or Admin

### Step 3: Order Form UI (2-3 hours)
Create order creation flow:
- Select table (dropdown of available tables)
- Browse menu items by section
- Add items with quantity
- Add notes per item
- Show running subtotal
- Submit creates receipt + items in transaction

### Step 4: Order List UI (1-2 hours)
Create orders list page:
- Data table with all orders
- Columns: receipt#, table, time, waiter, total
- Filters: table, date range, dine-in/delivery
- Pagination (10 per page)
- Click to view details

### Step 5: Order Details (1 hour)
Create detail view:
- Show receipt info (table, time, waiter)
- List all items with quantities and prices
- Show item statuses
- Show subtotal, discounts, total
- Show special notes

### Step 6: Testing (1 hour)
- Test create order with multiple items
- Test filters work correctly
- Test pagination
- Test viewing order details
- Test different user roles
- Test mobile layout

## Database Schema (Already Exists)

```prisma
model Receipt {
  id              Int             @id @default(autoincrement())
  number          Int             @unique
  table_id        Int?
  is_delivery     Boolean         @default(false)
  phone_number    String?
  location        String?
  notes           String?
  isdeleted       Boolean         @default(false)
  BaseEntity      BaseEntity      @relation(...)
  Table           Table?          @relation(...)
  ReceiptItem     ReceiptItem[]
  // ... discounts, delivery relations
}

model ReceiptItem {
  id              Int         @id @default(autoincrement())
  receipt_id      Int
  item_id         Int
  quantity        Int
  unit_price      Decimal     @db.Decimal(10, 2)
  notes           String?
  status          String      @default("pending")
  Receipt         Receipt     @relation(...)
  Item            Item        @relation(...)
}
```

## Business Rules

**For dine-in orders:**
- `table_id` is REQUIRED
- `phone_number` and `location` are optional
- Table status changes to OCCUPIED

**For delivery orders (future):**
- `phone_number` and `location` are REQUIRED
- `table_id` is optional/null

**Order creation:**
- At least one item required
- All items must exist in menu
- Each item starts with status "pending"
- Receipt gets unique auto-increment number

## Acceptance Criteria (Done When...)

- [ ] All 6 API endpoints working
- [ ] `/app/orders/page.tsx` shows orders (no UnderDevelopment)
- [ ] Can create order for table
- [ ] Can add multiple items to order
- [ ] Can add notes to items
- [ ] Order list shows all receipts
- [ ] Can filter by table, date
- [ ] Pagination works
- [ ] Can view order details
- [ ] Order creation sets table to OCCUPIED
- [ ] Audit trail tracks creator
- [ ] Toast notifications work
- [ ] Works on mobile
- [ ] No console errors

## Files Created/Modified

```
NEW FILES:
- /lib/services/receipt.service.ts
- /app/api/receipts/route.ts
- /app/api/receipts/[id]/route.ts
- /app/api/receipts/[id]/total/route.ts
- /components/order-form.tsx
- /components/order-list.tsx
- /components/order-detail.tsx
- /components/item-selector.tsx
- /components/receipt-summary.tsx

MODIFIED FILES:
- /app/orders/page.tsx (replace UnderDevelopment)
```

## Next Phase

After orders are complete, move to **Phase 3: Kitchen** where kitchen staff will see these orders and update item statuses.

---
**Phase Version:** 2.0 (Vertical Slice)
**Last Updated:** December 29, 2025
