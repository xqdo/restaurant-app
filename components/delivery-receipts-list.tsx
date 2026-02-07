'use client'

import { useEffect, useState } from 'react'
import {
  IconEye,
  IconTruck,
  IconCheck,
  IconX,
  IconRefresh,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api/client'
import { DELIVERY_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  DeliveryReceiptWithDetails,
  DeliveryGuy,
  MarkPaidDto,
} from '@/lib/types/delivery.types'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeliveryAssignmentForm } from '@/components/delivery-assignment-form'
import { OrderDetailDrawer } from '@/components/order-detail-drawer'

export function DeliveryReceiptsList() {
  const { user } = useAuth()
  const [deliveries, setDeliveries] = useState<DeliveryReceiptWithDetails[]>([])
  const [drivers, setDrivers] = useState<DeliveryGuy[]>([])
  const [loading, setLoading] = useState(true)
  const [driverFilter, setDriverFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [assignFormOpen, setAssignFormOpen] = useState(false)
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(
    null
  )
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [viewingReceiptId, setViewingReceiptId] = useState<number | null>(null)

  const canManage =
    user?.roles.some((role) => ['Admin', 'Manager'].includes(role)) ?? false

  useEffect(() => {
    fetchDrivers()
    fetchDeliveries()
  }, [])

  useEffect(() => {
    fetchDeliveries()
  }, [driverFilter, paymentFilter])

  const fetchDrivers = async () => {
    try {
      const data = await apiClient.get<DeliveryGuy[]>(
        DELIVERY_ENDPOINTS.drivers
      )
      setDrivers(data.filter((d) => !d.isdeleted))
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
    }
  }

  const fetchDeliveries = async () => {
    try {
      setLoading(true)

      let url = DELIVERY_ENDPOINTS.receipts
      const params = new URLSearchParams()

      if (driverFilter !== 'all') {
        params.append('driver_id', driverFilter)
      }

      if (paymentFilter === 'paid') {
        params.append('is_paid', 'true')
      } else if (paymentFilter === 'unpaid') {
        params.append('is_paid', 'false')
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const data = await apiClient.get<DeliveryReceiptWithDetails[]>(url)
      setDeliveries(data)
    } catch (error) {
      toast.error('فشل تحميل طلبات التوصيل')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDriver = (receiptId: number) => {
    setSelectedReceiptId(receiptId)
    setAssignFormOpen(true)
  }

  const handleTogglePaid = async (deliveryId: number, isPaid: boolean) => {
    try {
      const data: MarkPaidDto = { is_paid: !isPaid }
      await apiClient.put(DELIVERY_ENDPOINTS.markPaid(deliveryId), data)
      toast.success(isPaid ? 'تم إلغاء الدفع' : 'تم تحديد كمدفوع')
      fetchDeliveries()
    } catch (error) {
      toast.error('فشل تحديث حالة الدفع')
    }
  }

  const handleViewDetails = (receiptId: number) => {
    setViewingReceiptId(receiptId)
    setDetailDrawerOpen(true)
  }

  const handleResetFilters = () => {
    setDriverFilter('all')
    setPaymentFilter('all')
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-2xl font-bold">طلبات التوصيل</h2>
          <p className="text-muted-foreground">
            إدارة طلبات التوصيل وتتبع حالتها
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setAssignFormOpen(true)}>
            <IconTruck className="mr-2 h-4 w-4" />
            تعيين سائق
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="space-y-2 flex-1 text-right">
          <Label htmlFor="driverFilter">السائق</Label>
          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger id="driverFilter">
              <SelectValue placeholder="جميع السائقين" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع السائقين</SelectItem>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1 text-right">
          <Label htmlFor="paymentFilter">حالة الدفع</Label>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger id="paymentFilter">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent dir="rtl" className="text-right">
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="paid">مدفوع</SelectItem>
              <SelectItem value="unpaid">غير مدفوع</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(driverFilter !== 'all' || paymentFilter !== 'all') && (
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="flex-shrink-0"
          >
            <IconRefresh className="mr-2 h-4 w-4" />
            إعادة تعيين
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!loading && deliveries.length === 0 && (
        <div className="border rounded-lg p-12 text-center">
          <h3 className="text-xl font-semibold">لا توجد طلبات توصيل</h3>
          <p className="text-muted-foreground mt-2">
            لا توجد طلبات توصيل بالمعايير المحددة
          </p>
        </div>
      )}

      {/* Deliveries Table */}
      {!loading && deliveries.length > 0 && (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">السائق</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">حالة الدفع</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">
                    #{delivery.receipt?.id || '-'}
                  </TableCell>
                  <TableCell>
                    {delivery.delivery_guy?.name || (
                      <span className="text-orange-600">غير معين</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {delivery.receipt?.phone_number || '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {delivery.receipt?.location || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {delivery.receipt?.created_at
                      ? formatDateTime(delivery.receipt.created_at)
                      : '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {delivery.receipt_total
                      ? formatCurrency(delivery.receipt_total)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {delivery.is_paid ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <IconCheck className="mr-1 h-3 w-3" />
                        مدفوع
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <IconX className="mr-1 h-3 w-3" />
                        غير مدفوع
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          delivery.receipt &&
                          handleViewDetails(delivery.receipt.id)
                        }
                        title="عرض التفاصيل"
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                      {canManage && !delivery.delivery_guy && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            delivery.receipt_id &&
                            handleAssignDriver(delivery.receipt_id)
                          }
                          title="تعيين سائق"
                        >
                          <IconTruck className="h-4 w-4" />
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleTogglePaid(delivery.id, delivery.is_paid)
                          }
                          title={delivery.is_paid ? 'إلغاء الدفع' : 'تحديد كمدفوع'}
                        >
                          {delivery.is_paid ? (
                            <IconX className="h-4 w-4 text-orange-600" />
                          ) : (
                            <IconCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Assignment Form */}
      <DeliveryAssignmentForm
        open={assignFormOpen}
        onOpenChange={setAssignFormOpen}
        onSuccess={fetchDeliveries}
        preselectedReceiptId={selectedReceiptId}
      />

      {/* Detail Drawer */}
      {viewingReceiptId && (
        <OrderDetailDrawer
          open={detailDrawerOpen}
          onOpenChange={setDetailDrawerOpen}
          receiptId={viewingReceiptId}
          onUpdate={fetchDeliveries}
        />
      )}
    </div>
  )
}
