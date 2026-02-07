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
import { type StorageItem, UNIT_LABELS } from '@/lib/types/storage.types'
import { type Vendor } from '@/lib/types/vendor.types'
import { formatDateForAPI } from '@/lib/utils/date'

interface StorageEntryFormProps {
  storageItems: StorageItem[]
  vendors: Vendor[]
  preselectedItemId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function StorageEntryForm({
  storageItems,
  vendors,
  preselectedItemId,
  open,
  onOpenChange,
  onSuccess,
}: StorageEntryFormProps) {
  const isMobile = useIsMobile()
  const [storageItemId, setStorageItemId] = useState<string>('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [vendorId, setVendorId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setStorageItemId(preselectedItemId?.toString() || '')
      setQuantity('')
      setUnitPrice('')
      setVendorId('')
      setNotes('')
      setEntryDate(formatDateForAPI(new Date()))
    }
  }, [open, preselectedItemId])

  const selectedItem = storageItems.find((i) => i.id === Number(storageItemId))

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

    setLoading(true)

    try {
      const body: any = {
        storage_item_id: parseInt(storageItemId),
        quantity: parseFloat(quantity),
        unit_price: unitPrice ? parseFloat(unitPrice) : undefined,
        vendor_id: vendorId ? parseInt(vendorId) : undefined,
        notes: notes.trim() || undefined,
        entry_date: entryDate ? new Date(entryDate).toISOString() : undefined,
      }

      await apiClient.post(STORAGE_ENDPOINTS.entries, body)
      toast.success('تم إضافة المخزون بنجاح')
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
          <DrawerTitle>إضافة مخزون</DrawerTitle>
          <DrawerDescription>سجل استلام مواد جديدة للمخزون</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-2">
              <Label htmlFor="entry-item">المادة *</Label>
              <Select
                value={storageItemId}
                onValueChange={setStorageItemId}
                disabled={loading || !!preselectedItemId}
              >
                <SelectTrigger id="entry-item">
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
                  الكمية الحالية: {Number(selectedItem.current_quantity)} {UNIT_LABELS[selectedItem.unit]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-quantity">الكمية *</Label>
              <Input
                id="entry-quantity"
                type="number"
                inputMode="decimal"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="الكمية المستلمة"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-price">سعر الوحدة (د.ع)</Label>
              <Input
                id="entry-price"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="اختياري"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-vendor">المورد</Label>
              <Select
                value={vendorId}
                onValueChange={setVendorId}
                disabled={loading}
              >
                <SelectTrigger id="entry-vendor">
                  <SelectValue placeholder="اختر المورد (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-date">التاريخ</Label>
              <Input
                id="entry-date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                max={formatDateForAPI(new Date())}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-notes">ملاحظات</Label>
              <Input
                id="entry-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اختياري"
                disabled={loading}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'إضافة المخزون'}
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
