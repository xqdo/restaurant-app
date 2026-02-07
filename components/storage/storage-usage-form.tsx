'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient } from '@/lib/api/client'
import { STORAGE_ENDPOINTS } from '@/lib/api/endpoints'
import {
  type StorageItem,
  type UsageReason,
  UNIT_LABELS,
  REASON_LABELS,
} from '@/lib/types/storage.types'
import { formatDateForAPI } from '@/lib/utils/date'

interface StorageUsageFormProps {
  storageItems: StorageItem[]
  preselectedItemId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const REASONS: UsageReason[] = ['production', 'waste', 'adjustment', 'expired']

export function StorageUsageForm({
  storageItems,
  preselectedItemId,
  open,
  onOpenChange,
  onSuccess,
}: StorageUsageFormProps) {
  const isMobile = useIsMobile()
  const [storageItemId, setStorageItemId] = useState<string>('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [usageDate, setUsageDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setStorageItemId(preselectedItemId?.toString() || '')
      setQuantity('')
      setReason('')
      setNotes('')
      setUsageDate(formatDateForAPI(new Date()))
    }
  }, [open, preselectedItemId])

  const selectedItem = storageItems.find((i) => i.id === Number(storageItemId))
  const availableQuantity = selectedItem ? Number(selectedItem.current_quantity) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!storageItemId) {
      toast.error('اختر المادة')
      return
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('الكمية يجب أن تكون أكبر من صفر')
      return
    }

    if (parseFloat(quantity) > availableQuantity) {
      toast.error(`الكمية المطلوبة (${quantity}) تتجاوز المتوفر (${availableQuantity})`)
      return
    }

    setLoading(true)

    try {
      const body: any = {
        storage_item_id: parseInt(storageItemId),
        quantity: parseFloat(quantity),
        reason: reason || undefined,
        notes: notes.trim() || undefined,
        usage_date: usageDate ? new Date(usageDate).toISOString() : undefined,
      }

      await apiClient.post(STORAGE_ENDPOINTS.usages, body)
      toast.success('تم تسجيل الصرف بنجاح')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? 'bottom' : 'left'}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>صرف من المخزون</DrawerTitle>
          <DrawerDescription>سجل استهلاك أو صرف مواد من المخزون</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-2">
              <Label htmlFor="usage-item">المادة *</Label>
              <Select
                value={storageItemId}
                onValueChange={setStorageItemId}
                disabled={loading || !!preselectedItemId}
              >
                <SelectTrigger id="usage-item">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  {storageItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({UNIT_LABELS[item.unit]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedItem && (
                <p className="text-xs text-muted-foreground">
                  المتوفر: {availableQuantity} {UNIT_LABELS[selectedItem.unit]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage-quantity">الكمية *</Label>
              <Input
                id="usage-quantity"
                type="number"
                inputMode="decimal"
                step="any"
                min="0.01"
                max={availableQuantity || undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="الكمية المصروفة"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage-reason">السبب</Label>
              <Select value={reason} onValueChange={setReason} disabled={loading}>
                <SelectTrigger id="usage-reason">
                  <SelectValue placeholder="اختر السبب" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {REASON_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage-date">التاريخ</Label>
              <Input
                id="usage-date"
                type="date"
                value={usageDate}
                onChange={(e) => setUsageDate(e.target.value)}
                max={formatDateForAPI(new Date())}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage-notes">ملاحظات</Label>
              <Input
                id="usage-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اختياري"
                disabled={loading}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'تسجيل الصرف'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={loading}>
                إلغاء
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
