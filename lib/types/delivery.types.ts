// Delivery Management Types
// Note: Field name 'dilvery_guy_id' has typo in database schema - use as-is

export interface DeliveryGuy {
  id: number
  name: string
  phone_number: string
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  isdeleted: boolean
}

export interface CreateDeliveryGuyDto {
  name: string
  phone_number: string
}

export interface UpdateDeliveryGuyDto {
  name?: string
  phone_number?: string
}

export interface DeliveryReceipt {
  id: number
  dilvery_guy_id: number // Note: typo in schema - use as-is
  receipt_id: number
  is_paid: boolean
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  isdeleted: boolean
}

export interface AssignDeliveryDto {
  receipt_id: number
  delivery_guy_id: number
}

export interface MarkPaidDto {
  is_paid: boolean
}

export interface DeliveryGuyStats {
  driver_id: number
  driver_name: string
  phone_number: string
  total_deliveries: number
  paid_deliveries: number
  unpaid_deliveries: number
  total_earnings: number
  paid_earnings: number
  unpaid_earnings: number
}

export interface DeliveryReceiptWithDetails extends DeliveryReceipt {
  receipt?: {
    id: number
    total: number
    phone_number?: string
    location?: string
    created_at: string
    is_delivery: boolean
  }
  delivery_guy?: {
    id: number
    name: string
    phone_number: string
  }
}

export interface DeliveryReceiptQueryFilters {
  driver_id?: number
  is_paid?: boolean
  page?: number
  perPage?: number
}
