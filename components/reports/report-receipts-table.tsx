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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime } from '@/lib/utils/date'
import { ReportEmptyState } from './report-empty-state'
import type { ReceiptListItem } from '@/lib/types/receipt.types'

interface ReportReceiptsTableProps {
  receipts: ReceiptListItem[]
  loading: boolean
}

function getOrderTypeLabel(receipt: ReceiptListItem): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  if (receipt.is_delivery) return { label: 'توصيل', variant: 'default' }
  if (receipt.table) return { label: 'محلي', variant: 'secondary' }
  return { label: 'سفري', variant: 'outline' }
}

export function ReportReceiptsTable({ receipts, loading }: ReportReceiptsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">الفواتير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (receipts.length === 0) {
    return (
      <ReportEmptyState
        message="لا توجد فواتير للفترة المحددة"
        description="جرب تغيير الفترة الزمنية"
      />
    )
  }

  const grandTotal = receipts.reduce((sum, r) => sum + parseFloat(r.total), 0)

  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader>
        <CardTitle className="text-right">الفواتير ({receipts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم الفاتورة</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">الطاولة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الموظف</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">عدد الأصناف</TableHead>
              <TableHead className="text-right">المجموع</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => {
              const orderType = getOrderTypeLabel(receipt)
              const isPaid = receipt.order_status === 'completed'

              return (
                <TableRow key={receipt.id}>
                  <TableCell className="text-right font-medium">#{receipt.number}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={orderType.variant}>{orderType.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {receipt.table ? `طاولة ${receipt.table.number}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={isPaid ? 'success' : 'destructive'}>
                      {isPaid ? 'مدفوع' : 'غير مدفوع'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{receipt.created_by_name}</TableCell>
                  <TableCell className="text-right">{formatDateTime(receipt.created_at)}</TableCell>
                  <TableCell className="text-right">{receipt.item_count}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(receipt.total)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold">
              <TableCell colSpan={7} className="text-right">المجموع الكلي</TableCell>
              <TableCell className="text-right">{formatCurrency(grandTotal)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
