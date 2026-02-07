'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ReportEmptyState } from './report-empty-state'
import { type InventoryStatusReportDto } from '@/lib/types/report.types'
import { UNIT_LABELS } from '@/lib/types/storage.types'

interface InventoryStatusReportProps {
  data: InventoryStatusReportDto | null
  loading: boolean
}

const STATUS_CONFIG = {
  ok: { label: 'متوفر', variant: 'success' as const },
  low: { label: 'منخفض', variant: 'warning' as const },
  out: { label: 'نفذ', variant: 'destructive' as const },
}

export function InventoryStatusReport({ data, loading }: InventoryStatusReportProps) {
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
    return <ReportEmptyState message="لا توجد مواد في المخزون" />
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3">
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">إجمالي المواد</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right">{data.total_items}</p>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">مخزون منخفض</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right text-amber-600">{data.low_stock_count}</p>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground text-right">نفذ من المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-right text-destructive">{data.out_of_stock_count}</p>
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
                <TableHead className="text-right">الكمية الحالية</TableHead>
                <TableHead className="text-right">الحد الأدنى</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">المورد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => {
                const config = STATUS_CONFIG[item.status]
                return (
                  <TableRow key={item.item_id}>
                    <TableCell className="font-medium text-right">{item.name}</TableCell>
                    <TableCell className="text-right">
                      {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] || item.unit}
                    </TableCell>
                    <TableCell className="text-right">{item.current_quantity}</TableCell>
                    <TableCell className="text-right">
                      {item.min_quantity != null ? item.min_quantity : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.vendor_name || '-'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
