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
import { type StockMovementReportDto } from '@/lib/types/report.types'
import { UNIT_LABELS } from '@/lib/types/storage.types'

interface StockMovementReportProps {
  data: StockMovementReportDto | null
  loading: boolean
}

export function StockMovementReport({ data, loading }: StockMovementReportProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
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

  if (!data || data.items.length === 0) {
    return <ReportEmptyState message="لا توجد حركات مخزون في الفترة المحددة" />
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3">
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">مواد متحركة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right">{data.items.length}</p>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">إجمالي الوارد</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right text-emerald-600">{data.total_received}</p>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">إجمالي الصادر</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right text-red-600">{data.total_consumed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="print:shadow-none print:border-gray-300">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المادة</TableHead>
                <TableHead className="text-right">الوحدة</TableHead>
                <TableHead className="text-right">الوارد</TableHead>
                <TableHead className="text-right">عدد الإدخالات</TableHead>
                <TableHead className="text-right">الصادر</TableHead>
                <TableHead className="text-right">عدد عمليات الصرف</TableHead>
                <TableHead className="text-right">صافي التغيير</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.item_id}>
                  <TableCell className="font-medium text-right">{item.name}</TableCell>
                  <TableCell className="text-right">
                    {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600">
                    {item.total_entries_qty}
                  </TableCell>
                  <TableCell className="text-right">{item.entries_count}</TableCell>
                  <TableCell className="text-right text-red-600">
                    {item.total_usages_qty}
                  </TableCell>
                  <TableCell className="text-right">{item.usages_count}</TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      item.net_change > 0
                        ? 'text-emerald-600'
                        : item.net_change < 0
                          ? 'text-red-600'
                          : ''
                    }`}
                  >
                    {item.net_change > 0 ? '+' : ''}{item.net_change}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold">
                <TableCell className="text-right">المجموع</TableCell>
                <TableCell />
                <TableCell className="text-right text-emerald-600">{data.total_received}</TableCell>
                <TableCell />
                <TableCell className="text-right text-red-600">{data.total_consumed}</TableCell>
                <TableCell />
                <TableCell
                  className={`text-right ${
                    data.total_received - data.total_consumed > 0
                      ? 'text-emerald-600'
                      : data.total_received - data.total_consumed < 0
                        ? 'text-red-600'
                        : ''
                  }`}
                >
                  {data.total_received - data.total_consumed > 0 ? '+' : ''}
                  {parseFloat((data.total_received - data.total_consumed).toFixed(2))}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
