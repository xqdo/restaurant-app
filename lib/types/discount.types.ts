/**
 * Discount Types
 * Interfaces for discount management and application
 */

// Discount type enum
export type DiscountType = 'amount' | 'percentage' | 'combo'

// Condition type enum
export type ConditionType = 'min_amount' | 'day_of_week'

// Discount condition (min_amount, day_of_week)
export interface DiscountCondition {
  id: number
  discount_id: number
  condition_type: ConditionType
  value: string
}

// Discount item for combo discounts
export interface DiscountItem {
  id: number
  discount_id: number
  item_id: number
  item_name?: string
  min_quantity: number
}

// Main Discount entity (GET response)
export interface Discount {
  id: number
  name: string
  code: string
  type: DiscountType
  amount?: string // For type=amount (Decimal from backend)
  persentage?: number // Note: typo in backend schema, keep as-is
  start_date: string // ISO 8601 datetime
  end_date: string // ISO 8601 datetime
  max_receipts?: number
  usage_count: number
  is_active: boolean
  conditions?: DiscountCondition[]
  items?: DiscountItem[] // For type=combo
  created_at: string
  updated_at?: string
}

// Create discount DTO (POST /discounts)
export interface CreateDiscountDto {
  name: string
  code: string
  type: DiscountType
  amount?: number
  persentage?: number // Note: typo in backend schema
  start_date: string // ISO 8601 datetime
  end_date: string // ISO 8601 datetime
  max_receipts?: number
  item_ids?: number[] // For combo discounts
  conditions?: {
    min_amount?: number
    day_of_week?: number[] // 0=Sunday, 6=Saturday
  }
}

// Update discount DTO (PUT /discounts/:id)
export interface UpdateDiscountDto {
  name?: string
  code?: string
  type?: DiscountType
  amount?: number
  persentage?: number
  start_date?: string
  end_date?: string
  max_receipts?: number
  item_ids?: number[]
  conditions?: {
    min_amount?: number
    day_of_week?: number[]
  }
}

// Apply discount DTO (POST /discounts/apply)
export interface ApplyDiscountDto {
  code: string
  receipt_id: number
}

// Apply discount response
export interface ApplyDiscountResponse {
  receipt_id: number
  discount_applied: {
    code: string
    name: string
    type: string
    discount_amount: number
  }
  subtotal: string
  total_discount: string
  new_total: string
}
