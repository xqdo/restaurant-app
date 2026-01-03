'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { IconCash } from '@tabler/icons-react'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { type ReportFilters, type RevenueBySectionReportDto } from '@/lib/types/report.types'
import { formatCurrency } from '@/lib/utils/currency'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiCard } from './kpi-card'
import { RevenuePieChart } from './revenue-pie-chart'
import { calculateDateRange } from './report-filters'

interface RevenueBreakdownTabProps {
  filters: ReportFilters
}

export function RevenueBreakdownTab({ filters }: RevenueBreakdownTabProps) {
  const [data, setData] = useState<RevenueBySectionReportDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams()

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

      const endpoint = `${REPORTS_ENDPOINTS.revenueBySection}?${params.toString()}`
      const response = await apiClient.get<RevenueBySectionReportDto>(endpoint)

      setData(response)
    } catch (error) {
      toast.error('فشل تحميل تقرير الإيرادات')
      console.error('Failed to fetch revenue report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Total Revenue KPI */}
      <KpiCard
        title="إجمالي الإيرادات"
        value={loading ? '...' : formatCurrency(data?.total_revenue || 0)}
        icon={<IconCash className="h-4 w-4" />}
        loading={loading}
      />

      {/* Revenue Pie Chart */}
      <RevenuePieChart data={data?.sections} loading={loading} />

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الإيرادات حسب القسم</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : data && data.sections.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">عدد الأصناف</TableHead>
                    <TableHead className="text-right">الكمية الإجمالية</TableHead>
                    <TableHead className="text-right">الإيرادات</TableHead>
                    <TableHead className="text-right">النسبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sections.map((section) => (
                    <TableRow key={section.section_id}>
                      <TableCell className="font-medium">
                        {section.section_name}
                      </TableCell>
                      <TableCell>
                        {section.items_count.toLocaleString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        {section.total_quantity.toLocaleString('ar-SA')}
                      </TableCell>
                      <TableCell>{formatCurrency(section.total_revenue)}</TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {section.revenue_percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              لا توجد بيانات للفترة المحددة
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
