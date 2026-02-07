'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportEmptyState } from './report-empty-state'
import { formatCurrency } from '@/lib/utils/currency'
import { type VendorPerformanceReportDto } from '@/lib/types/report.types'

interface VendorPerformanceReportProps {
  data: VendorPerformanceReportDto | null
  loading: boolean
}

export function VendorPerformanceReport({ data, loading }: VendorPerformanceReportProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Card>
          <CardContent className="pt-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data || data.vendors.length === 0) {
    return <ReportEmptyState message="لا توجد بيانات موردين في الفترة المحددة" />
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="print:shadow-none print:border-gray-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground text-right">إجمالي التكلفة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-right">{formatCurrency(data.grand_total)}</p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="print:shadow-none print:border-gray-300">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">إجمالي الكمية</TableHead>
                <TableHead className="text-right">إجمالي التكلفة</TableHead>
                <TableHead className="text-right">عدد المواد</TableHead>
                <TableHead className="text-right">عدد التوريدات</TableHead>
                <TableHead className="text-right">متوسط التكلفة/توريد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.vendors.map((vendor) => (
                <TableRow key={vendor.vendor_id}>
                  <TableCell className="font-medium text-right">{vendor.name}</TableCell>
                  <TableCell className="text-right">{vendor.phone || '-'}</TableCell>
                  <TableCell className="text-right">{vendor.total_quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(vendor.total_cost)}</TableCell>
                  <TableCell className="text-right">{vendor.unique_items_count}</TableCell>
                  <TableCell className="text-right">{vendor.entries_count}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(vendor.average_cost_per_entry)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold">
                <TableCell className="text-right" colSpan={3}>المجموع</TableCell>
                <TableCell className="text-right">{formatCurrency(data.grand_total)}</TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
