/**
 * Receipts Table Component
 * Displays list of receipts/orders in a table format
 */

'use client'

import { IconEye } from '@tabler/icons-react'
import type { ReceiptListItem } from '@/lib/types/receipt.types'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeliveryBadge } from '@/components/delivery-badge'
import { OrderStatusBadge } from '@/components/order-status-badge'

interface ReceiptsTableProps {
  receipts: ReceiptListItem[]
  loading: boolean
  onViewDetails: (receiptId: number) => void
}

export function ReceiptsTable({
  receipts,
  loading,
  onViewDetails,
}: ReceiptsTableProps) {
  console.log('ReceiptsTable - receipts:', receipts)
  console.log('ReceiptsTable - loading:', loading)
  console.log('ReceiptsTable - receipts.length:', receipts?.length)

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (!receipts || receipts.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">لا توجد طلبات</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم الطلب</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">الطاولة</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">الموظف</TableHead>
            <TableHead className="text-right">عدد الأصناف</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow
              key={receipt.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => onViewDetails(receipt.id)}
            >
              <TableCell className="font-medium">
                #{receipt.number || receipt.id}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={receipt.order_status} />
              </TableCell>
              <TableCell>
                <DeliveryBadge
                  isDelivery={receipt.is_delivery || false}
                  hasTable={!!receipt.table}
                />
              </TableCell>
              <TableCell>
                {receipt.is_delivery
                  ? '-'
                  : receipt.table?.number
                    ? `طاولة ${receipt.table.number}`
                    : 'سفري'}
              </TableCell>
              <TableCell className="text-sm">
                {receipt.created_at ? formatDateTime(receipt.created_at) : '-'}
              </TableCell>
              <TableCell>{receipt.created_by_name || '-'}</TableCell>
              <TableCell>{receipt.item_count || 0}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails(receipt.id)
                  }}
                >
                  <IconEye className="h-4 w-4" />
                  <span className="hidden sm:inline">عرض</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
