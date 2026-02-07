/**
 * API Endpoint Constants
 * External backend API at http://192.168.100.75:5000
 */

export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
} as const

export const USER_ENDPOINTS = {
  users: '/auth/users',
  byId: (id: number) => `/auth/users/${id}`,
  resetPassword: (id: number) => `/auth/users/${id}/reset-password`,
} as const

export const MENU_ENDPOINTS = {
  items: '/menu/items',
  sections: '/menu/sections',
  images: '/menu/images',
  itemById: (id: number) => `/menu/items/${id}`,
  sectionById: (id: number) => `/menu/sections/${id}`,
} as const

export const TABLE_ENDPOINTS = {
  tables: '/tables',
  available: '/tables/available',
  byId: (id: number) => `/tables/${id}`,
  updateStatus: (id: number) => `/tables/${id}/status`,
} as const

export const ORDER_ENDPOINTS = {
  receipts: '/receipts',
  customers: '/receipts/customers',
  receiptById: (id: number) => `/receipts/${id}`,
  receiptTotal: (id: number) => `/receipts/${id}/total`,
  receiptComplete: (id: number) => `/receipts/${id}/complete`,
  updateItemStatus: (receiptId: number, itemId: number) =>
    `/receipts/${receiptId}/items/${itemId}/status`,
} as const

export const KITCHEN_ENDPOINTS = {
  pending: '/kitchen/pending',
  byTable: '/kitchen/by-table',
} as const

export const DELIVERY_ENDPOINTS = {
  drivers: '/delivery/drivers',
  driverById: (id: number) => `/delivery/drivers/${id}`,
  driverStats: (id: number) => `/delivery/drivers/${id}/stats`,
  receipts: '/delivery/receipts',
  receiptById: (id: number) => `/delivery/receipts/${id}`,
  assign: '/delivery/receipts/assign',
  markPaid: (id: number) => `/delivery/receipts/${id}/payment`,
  unpaidByDriver: (driverId: number) =>
    `/delivery/receipts/driver/${driverId}/unpaid`,
} as const

export const REPORTS_ENDPOINTS = {
  salesDaily: (date: string) => `/reports/sales/daily?date=${date}`,
  salesPeriod: '/reports/sales/period',
  topSelling: '/reports/items/top-selling',
  slowMoving: '/reports/items/slow-moving',
  revenueBySection: '/reports/revenue/by-section',
  staffPerformance: '/reports/staff/performance',
  tableTurnover: '/reports/tables/turnover',
  inventoryStatus: '/reports/inventory/status',
  inventoryMovement: '/reports/inventory/movement',
  inventoryPurchases: '/reports/inventory/purchases',
  inventoryWaste: '/reports/inventory/waste',
  vendorPerformance: '/reports/vendors/performance',
} as const

export const STORAGE_ENDPOINTS = {
  items: '/storage/items',
  itemById: (id: number) => `/storage/items/${id}`,
  lowStock: '/storage/items/low-stock',
  entries: '/storage/entries',
  entryById: (id: number) => `/storage/entries/${id}`,
  usages: '/storage/usages',
  usageById: (id: number) => `/storage/usages/${id}`,
} as const

export const VENDOR_ENDPOINTS = {
  vendors: '/vendors',
  vendorById: (id: number) => `/vendors/${id}`,
} as const

export const AUDIT_ENDPOINTS = {
  logs: '/audit/logs',
  userLogs: (userId: number) => `/audit/logs/user/${userId}`,
  receiptLogs: (receiptId: number) => `/audit/logs/receipt/${receiptId}`,
  eventLogs: (eventType: string) => `/audit/logs/events/${eventType}`,
} as const
