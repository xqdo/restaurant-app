/**
 * Order Detail Drawer Component
 * Displays full receipt details with items, totals, and discounts
 */

'use client'

import { useEffect, useState } from 'react'
import { IconCheck, IconTag, IconPrinter, IconTruck } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/hooks/use-auth'
import { usePrintReceipt } from '@/hooks/use-print-receipt'
import { apiClient } from '@/lib/api/client'
import { ORDER_ENDPOINTS, DELIVERY_ENDPOINTS } from '@/lib/api/endpoints'
import type { ReceiptDetail } from '@/lib/types/receipt.types'
import { formatDateTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { DeliveryAssignmentForm } from '@/components/delivery-assignment-form'
import { PrintableReceipt } from '@/components/printable-receipt'
import { PrintableOrderTicket } from '@/components/printable-order-ticket'

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
  onUpdate,
}: OrderDetailDrawerProps) {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const { printReceipt, isPrinting, receiptData, printRef, printType } = usePrintReceipt()
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [quickDiscount, setQuickDiscount] = useState<string>('')
  const [deliveryAssignOpen, setDeliveryAssignOpen] = useState(false)
  const [isAssignedToDelivery, setIsAssignedToDelivery] = useState(false)

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
        customer_name: response.customer_name,
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
        discount: response.discount || '0',
        total: response.total || '0',
        notes: response.notes,
        created_by_name: response.baseEntity?.createdByUser?.fullname || 'غير معروف',
        created_at: response.baseEntity?.created_at || '',
        completed_at: response.completed_at,
      }

      setReceipt(transformedReceipt)

      // Check if this delivery order is already assigned
      if (response.is_delivery) {
        await checkDeliveryAssignment(receiptId)
      }
    } catch (error) {
      toast.error('فشل تحميل تفاصيل الطلب')
      console.error('Failed to fetch receipt:', error)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const checkDeliveryAssignment = async (receiptId: number) => {
    try {
      // Check if receipt is already assigned to a delivery driver
      const deliveryReceipts = await apiClient.get<any[]>(DELIVERY_ENDPOINTS.receipts)
      const assigned = deliveryReceipts.some((dr: any) => dr.receipt_id === receiptId)
      setIsAssignedToDelivery(assigned)
    } catch (error) {
      console.error('Failed to check delivery assignment:', error)
      setIsAssignedToDelivery(false)
    }
  }

  const handleDeliveryAssigned = () => {
    // Refresh receipt details and parent list
    fetchReceiptDetail()
    onUpdate?.()
    toast.success('تم تعيين السائق وإكمال الطلب بنجاح')

    // Automatically print receipt after delivery assignment
    if (receiptId) {
      setTimeout(() => {
        printReceipt(receiptId)
      }, 500)
    }
  }

  const canComplete = (): boolean => {
    if (!user || !user.roles) return false
    const allowedRoles = ['Admin', 'Manager', 'Waiter']
    return user.roles.some(role => allowedRoles.includes(role))
  }

  const handleCompleteOrder = async () => {
    if (!receiptId) return

    try {
      setCompleting(true)
      const payload = quickDiscount ? { quick_discount: parseFloat(quickDiscount) } : {}
      await apiClient.put(ORDER_ENDPOINTS.receiptComplete(receiptId), payload)
      toast.success('تم إكمال الطلب وتحرير الطاولة بنجاح')

      // Automatically print receipt after completion
      setTimeout(() => {
        printReceipt(receiptId)
      }, 500)

      fetchReceiptDetail()
      onUpdate?.()
    } catch (error: any) {
      toast.error(error?.message || 'فشل إكمال الطلب')
      console.error('Failed to complete receipt:', error)
    } finally {
      setCompleting(false)
    }
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
            <div className="flex gap-2">
              {receipt && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => printReceipt(receipt.id)}
                  disabled={isPrinting}
                >
                  <IconPrinter className="h-4 w-4 ml-2" />
                  {isPrinting ? 'جاري الطباعة...' : 'طباعة'}
                </Button>
              )}
            </div>
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
                  <DeliveryBadge
                    isDelivery={receipt.is_delivery}
                    hasTable={!!receipt.table}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">رقم الطلب:</p>
                    <p className="font-medium">#{receipt.number}</p>
                  </div>

                  {!receipt.is_delivery && (
                    <div>
                      <p className="text-muted-foreground">الطاولة:</p>
                      <p className="font-medium">
                        {receipt.table?.number ? `طاولة ${receipt.table.number}` : 'سفري'}
                      </p>
                    </div>
                  )}

                  {receipt.is_delivery && (
                    <>
                      <div>
                        <p className="text-muted-foreground">اسم العميل:</p>
                        <p className="font-medium">{receipt.customer_name || '-'}</p>
                      </div>
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
                  discount={receipt.discount || '0'}
                  total={receipt.total || '0'}
                />
              </div>

              {/* Quick Discount Input (only for non-completed orders) */}
              {!receipt.completed_at && canComplete() && (
                <div className="border rounded-lg p-4">
                  <Label htmlFor="quick-discount" className="text-sm font-medium mb-2 block">
                    خصم سريع (اختياري)
                  </Label>
                  <Input
                    id="quick-discount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={quickDiscount}
                    onChange={(e) => setQuickDiscount(e.target.value)}
                    className="text-right"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    أدخل مبلغ الخصم الذي سيتم خصمه من الإجمالي
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DrawerFooter>
          {receipt && !receipt.completed_at && !isAssignedToDelivery && (
            <>
              {receipt.is_delivery && canComplete() && (
                <Button
                  onClick={() => setDeliveryAssignOpen(true)}
                  disabled={completing}
                  className="w-full"
                >
                  <IconTruck className="h-4 w-4 ml-2" />
                  تعيين سائق توصيل
                </Button>
              )}
              {!receipt.is_delivery && canComplete() && (
                <Button
                  onClick={handleCompleteOrder}
                  disabled={completing}
                  className="w-full"
                >
                  <IconCheck className="h-4 w-4 ml-2" />
                  {completing ? 'جاري الإكمال...' : 'إكمال الطلب وتحرير الطاولة'}
                </Button>
              )}
            </>
          )}
          {receipt && (receipt.completed_at || isAssignedToDelivery) && (
            <div className="text-center text-sm text-green-600 font-medium py-2">
              {receipt.is_delivery && isAssignedToDelivery
                ? 'تم تعيين سائق التوصيل وإكمال الطلب'
                : 'تم إكمال هذا الطلب'}
            </div>
          )}
          <DrawerClose asChild>
            <Button variant="outline">إغلاق</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>

      {receiptId && (
        <DeliveryAssignmentForm
          open={deliveryAssignOpen}
          onOpenChange={setDeliveryAssignOpen}
          onSuccess={handleDeliveryAssigned}
          preselectedReceiptId={receiptId}
        />
      )}

      {/* Hidden printable receipt for printing */}
      <div className="hidden">
        <div ref={printRef}>
          {receiptData && printType === 'order' && <PrintableOrderTicket receipt={receiptData} />}
          {receiptData && printType === 'final' && <PrintableReceipt receipt={receiptData} />}
        </div>
      </div>
    </Drawer>
  )
}
