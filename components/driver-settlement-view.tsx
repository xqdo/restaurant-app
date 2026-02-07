'use client'

import { useEffect, useState } from 'react'
import { IconCheck, IconChecks } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api/client'
import { DELIVERY_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  DeliveryReceiptWithDetails,
  DeliveryGuy,
  MarkPaidDto,
  UnpaidByDriverResponse,
} from '@/lib/types/delivery.types'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateTime } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { OrderDetailDrawer } from '@/components/order-detail-drawer'
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

export function DriverSettlementView() {
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<DeliveryGuy[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [unpaidDeliveries, setUnpaidDeliveries] = useState<
    DeliveryReceiptWithDetails[]
  >([])
  const [loading, setLoading] = useState(false)
  const [loadingDrivers, setLoadingDrivers] = useState(true)
  const [settling, setSettling] = useState(false)
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [settleConfirmOpen, setSettleConfirmOpen] = useState(false)

  const canManage =
    user?.roles.some((role) => ['Admin', 'Manager'].includes(role)) ?? false

  useEffect(() => {
    fetchDrivers()
  }, [])

  useEffect(() => {
    if (selectedDriverId) {
      fetchUnpaidDeliveries()
    } else {
      setUnpaidDeliveries([])
    }
  }, [selectedDriverId])

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true)
      const data = await apiClient.get<DeliveryGuy[]>(
        DELIVERY_ENDPOINTS.drivers
      )
      setDrivers(data.filter((d) => !d.isdeleted))
    } catch (error) {
      toast.error('فشل تحميل السائقين')
    } finally {
      setLoadingDrivers(false)
    }
  }

  const fetchUnpaidDeliveries = async () => {
    if (!selectedDriverId) return

    try {
      setLoading(true)
      const data = await apiClient.get<UnpaidByDriverResponse>(
        DELIVERY_ENDPOINTS.unpaidByDriver(parseInt(selectedDriverId, 10))
      )
      setUnpaidDeliveries(Array.isArray(data.deliveries) ? data.deliveries : [])
    } catch (error) {
      toast.error('فشل تحميل التوصيلات غير المدفوعة')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (deliveryId: number) => {
    try {
      const data: MarkPaidDto = { is_paid: true }
      await apiClient.put(DELIVERY_ENDPOINTS.markPaid(deliveryId), data)
      toast.success('تم تحديد التوصيل كمدفوع')
      fetchUnpaidDeliveries()
    } catch (error) {
      toast.error('فشل تحديث حالة الدفع')
    }
  }

  const handleSettleAll = async () => {
    if (!selectedDriverId || unpaidDeliveries.length === 0) return

    try {
      setSettling(true)
      setSettleConfirmOpen(false)
      const data: MarkPaidDto = { is_paid: true }

      await Promise.all(
        unpaidDeliveries.map((delivery) =>
          apiClient.put(DELIVERY_ENDPOINTS.markPaid(delivery.id), data)
        )
      )

      toast.success('تم تسوية جميع التوصيلات بنجاح')
      fetchUnpaidDeliveries()
    } catch (error) {
      toast.error('فشل تسوية التوصيلات')
    } finally {
      setSettling(false)
    }
  }

  const totalOwed = unpaidDeliveries.reduce(
    (sum, delivery) => sum + (delivery.receipt_total || 0),
    0
  )

  const selectedDriver = drivers.find(
    (d) => d.id.toString() === selectedDriverId
  )

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold">التسويات</h2>
        <p className="text-muted-foreground">
          تسوية المدفوعات مع السائقين وتتبع المستحقات
        </p>
      </div>

      {/* Driver Selection */}
      <Card dir="rtl">
        <CardHeader className="text-right">
          <CardTitle>اختر السائق</CardTitle>
          <CardDescription>
            اختر السائق لعرض التوصيلات غير المدفوعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-right">
            <Label htmlFor="settlementDriver">السائق</Label>
            <Select
              value={selectedDriverId}
              onValueChange={setSelectedDriverId}
              disabled={loadingDrivers}
            >
              <SelectTrigger id="settlementDriver">
                <SelectValue placeholder="اختر السائق" />
              </SelectTrigger>
              <SelectContent>
                {loadingDrivers ? (
                  <SelectItem value="loading" disabled>
                    جاري التحميل...
                  </SelectItem>
                ) : drivers.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    لا يوجد سائقين
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
        </CardContent>
      </Card>

      {/* Summary Card */}
      {selectedDriverId && !loading && (
        <Card dir="rtl">
          <CardHeader className="text-right">
            <CardTitle>ملخص التسوية</CardTitle>
            <CardDescription>{selectedDriver?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
              <div>
                <p className="text-sm text-muted-foreground">
                  عدد التوصيلات غير المدفوعة
                </p>
                <p className="text-2xl font-bold">
                  {unpaidDeliveries.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalOwed)}
                </p>
              </div>
              <div className="flex items-end">
                {canManage && unpaidDeliveries.length > 0 && (
                  <Button
                    onClick={() => setSettleConfirmOpen(true)}
                    disabled={settling}
                    className="w-full"
                  >
                    <IconChecks className="mr-2 h-4 w-4" />
                    {settling ? 'جاري التسوية...' : 'تسوية الكل'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!loading && selectedDriverId && unpaidDeliveries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-xl font-semibold">لا توجد تسويات معلقة</h3>
            <p className="text-muted-foreground mt-2">
              جميع التوصيلات لهذا السائق مدفوعة
            </p>
          </CardContent>
        </Card>
      )}

      {/* Unpaid Deliveries Table */}
      {!loading && selectedDriverId && unpaidDeliveries.length > 0 && (
        <Card dir="rtl">
          <CardHeader className="text-right">
            <CardTitle>التوصيلات غير المدفوعة</CardTitle>
            <CardDescription>
              قائمة بجميع التوصيلات التي لم يتم دفعها بعد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">رقم الهاتف</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidDeliveries.map((delivery) => (
                    <TableRow
                      key={delivery.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedReceiptId(delivery.receipt_id)
                        setDrawerOpen(true)
                      }}
                    >
                      <TableCell className="font-medium">
                        #{delivery.receipt?.id || '-'}
                      </TableCell>
                      <TableCell>
                        {delivery.receipt?.phone_number || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {delivery.receipt?.location || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {delivery.receipt?.completed_at
                          ? formatDateTime(delivery.receipt.completed_at)
                          : delivery.receipt?.created_at
                            ? formatDateTime(delivery.receipt.created_at)
                            : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {delivery.receipt_total
                          ? formatCurrency(delivery.receipt_total)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkPaid(delivery.id)
                            }}
                          >
                            <IconCheck className="mr-1 h-4 w-4" />
                            تحديد كمدفوع
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">
                      الإجمالي:
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      {formatCurrency(totalOwed)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Driver Selected */}
      {!selectedDriverId && !loadingDrivers && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">اختر سائق لعرض التسويات</p>
          </CardContent>
        </Card>
      )}

      {/* Receipt Detail Drawer */}
      <OrderDetailDrawer
        receiptId={selectedReceiptId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Settle All Confirmation Dialog */}
      <AlertDialog open={settleConfirmOpen} onOpenChange={setSettleConfirmOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد تسوية الكل</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من تسوية جميع التوصيلات ({unpaidDeliveries.length}) للسائق{' '}
              {selectedDriver?.name}؟ المبلغ الإجمالي: {formatCurrency(totalOwed)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={handleSettleAll}>
              تأكيد التسوية
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
