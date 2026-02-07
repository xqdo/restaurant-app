'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { IconX, IconTruck, IconUser } from '@tabler/icons-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient } from '@/lib/api/client'
import { DELIVERY_ENDPOINTS, ORDER_ENDPOINTS } from '@/lib/api/endpoints'
import type { DeliveryGuy, AssignDeliveryDto } from '@/lib/types/delivery.types'
import type { ReceiptListItem } from '@/lib/types/receipt.types'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime } from '@/lib/utils/date'

interface DeliveryAssignmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  preselectedReceiptId?: number | null
}

export function DeliveryAssignmentForm({
  open,
  onOpenChange,
  onSuccess,
  preselectedReceiptId,
}: DeliveryAssignmentFormProps) {
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [drivers, setDrivers] = useState<DeliveryGuy[]>([])
  const [unassignedReceipts, setUnassignedReceipts] = useState<
    ReceiptListItem[]
  >([])
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>('')
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  useEffect(() => {
    if (preselectedReceiptId) {
      setSelectedReceiptId(preselectedReceiptId.toString())
    }
  }, [preselectedReceiptId])

  const loadData = async () => {
    setLoadingData(true)
    try {
      // Fetch active drivers
      const driversData = await apiClient.get<DeliveryGuy[]>(
        DELIVERY_ENDPOINTS.drivers
      )
      setDrivers(driversData.filter((d) => !d.isdeleted))

      // Fetch unassigned delivery receipts
      const receiptsResponse = await apiClient.get<any>(
        `${ORDER_ENDPOINTS.receipts}?is_delivery=true&completed=false&perPage=100`
      )

      // Handle both array and paginated response formats
      const receiptsData = Array.isArray(receiptsResponse)
        ? receiptsResponse
        : (receiptsResponse.data || [])

      // Filter out already assigned receipts
      const deliveryReceipts = await apiClient.get<any[]>(DELIVERY_ENDPOINTS.receipts)
      const assignedReceiptIds = new Set(
        Array.isArray(deliveryReceipts)
          ? deliveryReceipts.map((dr: any) => dr.receipt_id)
          : []
      )

      const unassigned = receiptsData.filter(
        (receipt: any) => !assignedReceiptIds.has(receipt.id)
      )

      setUnassignedReceipts(unassigned)
    } catch (error) {
      toast.error('فشل تحميل البيانات')
      console.error('Error loading data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReceiptId || !selectedDriverId) {
      toast.error('الرجاء اختيار الطلب والسائق')
      return
    }

    setLoading(true)
    try {
      const data: AssignDeliveryDto = {
        receipt_id: parseInt(selectedReceiptId, 10),
        delivery_guy_id: parseInt(selectedDriverId, 10),
      }

      await apiClient.post(DELIVERY_ENDPOINTS.assign, data)

      // Reset form first
      setSelectedReceiptId('')
      setSelectedDriverId('')

      // Close drawer
      onOpenChange(false)

      // Call success callback (this will refresh data and show toast)
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'فشل تعيين السائق'
      )
    } finally {
      setLoading(false)
    }
  }

  const selectedReceipt = Array.isArray(unassignedReceipts)
    ? unassignedReceipts.find((r) => r.id.toString() === selectedReceiptId)
    : null

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? 'bottom' : 'left'}
    >
      <DrawerContent>
        <DrawerHeader className="text-right">
          <DrawerTitle>تعيين سائق للتوصيل</DrawerTitle>
          <DrawerDescription>
            اختر طلب التوصيل والسائق المسؤول عنه
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} dir="rtl">
          <div className="px-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Receipt Selection */}
            <div className="space-y-2 text-right">
              <Label htmlFor="receipt">
                <IconTruck className="inline mr-1 h-4 w-4" />
                طلب التوصيل *
              </Label>
              <Select
                value={selectedReceiptId}
                onValueChange={setSelectedReceiptId}
                disabled={loadingData || loading || !!preselectedReceiptId}
              >
                <SelectTrigger id="receipt">
                  <SelectValue placeholder="اختر طلب التوصيل" />
                </SelectTrigger>
                <SelectContent>
                  {loadingData ? (
                    <SelectItem value="loading" disabled>
                      جاري التحميل...
                    </SelectItem>
                  ) : unassignedReceipts.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      لا توجد طلبات توصيل متاحة
                    </SelectItem>
                  ) : (
                    unassignedReceipts.map((receipt) => (
                      <SelectItem key={receipt.id} value={receipt.id.toString()}>
                        طلب #{receipt.id} - {formatCurrency(receipt.total)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {preselectedReceiptId && (
                <p className="text-xs text-muted-foreground text-right">
                  الطلب محدد مسبقاً
                </p>
              )}
            </div>

            {/* Selected Receipt Details */}
            {selectedReceipt && (
              <div className="p-3 border rounded-lg bg-muted/50 space-y-2 text-right">
                <h4 className="font-semibold text-sm">تفاصيل الطلب:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">رقم الهاتف:</span>{' '}
                    {selectedReceipt.phone_number || 'غير متوفر'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">العنوان:</span>{' '}
                    {selectedReceipt.location || 'غير متوفر'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">المبلغ:</span>{' '}
                    {formatCurrency(selectedReceipt.total)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">الوقت:</span>{' '}
                    {formatDateTime(selectedReceipt.created_at)}
                  </p>
                </div>
              </div>
            )}

            {/* Driver Selection */}
            <div className="space-y-2 text-right">
              <Label htmlFor="driver">
                <IconUser className="inline mr-1 h-4 w-4" />
                السائق *
              </Label>
              <Select
                value={selectedDriverId}
                onValueChange={setSelectedDriverId}
                disabled={loadingData || loading}
              >
                <SelectTrigger id="driver">
                  <SelectValue placeholder="اختر السائق" />
                </SelectTrigger>
                <SelectContent>
                  {loadingData ? (
                    <SelectItem value="loading" disabled>
                      جاري التحميل...
                    </SelectItem>
                  ) : drivers.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      لا يوجد سائقين متاحين
                    </SelectItem>
                  ) : (
                    drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.name} - {driver.phone_number}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DrawerFooter>
            <Button
              type="submit"
              disabled={
                loading ||
                loadingData ||
                !selectedReceiptId ||
                !selectedDriverId
              }
              className="w-full"
            >
              {loading ? 'جاري التعيين...' : 'تعيين السائق'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={loading} className="w-full">
                <IconX className="mr-2 h-4 w-4" />
                إلغاء
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
