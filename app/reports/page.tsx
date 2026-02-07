'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { type ReportFilters as ReportFiltersType, type ReportSummary as ReportSummaryType, type OrderTypeSummary } from '@/lib/types/report.types'
import { ReportFilters, calculateDateRange } from '@/components/reports/report-filters'
import { ReportSummary } from '@/components/reports/report-summary'
import { ReportReceiptsTable } from '@/components/reports/report-receipts-table'
import { apiClient } from '@/lib/api/client'
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints'
import { localStartOfDayUTC, localEndOfDayUTC } from '@/lib/utils/date'
import type { ReceiptListItem, OrderStatus, ReceiptItemStatus, OrderType } from '@/lib/types/receipt.types'

export default function ReportsPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager']}>
      <ReportsPageContent />
    </AuthGuard>
  )
}

function deriveOrderStatus(backendReceipt: any): OrderStatus {
  if (backendReceipt.completed_at) return 'completed'
  const items = backendReceipt.receiptItems || []
  if (items.length === 0) return 'pending'
  const statuses: ReceiptItemStatus[] = items.map((i: any) => i.status)
  if (statuses.every((s) => s === 'done')) return 'done'
  if (statuses.some((s) => s === 'ready')) return 'ready'
  if (statuses.some((s) => s === 'preparing')) return 'preparing'
  return 'pending'
}

function transformReceipt(backendReceipt: any): ReceiptListItem {
  const items = backendReceipt.receiptItems || []

  // Calculate total from receipt items (unit_price * quantity)
  const calculatedTotal = items.reduce((sum: number, item: any) => {
    const price = item.unit_price ? Number(item.unit_price) : 0
    const quantity = Number(item.quantity) || 1
    return sum + price * quantity
  }, 0)

  // Subtract quick discount if present
  const quickDiscount = backendReceipt.quick_discount ? Number(backendReceipt.quick_discount) : 0
  const finalTotal = calculatedTotal - quickDiscount

  return {
    id: backendReceipt.id,
    number: backendReceipt.number,
    is_delivery: backendReceipt.is_delivery,
    customer_name: backendReceipt.customer_name,
    phone_number: backendReceipt.phone_number,
    table: backendReceipt.table
      ? {
          id: backendReceipt.table.id,
          number: backendReceipt.table.number,
          status: backendReceipt.table.status,
        }
      : undefined,
    created_by_name: backendReceipt.baseEntity?.createdByUser?.fullname || 'غير معروف',
    created_at: backendReceipt.baseEntity?.created_at || '',
    total: finalTotal.toFixed(2),
    item_count: items.length,
    order_status: deriveOrderStatus(backendReceipt),
  }
}

function getOrderType(receipt: ReceiptListItem): OrderType {
  if (receipt.is_delivery) return 'delivery'
  if (receipt.table) return 'local'
  return 'takeaway'
}

function calculateSummary(receipts: ReceiptListItem[]): ReportSummaryType {
  const isPaid = (r: ReceiptListItem) => r.order_status === 'completed'

  const types: { type: OrderType; label: string }[] = [
    { type: 'local', label: 'محلي' },
    { type: 'takeaway', label: 'سفري' },
    { type: 'delivery', label: 'توصيل' },
  ]

  const byOrderType: OrderTypeSummary[] = types.map(({ type, label }) => {
    const ofType = receipts.filter((r) => getOrderType(r) === type)
    const paid = ofType.filter(isPaid)
    const unpaid = ofType.filter((r) => !isPaid(r))

    return {
      orderType: type,
      label,
      paidCount: paid.length,
      unpaidCount: unpaid.length,
      paidTotal: paid.reduce((s, r) => s + parseFloat(r.total), 0),
      unpaidTotal: unpaid.reduce((s, r) => s + parseFloat(r.total), 0),
      totalCount: ofType.length,
      totalAmount: ofType.reduce((s, r) => s + parseFloat(r.total), 0),
    }
  })

  const allPaid = receipts.filter(isPaid)
  const allUnpaid = receipts.filter((r) => !isPaid(r))

  return {
    totalReceipts: receipts.length,
    totalPaid: allPaid.length,
    totalUnpaid: allUnpaid.length,
    totalRevenue: receipts.reduce((s, r) => s + parseFloat(r.total), 0),
    paidRevenue: allPaid.reduce((s, r) => s + parseFloat(r.total), 0),
    unpaidRevenue: allUnpaid.reduce((s, r) => s + parseFloat(r.total), 0),
    byOrderType,
  }
}

const emptySummary: ReportSummaryType = {
  totalReceipts: 0,
  totalPaid: 0,
  totalUnpaid: 0,
  totalRevenue: 0,
  paidRevenue: 0,
  unpaidRevenue: 0,
  byOrderType: [],
}

function ReportsPageContent() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: 'today',
  })
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([])
  const [summary, setSummary] = useState<ReportSummaryType>(emptySummary)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { startDate, endDate } = calculateDateRange(
        filters.period,
        filters.startDate,
        filters.endDate,
      )

      // Convert local date strings to UTC boundaries respecting browser timezone
      const startLocal = new Date(startDate + 'T00:00:00')
      const endLocal = new Date(endDate + 'T00:00:00')

      const params = new URLSearchParams({
        start_date: localStartOfDayUTC(startLocal),
        end_date: localEndOfDayUTC(endLocal),
        perPage: '5000',
        page: '1',
      })

      const endpoint = `${ORDER_ENDPOINTS.receipts}?${params.toString()}`
      const response = await apiClient.get<any>(endpoint)

      const transformedReceipts = (response.data || []).map(transformReceipt)
      setReceipts(transformedReceipts)
      setSummary(calculateSummary(transformedReceipts))
    } catch (error) {
      toast.error('فشل تحميل بيانات التقرير')
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" side="right" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 print-report" dir="rtl">
          {/* Header */}
          <div className="text-right no-print">
            <h1 className="text-3xl font-bold">التقارير</h1>
            <p className="text-muted-foreground mt-1">
              تقرير الفواتير والمبيعات
            </p>
          </div>

          {/* Print Header - only visible when printing */}
          <div className="hidden print:block text-right mb-4">
            <h1 className="text-2xl font-bold">تقرير الفواتير</h1>
            <p className="text-sm text-gray-600">
              {filters.period === 'today' && 'اليوم'}
              {filters.period === 'yesterday' && 'أمس'}
              {filters.period === 'weekly' && 'هذا الأسبوع'}
              {filters.period === 'monthly' && 'هذا الشهر'}
              {filters.period === 'custom' && `من ${filters.startDate} إلى ${filters.endDate}`}
            </p>
          </div>

          {/* Filters */}
          <ReportFilters filters={filters} onFiltersChange={setFilters} />

          {/* Summary Card */}
          <ReportSummary summary={summary} loading={loading} />

          {/* Receipts Table */}
          <ReportReceiptsTable receipts={receipts} loading={loading} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
