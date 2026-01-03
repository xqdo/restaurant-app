/**
 * Audit Logger Utility
 *
 * NOTE: This is a placeholder utility. The backend API doesn't expose a POST endpoint
 * for creating audit logs. The backend creates logs automatically when actions occur
 * (e.g., when calling POST /receipts, it automatically logs ORDER_CREATED).
 *
 * This utility is provided for:
 * 1. Documentation of available event types
 * 2. Future enhancement if a log creation endpoint is added
 * 3. Client-side debugging during development
 */

import type { AuditEventType } from '@/lib/types/audit.types'

/**
 * Log an audit event (placeholder - backend creates logs internally)
 *
 * The backend automatically logs events when actions occur through the API.
 * This function currently only logs to console for debugging purposes.
 *
 * @param event - The type of event to log
 * @param metadata - Optional metadata about the event
 */
export async function logEvent(
  event: AuditEventType,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Backend creates logs automatically when API calls happen
    // This is a placeholder for future enhancement if POST /audit/logs is added
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Audit Log]', event, metadata)
    }
  } catch (error) {
    // Silent failure - don't break user experience if logging fails
    console.error('Failed to log audit event:', error)
  }
}

// Convenience helper functions for common events
export const logUserLogin = (userId: number) =>
  logEvent('USER_LOGIN', { userId })

export const logUserLogout = (userId: number) =>
  logEvent('USER_LOGOUT', { userId })

export const logOrderCreated = (orderId: number) =>
  logEvent('ORDER_CREATED', { orderId })

export const logOrderCompleted = (orderId: number) =>
  logEvent('ORDER_COMPLETED', { orderId })

export const logDiscountApplied = (discountId: number, receiptId: number) =>
  logEvent('DISCOUNT_APPLIED', { discountId, receiptId })

export const logTableStatusChanged = (tableId: number, newStatus: string) =>
  logEvent('TABLE_STATUS_CHANGED', { tableId, newStatus })

export const logDeliveryAssigned = (receiptId: number, driverId: number) =>
  logEvent('DELIVERY_ASSIGNED', { receiptId, driverId })
