/**
 * Order Detail Drawer Component
 * Displays full receipt details with items, totals, and discounts
 */

'use client'

import { useEffect, useState } from 'react'
import { IconTag } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api/client'
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints'
import type { ReceiptDetail } from '@/lib/types/receipt.types'
import { formatDateTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'
import { DeliveryBadge } from '@/components/delivery-badge'
import { ReceiptItemsList } from '@/components/receipt-items-list'
import { ReceiptTotals } from '@/components/receipt-totals'
import { ApplyDiscountDialog } from '@/components/apply-discount-dialog'

interface OrderDetailDrawerProps {
  receiptId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void | Promise<void>
}

export function OrderDetailDrawer({
  receiptId,
  open,
  onOpenChange,
}: OrderDetailDrawerProps) {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [applyDiscountOpen, setApplyDiscountOpen] = useState(false)

  // Fetch receipt details when drawer opens
  useEffect(() => {
    if (open && receiptId) {
      fetchReceiptDetail()
    }
  }, [open, receiptId])

  // Clear state when drawer closes
  useEffect(() => {
    if (!open) {
      setReceipt(null)
      setLoading(true)
    }
  }, [open])

  const fetchReceiptDetail = async () => {
    if (!receiptId) return

    try {
      setLoading(true)
      const response = await apiClient.get<any>(
        ORDER_ENDPOINTS.receiptById(receiptId)
      )
      console.log('Receipt detail response:', response)

      // Transform backend response to match ReceiptDetail interface
      const transformedReceipt: ReceiptDetail = {
        id: response.id,
        number: response.number,
        is_delivery: response.is_delivery,
        phone_number: response.phone_number,
        location: response.location,
        table: response.table,
        items: (response.receiptItems || []).map((item: any) => ({
          id: item.id,
          item_id: item.item_id,
          item_name: item.item?.name || 'غير معروف',
          quantity: parseInt(item.quantity) || 1,
          unit_price: item.unit_price || '0',
          subtotal: item.subtotal || '0',
          status: item.status,
          notes: item.notes,
        })),
        subtotal: response.subtotal || '0',
        discount_amount: response.discount_amount || '0',
        total: response.total || '0',
        applied_discounts: response.applied_discounts || [],
        notes: response.notes,
        created_by_name: response.baseEntity?.createdByUser?.fullname || 'غير معروف',
        created_at: response.baseEntity?.created_at || '',
        completed_at: response.completed_at,
      }

      setReceipt(transformedReceipt)
    } catch (error) {
      toast.error('فشل تحميل تفاصيل الطلب')
      console.error('Failed to fetch receipt:', error)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const canApplyDiscount = (): boolean => {
    if (!user || !user.roles) return false
    const allowedRoles = ['Admin', 'Manager', 'Cashier', 'Waiter']
    return user.roles.some(role => allowedRoles.includes(role))
  }

  const handleDiscountApplied = () => {
    // Refresh receipt details to show updated discount
    fetchReceiptDetail()
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? 'bottom' : 'left'}
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DrawerTitle>
                {receipt ? `طلب رقم #${receipt.number}` : 'تفاصيل الطلب'}
              </DrawerTitle>
              <DrawerDescription>
                {receipt && `تم الإنشاء: ${formatDateTime(receipt.created_at)}`}
              </DrawerDescription>
            </div>
            {receipt && !receipt.completed_at && canApplyDiscount() && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setApplyDiscountOpen(true)}
              >
                <IconTag className="h-4 w-4 ml-2" />
                تطبيق خصم
              </Button>
            )}
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 max-h-[70vh]">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          )}

          {!loading && receipt && (
            <>
              {/* Receipt Info */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">معلومات الطلب</h3>
                  <DeliveryBadge isDelivery={receipt.is_delivery} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">رقم الطلب:</p>
                    <p className="font-medium">#{receipt.number}</p>
                  </div>

                  {receipt.table && (
                    <div>
                      <p className="text-muted-foreground">الطاولة:</p>
                      <p className="font-medium">طاولة {receipt.table.number}</p>
                    </div>
                  )}

                  {receipt.is_delivery && (
                    <>
                      <div>
                        <p className="text-muted-foreground">رقم الهاتف:</p>
                        <p className="font-medium">{receipt.phone_number || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">العنوان:</p>
                        <p className="font-medium">{receipt.location || '-'}</p>
                      </div>
                    </>
                  )}

                  <div>
                    <p className="text-muted-foreground">الموظف:</p>
                    <p className="font-medium">{receipt.created_by_name}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">التاريخ:</p>
                    <p className="font-medium">
                      {formatDateTime(receipt.created_at)}
                    </p>
                  </div>

                  {receipt.completed_at && (
                    <div>
                      <p className="text-muted-foreground">تاريخ الإكمال:</p>
                      <p className="font-medium">
                        {formatDateTime(receipt.completed_at)}
                      </p>
                    </div>
                  )}
                </div>

                {receipt.notes && (
                  <div className="border-t pt-3">
                    <p className="text-muted-foreground text-sm">ملاحظات:</p>
                    <p className="mt-1">{receipt.notes}</p>
                  </div>
                )}
              </div>

              {/* Items List */}
              {receipt.items && receipt.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">الأصناف ({receipt.items.length})</h3>
                  <ReceiptItemsList items={receipt.items} />
                </div>
              )}

              {/* Totals */}
              <div>
                <h3 className="font-semibold mb-3">الإجمالي</h3>
                <ReceiptTotals
                  subtotal={receipt.subtotal || '0'}
                  discountAmount={receipt.discount_amount || '0'}
                  total={receipt.total || '0'}
                  appliedDiscounts={receipt.applied_discounts || []}
                />
              </div>
            </>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">إغلاق</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>

      {receiptId && (
        <ApplyDiscountDialog
          receiptId={receiptId}
          open={applyDiscountOpen}
          onOpenChange={setApplyDiscountOpen}
          onSuccess={handleDiscountApplied}
        />
      )}
    </Drawer>
  )
}
