/**
 * Kitchen Workflow Type Definitions
 * Types for kitchen display system matching backend API contract
 */

import type { ReceiptItemStatus } from './receipt.types'

// Single item in flat list view (GET /kitchen/pending)
export interface KitchenPendingItem {
  id: number // receipt_item.id
  receipt_id: number
  receipt_number: number
  item_id: number
  item_name: string
  quantity: number
  status: ReceiptItemStatus
  notes?: string
  is_delivery: boolean
  table_number?: number
  phone_number?: string
  created_at: string
}

// Receipt group in grouped view (GET /kitchen/by-table)
export interface KitchenReceiptGroup {
  receipt_id: number
  receipt_number: number
  is_delivery: boolean
  table_number?: number
  phone_number?: string
  location?: string
  created_at: string
  items: KitchenReceiptItem[]
}

export interface KitchenReceiptItem {
  id: number // receipt_item.id
  item_id: number
  item_name: string
  quantity: number
  status: ReceiptItemStatus
  notes?: string
}

// Update item status request body
export interface UpdateItemStatusDto {
  status: ReceiptItemStatus
}
