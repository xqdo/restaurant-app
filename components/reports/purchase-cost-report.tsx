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
import { type PurchaseCostReportDto } from '@/lib/types/report.types'
import { UNIT_LABELS } from '@/lib/types/storage.types'

interface PurchaseCostReportProps {
  data: PurchaseCostReportDto | null
  loading: boolean
}

export function PurchaseCostReport({ data, loading }: PurchaseCostReportProps) {
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

  if (!data || data.items.length === 0) {
    return <ReportEmptyState message="لا توجد مشتريات في الفترة المحددة" />
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
                <TableHead className="text-right">المادة</TableHead>
                <TableHead className="text-right">الوحدة</TableHead>
                <TableHead className="text-right">الكمية المشتراة</TableHead>
                <TableHead className="text-right">إجمالي التكلفة</TableHead>
                <TableHead className="text-right">متوسط سعر الوحدة</TableHead>
                <TableHead className="text-right">عدد الطلبات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.item_id}>
                  <TableCell className="font-medium text-right">{item.name}</TableCell>
                  <TableCell className="text-right">
                    {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}
                  </TableCell>
                  <TableCell className="text-right">{item.total_quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total_cost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.average_unit_cost)}</TableCell>
                  <TableCell className="text-right">{item.entries_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold">
                <TableCell className="text-right" colSpan={3}>المجموع</TableCell>
                <TableCell className="text-right">{formatCurrency(data.grand_total)}</TableCell>
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
