'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { type ReportFilters, type TableTurnoverReportDto } from '@/lib/types/report.types'
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
import { Badge } from '@/components/ui/badge'
import { ReportEmptyState } from './report-empty-state'
import { calculateDateRange } from './report-filters'

interface TablesTurnoverTabProps {
  filters: ReportFilters
}

export function TablesTurnoverTab({ filters }: TablesTurnoverTabProps) {
  const [data, setData] = useState<TableTurnoverReportDto | null>(null)
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

      const endpoint = `${REPORTS_ENDPOINTS.tableTurnover}?${params.toString()}`
      const response = await apiClient.get<TableTurnoverReportDto>(endpoint)

      setData(response)
    } catch (error) {
      toast.error('فشل تحميل تقرير دوران الطاولات')
      console.error('Failed to fetch table turnover report:', error)
    } finally {
      setLoading(false)
    }
  }

  // Find most and least used tables
  const mostUsed = data?.tables.reduce((prev, current) =>
    current.orders_count > prev.orders_count ? current : prev
  )
  const leastUsed = data?.tables.reduce((prev, current) =>
    current.orders_count < prev.orders_count ? current : prev
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>دوران الطاولات</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : data && data.tables.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطاولة</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">عدد الطلبات</TableHead>
                  <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                  <TableHead className="text-right">متوسط قيمة الطلب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tables.map((table) => {
                  const isMostUsed = mostUsed?.table_id === table.table_id
                  const isLeastUsed = leastUsed?.table_id === table.table_id && data.tables.length > 1

                  return (
                    <TableRow key={table.table_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {table.table_number}
                          {isMostUsed && (
                            <Badge variant="default" className="text-xs">
                              الأكثر استخداماً
                            </Badge>
                          )}
                          {isLeastUsed && (
                            <Badge variant="secondary" className="text-xs">
                              الأقل استخداماً
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{table.section_name || '-'}</TableCell>
                      <TableCell>{table.orders_count.toLocaleString('ar-SA')}</TableCell>
                      <TableCell>{formatCurrency(table.total_revenue)}</TableCell>
                      <TableCell>
                        {formatCurrency(table.average_order_value)}
                      </TableCell>
                      <TableCell>
                        {table.orders_count > 0 ? (
                          <Badge variant="default">نشط</Badge>
                        ) : (
                          <Badge variant="secondary">غير مستخدم</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <ReportEmptyState message="لا توجد بيانات طاولات" />
        )}
      </CardContent>
    </Card>
  )
}
