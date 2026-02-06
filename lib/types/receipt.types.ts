/**
 * Receipt and Order Type Definitions
 * Matches the OpenAPI schema from external backend API
 */

// Receipt item status enum
export type ReceiptItemStatus = 'pending' | 'preparing' | 'ready' | 'done'

// Overall order status (derived from item statuses + completed_at)
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'done' | 'completed'

// Order type enum
export type OrderType = 'local' | 'takeaway' | 'delivery'

// Item in order creation request
export interface CreateReceiptItemDto {
  item_id: number
  quantity: number
  notes?: string
}

// Create receipt request (POST /receipts)
export interface CreateReceiptDto {
  is_delivery: boolean
  table_id?: number
  customer_name?: string
  phone_number?: string
  location?: string
  notes?: string
  items: CreateReceiptItemDto[]
}

// Receipt item in response
export interface ReceiptItemDetail {
  id: number
  item_id: number
  item_name: string
  quantity: number
  unit_price: string // Decimal as string
  subtotal: string // Decimal as string
  status: ReceiptItemStatus
  notes?: string
}

// Table info in receipt response
export interface TableInfo {
  id: number
  number: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'
}

// Applied discount info
export interface AppliedDiscount {
  discount_id: number
  discount_name: string
  discount_type: 'PERCENTAGE' | 'FIXED'
  discount_value: string
  amount_saved: string
}

// Full receipt detail (GET /receipts/{id})
export interface ReceiptDetail {
  id: number
  number: number
  is_delivery: boolean
  customer_name?: string
  phone_number?: string
  location?: string
  table?: TableInfo
  items: ReceiptItemDetail[]
  subtotal: string
  discount_amount: string
  total: string
  applied_discounts: AppliedDiscount[]
  notes?: string
  created_by_name: string
  created_at: string
  completed_at?: string
}

// List item (simplified for table view)
export interface ReceiptListItem {
  id: number
  number: number
  is_delivery: boolean
  customer_name?: string
  phone_number?: string
  location?: string
  table?: TableInfo
  created_by_name: string
  created_at: string
  total: string
  item_count: number
  order_status: OrderStatus
}

// Query filters for GET /receipts
export interface ReceiptQueryFilters {
  completed?: boolean
  is_delivery?: boolean
  table_id?: number
  start_date?: string
  end_date?: string
  page?: number
  perPage?: number
}

// Paginated response
export interface PaginatedReceiptsResponse {
  data: ReceiptListItem[]
  meta: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}

// For internal use in order form
export interface OrderItem {
  item: {
    id: number
    name: string
    price: string
  }
  quantity: number
  notes: string
}
