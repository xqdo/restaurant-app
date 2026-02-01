'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { type ReportFilters, type StaffPerformanceReportDto } from '@/lib/types/report.types'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { IconTrophy } from '@tabler/icons-react'
import { ReportEmptyState } from './report-empty-state'
import { calculateDateRange } from './report-filters'

interface StaffPerformanceTabProps {
  filters: ReportFilters
}

export function StaffPerformanceTab({ filters }: StaffPerformanceTabProps) {
  const [data, setData] = useState<StaffPerformanceReportDto | null>(null)
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

      const endpoint = `${REPORTS_ENDPOINTS.staffPerformance}?${params.toString()}`
      const response = await apiClient.get<StaffPerformanceReportDto>(endpoint)

      setData(response)
    } catch (error) {
      toast.error('فشل تحميل تقرير أداء الموظفين')
      console.error('Failed to fetch staff performance report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>أداء الموظفين</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : data && data.staff.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">عدد الطلبات</TableHead>
                  <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                  <TableHead className="text-right">متوسط قيمة الطلب</TableHead>
                  <TableHead className="text-right">الأدوار</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.staff.map((staff, index) => (
                  <TableRow key={staff.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <IconTrophy className="h-4 w-4 text-yellow-500" />
                        )}
                        {staff.fullname}
                      </div>
                    </TableCell>
                    <TableCell>{staff.orders_count.toLocaleString('ar-EN')}</TableCell>
                    <TableCell>{formatCurrency(staff.total_revenue)}</TableCell>
                    <TableCell>{formatCurrency(staff.average_order_value)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {staff.roles?.map((role, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <ReportEmptyState message="لا توجد بيانات موظفين" />
        )}
      </CardContent>
    </Card>
  )
}
