'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { type ReportFilters, type DiscountUsageReportDto } from '@/lib/types/report.types'
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
import { IconDiscount } from '@tabler/icons-react'
import { ReportEmptyState } from './report-empty-state'
import { calculateDateRange } from './report-filters'

interface DiscountsUsageTabProps {
  filters: ReportFilters
}

export function DiscountsUsageTab({ filters }: DiscountsUsageTabProps) {
  const [data, setData] = useState<DiscountUsageReportDto | null>(null)
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

      const endpoint = `${REPORTS_ENDPOINTS.discountUsage}?${params.toString()}`
      const response = await apiClient.get<DiscountUsageReportDto>(endpoint)

      setData(response)
    } catch (error) {
      toast.error('فشل تحميل تقرير استخدام الخصومات')
      console.error('Failed to fetch discount usage report:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate effectiveness (revenue vs discount amount)
  const calculateEffectiveness = (discount: any) => {
    if (discount.total_discount_amount === 0) return 0
    return (discount.total_revenue / discount.total_discount_amount) * 100
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>استخدام الخصومات</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : data && data.discounts.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">مرات الاستخدام</TableHead>
                  <TableHead className="text-right">قيمة الخصم</TableHead>
                  <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                  <TableHead className="text-right">متوسط قيمة الطلب</TableHead>
                  <TableHead className="text-right">الفعالية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.discounts.map((discount) => {
                  const effectiveness = calculateEffectiveness(discount)
                  const isHighUsage = discount.times_used > 10

                  return (
                    <TableRow key={discount.discount_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconDiscount className="h-4 w-4 text-muted-foreground" />
                          {discount.code}
                        </div>
                      </TableCell>
                      <TableCell>{discount.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {discount.times_used.toLocaleString('ar-SA')}
                          {isHighUsage && (
                            <Badge variant="default" className="text-xs">
                              شائع
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(discount.total_discount_amount)}
                      </TableCell>
                      <TableCell>{formatCurrency(discount.total_revenue)}</TableCell>
                      <TableCell>
                        {formatCurrency(discount.average_order_value)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={effectiveness > 200 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {effectiveness.toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <ReportEmptyState message="لا توجد بيانات خصومات" />
        )}
      </CardContent>
    </Card>
  )
}
