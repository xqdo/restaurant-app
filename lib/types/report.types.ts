/**
 * Report Type Definitions
 * Matches OpenAPI schemas from external backend API
 */

// Period types for report filters
export type ReportPeriod = '7days' | '30days' | '90days' | 'custom'

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
  page?: number
  limit?: number
}
