/**
 * Storage/Inventory Type Definitions
 * Matches backend storage API schemas
 */

// Unit of measurement for storage items
export type UnitOfMeasurement = 'kg' | 'g' | 'liter' | 'ml' | 'piece' | 'pack' | 'box'

// Reason for stock usage
export type UsageReason = 'production' | 'waste' | 'adjustment' | 'expired'

// Arabic labels for units
export const UNIT_LABELS: Record<UnitOfMeasurement, string> = {
  kg: 'كيلوغرام',
  g: 'غرام',
  liter: 'لتر',
  ml: 'مل',
  piece: 'قطعة',
  pack: 'عبوة',
  box: 'صندوق',
}

// Arabic labels for usage reasons
export const REASON_LABELS: Record<UsageReason, string> = {
  production: 'إنتاج',
  waste: 'هدر',
  adjustment: 'تعديل',
  expired: 'منتهي الصلاحية',
}

// Storage item from backend
export interface StorageItem {
  id: number
  name: string
  description?: string | null
  unit: UnitOfMeasurement
  current_quantity: string // Decimal as string
  min_quantity?: string | null // Decimal as string
  base_entity_id: number
  baseEntity?: {
    created_at: string
    created_by: number
    updated_at?: string | null
    createdByUser?: { id: number; fullname: string }
  }
}

// Storage entry (stock-in record)
export interface StorageEntry {
  id: number
  storage_item_id: number
  quantity: string // Decimal as string
  unit_price?: string | null // Decimal as string
  supplier?: string | null
  notes?: string | null
  entry_date: string
  base_entity_id: number
  storageItem?: StorageItem
  baseEntity?: {
    created_at: string
    created_by: number
    createdByUser?: { id: number; fullname: string }
  }
}

// Storage usage (stock-out record)
export interface StorageUsage {
  id: number
  storage_item_id: number
  quantity: string // Decimal as string
  reason?: UsageReason | null
  notes?: string | null
  usage_date: string
  base_entity_id: number
  storageItem?: StorageItem
  baseEntity?: {
    created_at: string
    created_by: number
    createdByUser?: { id: number; fullname: string }
  }
}

// Create DTOs
export interface CreateStorageItemDto {
  name: string
  description?: string
  unit: UnitOfMeasurement
  min_quantity?: number
}

export interface UpdateStorageItemDto {
  name?: string
  description?: string
  unit?: UnitOfMeasurement
  min_quantity?: number
}

export interface CreateStorageEntryDto {
  storage_item_id: number
  quantity: number
  unit_price?: number
  supplier?: string
  notes?: string
  entry_date?: string
}

export interface CreateStorageUsageDto {
  storage_item_id: number
  quantity: number
  reason?: UsageReason
  notes?: string
  usage_date?: string
}
