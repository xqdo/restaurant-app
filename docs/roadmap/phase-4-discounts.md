# Phase 4: Discounts Management (Complete Feature)

**Timeline:** Week 6 | **Priority:** 🔥 HIGH

## Objective

Build **complete discount system** with creation, validation, and application. Managers can create flexible discounts (amount, percentage, combo) and apply them to receipts.

## What Gets Built (Full Stack)

### 1. Service Layer
```typescript
// /lib/services/discount.service.ts
✅ createDiscount(data, userId)
✅ getAllDiscounts()
✅ getDiscountById(id)
✅ updateDiscount(id, data, userId)
✅ deleteDiscount(id, userId)
✅ toggleActive(id, userId)

// /lib/services/discount-calculation.service.ts
✅ validateDiscount(code, receiptId)
✅ applyDiscount(code, receiptId, userId)
✅ calculateTotal(receiptId)
```

### 2. API Routes
```typescript
✅ GET /api/discounts - List all
✅ POST /api/discounts - Create (Manager/Admin)
✅ GET /api/discounts/{id} - Get one
✅ PUT /api/discounts/{id} - Update
✅ DELETE /api/discounts/{id} - Soft delete
✅ PUT /api/discounts/{id}/toggle-active - Activate/deactivate
✅ POST /api/discounts/apply - Apply to receipt
```

### 3. UI Components
```typescript
✅ /app/discounts/page.tsx - Main page (replace UnderDevelopment)
✅ /components/discount-form.tsx - Create/edit (drawer)
✅ /components/discount-list.tsx - List discounts
✅ /components/discount-validator.tsx - Validation display
✅ /components/apply-discount-dialog.tsx - Apply to receipt
```

### 4. Features
- ✅ Create 3 types of discounts (amount, percentage, combo)
- ✅ Set validity periods
- ✅ Set conditions (min amount, day of week, max usage)
- ✅ Apply discounts to receipts
- ✅ Validate all conditions
- ✅ Support multiple discounts per receipt
- ✅ Track usage count
- ✅ Activate/deactivate discounts

## Implementation Steps

### Step 1: Service Layer (2-3 hours)
Create discount services:
- CRUD operations
- Validation logic (dates, conditions, usage count)
- Application logic (calculate discount amount)
- Support all 3 types
- Track usage in ReceiptDiscount table

### Step 2: API Routes (1-2 hours)
Create discount API routes:
- Standard CRUD endpoints
- Toggle active endpoint
- Apply discount endpoint (complex logic)
- Auth: Manager/Admin for create/edit
- Waiter/Cashier for apply

### Step 3: Discount Management UI (2 hours)
Create management page:
- List all discounts
- Show active status, usage count
- Create/edit form with all fields
- Toggle active button
- Delete confirmation

### Step 4: Discount Form (2 hours)
Create comprehensive form:
- Type selection (amount/percentage/combo)
- Amount or percentage input (conditional)
- Date range picker
- Conditions (min amount, days)
- Item selection (for combo type)
- Max usage input
- Validation on submit

### Step 5: Apply Discount (1-2 hours)
Add to orders page:
- Button to apply discount
- Input discount code
- Validate and show errors
- Show discount applied successfully
- Update total display

### Step 6: Testing (1 hour)
- Test all discount types
- Test validation (expired, inactive, max usage)
- Test conditions (min amount, day of week)
- Test combo discounts
- Test multiple discounts
- Test total calculation

## Discount Types

### 1. Amount Discount
Fixed dollar amount off total.
```json
{
  "type": "amount",
  "amount": 10.00
}
// $10 off total
```

### 2. Percentage Discount
Percentage off total (0-100%).
```json
{
  "type": "percentage",
  "persentage": 20  // Note: schema typo
}
// 20% off total
```

### 3. Combo Discount
Special pricing for specific items.
```json
{
  "type": "combo",
  "item_ids": [15, 23],
  "amount": 5.00
}
// $5 off when ordering both items
```

## Validation Rules

✅ Discount active (is_active = true)
✅ Current date between start_date and end_date
✅ Usage < max_receipts (if set)
✅ Receipt total >= min_amount (if set)
✅ Day of week in valid_days (if set)
✅ For combo: receipt contains all item_ids

## Database Schema (Already Exists)

```prisma
model Discount {
  id              Int       @id
  name            String
  code            String    @unique
  type            String    // "amount", "percentage", "combo"
  amount          Decimal?
  persentage      Decimal?  // Note: typo in schema
  start_date      DateTime
  end_date        DateTime
  max_receipts    Int?
  is_active       Boolean   @default(true)
  isdeleted       Boolean   @default(false)
  DiscountItem    DiscountItem[]
  DiscountCondition DiscountCondition[]
  ReceiptDiscount ReceiptDiscount[]
}

model ReceiptDiscount {
  receipt_id      Int
  discount_id     Int
  discount_amount Decimal
}
```

## Acceptance Criteria (Done When...)

- [ ] All 7 API endpoints working
- [ ] `/app/discounts/page.tsx` shows discounts (no UnderDevelopment)
- [ ] Can create all 3 types of discounts
- [ ] Can set validity periods
- [ ] Can set conditions
- [ ] Can apply discount to receipt
- [ ] Validation works correctly
- [ ] Multiple discounts can apply
- [ ] Usage count increments
- [ ] Max usage limit enforced
- [ ] Toast notifications work
- [ ] Works on mobile
- [ ] No console errors

## Files Created/Modified

```
NEW FILES:
- /lib/services/discount.service.ts
- /lib/services/discount-calculation.service.ts
- /app/api/discounts/route.ts
- /app/api/discounts/[id]/route.ts
- /app/api/discounts/[id]/toggle-active/route.ts
- /app/api/discounts/apply/route.ts
- /components/discount-form.tsx
- /components/discount-list.tsx
- /components/discount-validator.tsx
- /components/apply-discount-dialog.tsx

MODIFIED FILES:
- /app/discounts/page.tsx (replace UnderDevelopment)
- /app/orders/page.tsx (add apply discount button)
```

## Next Phase

After discounts are complete, move to **Phase 5: Delivery** to add delivery order management and driver tracking.

---
**Phase Version:** 2.0 (Vertical Slice)
**Last Updated:** December 29, 2025
