/**
 * Discounts Table Component
 * Displays list of discounts in a table format with actions
 */

'use client'

import { useState } from 'react'
import { IconEdit, IconTrash, IconToggleLeft, IconToggleRight } from '@tabler/icons-react'
import type { Discount } from '@/lib/types/discount.types'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DiscountTypeBadge } from '@/components/discount-type-badge'
import { DiscountStatusBadge } from '@/components/discount-status-badge'

interface DiscountsTableProps {
  discounts: Discount[]
  loading: boolean
  onEdit: (discount: Discount) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number) => void
}

export function DiscountsTable({
  discounts,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}: DiscountsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [discountToDelete, setDiscountToDelete] = useState<number | null>(null)

  const handleDeleteClick = (id: number) => {
    setDiscountToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (discountToDelete) {
      onDelete(discountToDelete)
      setDeleteDialogOpen(false)
      setDiscountToDelete(null)
    }
  }

  const formatValue = (discount: Discount) => {
    if (discount.type === 'amount') {
      return formatCurrency(discount.amount || '0')
    }
    if (discount.type === 'percentage') {
      return `${discount.persentage}%`
    }
    return 'عرض مجموعة'
  }

  const formatUsage = (discount: Discount) => {
    if (discount.max_receipts) {
      return `${discount.usage_count} / ${discount.max_receipts}`
    }
    return `${discount.usage_count} / ∞`
  }

  const formatPeriod = (discount: Discount) => {
    const start = new Date(discount.start_date).toLocaleDateString('ar-EG')
    const end = new Date(discount.end_date).toLocaleDateString('ar-EG')
    return `${start} - ${end}`
  }

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

  if (discounts.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">لا توجد خصومات</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الكود</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">القيمة</TableHead>
              <TableHead className="text-right">الفترة</TableHead>
              <TableHead className="text-right">الاستخدام</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-mono font-bold">
                  {discount.code}
                </TableCell>
                <TableCell>{discount.name}</TableCell>
                <TableCell>
                  <DiscountTypeBadge type={discount.type} />
                </TableCell>
                <TableCell className="font-medium">
                  {formatValue(discount)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatPeriod(discount)}
                </TableCell>
                <TableCell>{formatUsage(discount)}</TableCell>
                <TableCell>
                  <DiscountStatusBadge discount={discount} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(discount)}
                      title="تعديل"
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleActive(discount.id)}
                      title={discount.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                    >
                      {discount.is_active ? (
                        <IconToggleRight className="h-4 w-4" />
                      ) : (
                        <IconToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(discount.id)}
                      title="حذف"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الخصم؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
