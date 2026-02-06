/**
 * Audit Service
 * Client-side service for interacting with the external backend audit API
 *
 * NOTE: This is a client-side service (NO 'server-only' import)
 * It calls the external backend API at http://192.168.0.238:5000
 */

import { apiClient } from '@/lib/api/client'
import { AUDIT_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  AuditLogFilters,
  AuditLogsResponse,
  AuditLog,
  PaginationParams,
} from '@/lib/types/audit.types'

/**
 * Get all audit logs with optional filters and pagination
 *
 * @param filters - Filter criteria (user_id, event, date range, pagination)
 * @returns Paginated audit logs response
 *
 * @example
 * const response = await getAllAuditLogs({
 *   user_id: 1,
 *   event: 'USER_LOGIN',
 *   start_date: '2025-01-01',
 *   end_date: '2025-01-31',
 *   page: 1,
 *   limit: 50
 * })
 */
export async function getAllAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams()

  // Add filter parameters if provided
  if (filters.user_id) {
    params.append('user_id', filters.user_id.toString())
  }
  if (filters.event) {
    params.append('event', filters.event)
  }
  if (filters.start_date) {
    params.append('start_date', filters.start_date)
  }
  if (filters.end_date) {
    params.append('end_date', filters.end_date)
  }

  // Add pagination parameters (default: page 1, limit 50)
  params.append('page', (filters.page || 1).toString())
  params.append('limit', (filters.limit || 50).toString())

  const endpoint = `${AUDIT_ENDPOINTS.logs}?${params.toString()}`
  return await apiClient.get<AuditLogsResponse>(endpoint)
}

/**
 * Get audit logs for a specific user
 *
 * @param userId - User ID to get logs for
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 50)
 * @returns Paginated audit logs for the user
 *
 * @example
 * const response = await getUserAuditLogs(5, 1, 50)
 */
export async function getUserAuditLogs(
  userId: number,
  page: number = 1,
  limit: number = 50
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const endpoint = `${AUDIT_ENDPOINTS.userLogs(userId)}?${params.toString()}`
  return await apiClient.get<AuditLogsResponse>(endpoint)
}

/**
 * Get audit trail for a specific receipt
 *
 * @param receiptId - Receipt ID to get audit trail for
 * @returns Array of audit logs related to the receipt
 *
 * @example
 * const logs = await getReceiptAuditTrail(123)
 */
export async function getReceiptAuditTrail(
  receiptId: number
): Promise<AuditLog[]> {
  const endpoint = AUDIT_ENDPOINTS.receiptLogs(receiptId)
  return await apiClient.get<AuditLog[]>(endpoint)
}

/**
 * Get audit logs for a specific event type
 *
 * @param eventType - Event type to filter by (e.g., 'USER_LOGIN', 'ORDER_CREATED')
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 50)
 * @returns Paginated audit logs for the event type
 *
 * @example
 * const response = await getEventTypeLogs('USER_LOGIN', 1, 50)
 */
export async function getEventTypeLogs(
  eventType: string,
  page: number = 1,
  limit: number = 50
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const endpoint = `${AUDIT_ENDPOINTS.eventLogs(eventType)}?${params.toString()}`
  return await apiClient.get<AuditLogsResponse>(endpoint)
}
