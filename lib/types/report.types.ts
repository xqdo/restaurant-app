/**
 * Report Type Definitions
 * Matches OpenAPI schemas from external backend API
 */

// Period types for report filters
export type ReportPeriod = 'today' | 'yesterday' | 'weekly' | 'monthly' | 'custom'

// Daily Sales Report (GET /reports/sales/daily?date=YYYY-MM-DD)
export interface SalesReportDto {
  date: string
  total_receipts: number
  total_revenue: number
  average_order_value: number
  dine_in_orders: number
  delivery_orders: number
}

// Period Sales Report (GET /reports/sales/period?start=DATE&end=DATE&period=7days)
export interface PeriodSalesReportDto {
  start_date: string
  end_date: string
  total_receipts: number
  total_revenue: number
  average_order_value: number
  dine_in_orders: number
  delivery_orders: number
  growth_percentage: number
  daily_breakdown?: DailyBreakdown[]
  pagination?: PaginationMeta
}

export interface DailyBreakdown {
  date: string
  revenue: number
  receipts: number
}

// Top Items Report (GET /reports/items/top-selling?limit=10&period=7days)
export interface TopItemsReportDto {
  period: string
  items: TopItemDto[]
}

export interface TopItemDto {
  item_id: number
  name: string
  quantity_sold: number
  revenue: number
  price: number
}

// Revenue by Section Report (GET /reports/revenue/by-section?period=7days)
export interface RevenueBySectionReportDto {
  sections: RevenueBySectionDto[]
  total_revenue: number
  period: string
  start_date: string
  end_date: string
  pagination?: PaginationMeta
}

export interface RevenueBySectionDto {
  section_id: number
  section_name: string
  items_count: number
  total_quantity: number
  total_revenue: number
  revenue_percentage: number
}

// Staff Performance Report (GET /reports/staff/performance?period=7days)
export interface StaffPerformanceReportDto {
  staff: StaffPerformanceDto[]
  start_date: string
  end_date: string
  pagination?: PaginationMeta
}

export interface StaffPerformanceDto {
  user_id: number
  fullname: string
  orders_count: number
  total_revenue: number
  average_order_value: number
  roles?: string[]
}

// Table Turnover Report (GET /reports/tables/turnover?period=7days)
export interface TableTurnoverReportDto {
  tables: TableTurnoverDto[]
  date: string
  start_date: string
  end_date: string
  pagination?: PaginationMeta
}

export interface TableTurnoverDto {
  table_id: number
  table_number: number
  orders_count: number
  total_revenue: number
  average_order_value: number
  section_name?: string
}

// Discount Usage Report (GET /reports/discounts/usage?period=7days)
export interface DiscountUsageReportDto {
  discounts: DiscountUsageDto[]
  start_date: string
  end_date: string
  pagination?: PaginationMeta
}

export interface DiscountUsageDto {
  discount_id: number
  code: string
  name: string
  times_used: number
  total_discount_amount: number
  total_revenue: number
  average_order_value: number
}

// Common pagination meta
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter state for report components
export interface ReportFilters {
  period: ReportPeriod
  startDate?: string
  endDate?: string
}

// Summary by order type for reports
export interface OrderTypeSummary {
  orderType: import('@/lib/types/receipt.types').OrderType
  label: string
  paidCount: number
  unpaidCount: number
  paidTotal: number
  unpaidTotal: number
  totalCount: number
  totalAmount: number
}

export interface ReportSummary {
  totalReceipts: number
  totalPaid: number
  totalUnpaid: number
  totalRevenue: number
  paidRevenue: number
  unpaidRevenue: number
  byOrderType: OrderTypeSummary[]
}

// --- Inventory & Vendor Reports ---

// Inventory Status Report (GET /reports/inventory/status)
export interface InventoryStatusItemDto {
  item_id: number
  name: string
  unit: string
  current_quantity: number
  min_quantity?: number | null
  status: 'ok' | 'low' | 'out'
  vendor_name?: string | null
}

export interface InventoryStatusReportDto {
  items: InventoryStatusItemDto[]
  total_items: number
  low_stock_count: number
  out_of_stock_count: number
}

// Stock Movement Report (GET /reports/inventory/movement)
export interface StockMovementItemDto {
  item_id: number
  name: string
  unit: string
  total_entries_qty: number
  entries_count: number
  total_usages_qty: number
  usages_count: number
  net_change: number
}

export interface StockMovementReportDto {
  items: StockMovementItemDto[]
  total_received: number
  total_consumed: number
  start_date: string
  end_date: string
}

// Purchase Cost Report (GET /reports/inventory/purchases)
export interface PurchaseCostItemDto {
  item_id: number
  name: string
  unit: string
  total_quantity: number
  total_cost: number
  average_unit_cost: number
  entries_count: number
}

export interface PurchaseCostReportDto {
  items: PurchaseCostItemDto[]
  grand_total: number
  start_date: string
  end_date: string
}

// Waste Report (GET /reports/inventory/waste)
export interface WasteReportItemDto {
  item_id: number
  name: string
  unit: string
  waste_qty: number
  waste_count: number
  expired_qty: number
  expired_count: number
  total_loss: number
}

export interface WasteReportDto {
  items: WasteReportItemDto[]
  total_waste_qty: number
  total_expired_qty: number
  total_loss: number
  start_date: string
  end_date: string
}

// Vendor Performance Report (GET /reports/vendors/performance)
export interface VendorPerformanceItemDto {
  vendor_id: number
  name: string
  phone?: string | null
  total_quantity: number
  total_cost: number
  unique_items_count: number
  entries_count: number
  average_cost_per_entry: number
}

export interface VendorPerformanceReportDto {
  vendors: VendorPerformanceItemDto[]
  grand_total: number
  start_date: string
  end_date: string
}
