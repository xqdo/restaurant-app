'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  IconCash,
  IconReceipt,
  IconChartLine,
  IconTrendingUp,
} from '@tabler/icons-react'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { type ReportFilters, type PeriodSalesReportDto } from '@/lib/types/report.types'
import { formatCurrency } from '@/lib/utils/currency'
import { KpiCard } from './kpi-card'
import { SalesTrendChart } from './sales-trend-chart'
import { calculateDateRange } from './report-filters'

interface SalesOverviewTabProps {
  filters: ReportFilters
}

export function SalesOverviewTab({ filters }: SalesOverviewTabProps) {
  const [data, setData] = useState<PeriodSalesReportDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams()

      // Calculate dates based on period
      if (filters.period === 'custom' && filters.startDate && filters.endDate) {
        params.append('start', filters.startDate)
        params.append('end', filters.endDate)
      } else if (filters.period !== 'custom') {
        const { startDate, endDate } = calculateDateRange(filters.period)
        params.append('start', startDate)
        params.append('end', endDate)
        params.append('period', filters.period)
      }

      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const endpoint = `${REPORTS_ENDPOINTS.salesPeriod}?${params.toString()}`
      const response = await apiClient.get<PeriodSalesReportDto>(endpoint)

      setData(response)
    } catch (error) {
      toast.error('فشل تحميل تقرير المبيعات')
      console.error('Failed to fetch sales report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="إجمالي الإيرادات"
          value={loading ? '...' : formatCurrency(data?.total_revenue || 0)}
          icon={<IconCash className="h-4 w-4" />}
          trend={
            data?.growth_percentage
              ? {
                  value: data.growth_percentage,
                  direction: data.growth_percentage >= 0 ? 'up' : 'down',
                }
              : undefined
          }
          loading={loading}
        />

        <KpiCard
          title="إجمالي الطلبات"
          value={loading ? '...' : (data?.total_receipts || 0).toLocaleString('ar-EN')}
          icon={<IconReceipt className="h-4 w-4" />}
          loading={loading}
        />

        <KpiCard
          title="متوسط قيمة الطلب"
          value={
            loading ? '...' : formatCurrency(data?.average_order_value || 0)
          }
          icon={<IconChartLine className="h-4 w-4" />}
          loading={loading}
        />

        <KpiCard
          title="النمو"
          value={
            loading
              ? '...'
              : `${(data?.growth_percentage || 0).toFixed(1)}%`
          }
          icon={<IconTrendingUp className="h-4 w-4" />}
          trend={
            data?.growth_percentage
              ? {
                  value: data.growth_percentage,
                  direction: data.growth_percentage >= 0 ? 'up' : 'down',
                }
              : undefined
          }
          loading={loading}
        />
      </div>

      {/* Sales Trend Chart */}
      <SalesTrendChart data={data?.daily_breakdown} loading={loading} />

      {/* Additional Metrics */}
      {!loading && data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <KpiCard
            title="طلبات محلية (Dine-in)"
            value={(data.dine_in_orders || 0).toLocaleString('ar-EN')}
            icon={<IconReceipt className="h-4 w-4" />}
          />

          <KpiCard
            title="طلبات توصيل (Delivery)"
            value={(data.delivery_orders || 0).toLocaleString('ar-EN')}
            icon={<IconReceipt className="h-4 w-4" />}
          />
        </div>
      )}
    </div>
  )
}
