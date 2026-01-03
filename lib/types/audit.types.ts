/**
 * Audit Log Types
 * Matches OpenAPI schema from external backend API
 */

/**
 * Supported audit event types
 */
export type AuditEventType =
  // Authentication events
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  // User management events
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  // Order/Receipt events
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_COMPLETED'
  | 'ORDER_DELETED'
  // Menu item events
  | 'ITEM_CREATED'
  | 'ITEM_UPDATED'
  | 'ITEM_DELETED'
  // Table events
  | 'TABLE_STATUS_CHANGED'
  // Discount events
  | 'DISCOUNT_APPLIED'
  // Delivery events
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_PAYMENT_UPDATED'
  // Export events
  | 'REPORT_EXPORTED'
  | 'AUDIT_EXPORTED'

/**
 * Single audit log entry (matches AuditLogDto from backend)
 */
export interface AuditLog {
  id: number
  user_id: number | null
  username?: string
  event: string
  occurred_at: string // ISO 8601 datetime string
}

/**
 * Paginated audit logs response (matches AuditLogsResponseDto from backend)
 */
export interface AuditLogsResponse {
  logs: AuditLog[]
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Filter parameters for querying audit logs
 */
export interface AuditLogFilters {
  user_id?: number
  event?: string
  start_date?: string // YYYY-MM-DD format
  end_date?: string // YYYY-MM-DD format
  page?: number
  limit?: number
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
}
