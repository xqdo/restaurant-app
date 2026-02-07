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
import { type WasteReportDto } from '@/lib/types/report.types'
import { UNIT_LABELS } from '@/lib/types/storage.types'

interface WasteReportProps {
  data: WasteReportDto | null
  loading: boolean
}

export function WasteReport({ data, loading }: WasteReportProps) {
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
    return <ReportEmptyState message="لا توجد بيانات هدر أو فاقد في الفترة المحددة" />
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3">
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">إجمالي الهدر</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right text-amber-600">{data.total_waste_qty}</p>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">إجمالي المنتهي</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right text-red-600">{data.total_expired_qty}</p>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">إجمالي الفاقد</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right text-destructive">{data.total_loss}</p>
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
                <TableHead className="text-right">كمية الهدر</TableHead>
                <TableHead className="text-right">عدد حالات الهدر</TableHead>
                <TableHead className="text-right">كمية المنتهي</TableHead>
                <TableHead className="text-right">عدد حالات الانتهاء</TableHead>
                <TableHead className="text-right">إجمالي الفاقد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.item_id}>
                  <TableCell className="font-medium text-right">{item.name}</TableCell>
                  <TableCell className="text-right">
                    {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}
                  </TableCell>
                  <TableCell className="text-right text-amber-600">{item.waste_qty}</TableCell>
                  <TableCell className="text-right">{item.waste_count}</TableCell>
                  <TableCell className="text-right text-red-600">{item.expired_qty}</TableCell>
                  <TableCell className="text-right">{item.expired_count}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">
                    {item.total_loss}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold">
                <TableCell className="text-right" colSpan={2}>المجموع</TableCell>
                <TableCell className="text-right text-amber-600">{data.total_waste_qty}</TableCell>
                <TableCell />
                <TableCell className="text-right text-red-600">{data.total_expired_qty}</TableCell>
                <TableCell />
                <TableCell className="text-right text-destructive">{data.total_loss}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
