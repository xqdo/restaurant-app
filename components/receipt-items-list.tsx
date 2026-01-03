/**
 * Receipt Items List Component
 * Displays receipt items in a table format with status badges
 */

import type { ReceiptItemDetail } from '@/lib/types/receipt.types'
import { formatCurrency } from '@/lib/utils/currency'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ItemStatusBadge } from '@/components/item-status-badge'

interface ReceiptItemsListProps {
  items: ReceiptItemDetail[]
}

export function ReceiptItemsList({ items }: ReceiptItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        لا توجد أصناف في هذا الطلب
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الصنف</TableHead>
            <TableHead className="text-right">الكمية</TableHead>
            <TableHead className="text-right">السعر</TableHead>
            <TableHead className="text-right">المجموع</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">ملاحظات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.item_name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatCurrency(item.unit_price)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(item.subtotal)}
              </TableCell>
              <TableCell>
                <ItemStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.notes || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
