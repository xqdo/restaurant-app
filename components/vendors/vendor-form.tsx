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
import { apiClient } from '@/lib/api/client'
import { VENDOR_ENDPOINTS } from '@/lib/api/endpoints'
import { type Vendor } from '@/lib/types/vendor.types'

interface VendorFormProps {
  vendor?: Vendor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function VendorForm({ vendor, open, onOpenChange, onSuccess }: VendorFormProps) {
  const isMobile = useIsMobile()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (vendor) {
        setName(vendor.name)
        setPhone(vendor.phone || '')
        setAddress(vendor.address || '')
        setNotes(vendor.notes || '')
      } else {
        setName('')
        setPhone('')
        setAddress('')
        setNotes('')
      }
    }
  }, [vendor, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('اسم المورد مطلوب')
      return
    }

    setLoading(true)

    try {
      const body: any = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      }

      if (vendor) {
        await apiClient.put(VENDOR_ENDPOINTS.vendorById(vendor.id), body)
      } else {
        await apiClient.post(VENDOR_ENDPOINTS.vendors, body)
      }

      toast.success(vendor ? 'تم تحديث المورد بنجاح' : 'تم إضافة المورد بنجاح')
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
          <DrawerTitle>{vendor ? 'تعديل المورد' : 'إضافة مورد جديد'}</DrawerTitle>
          <DrawerDescription>
            {vendor ? 'قم بتحديث معلومات المورد' : 'أضف مورد جديد للنظام'}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-2">
              <Label htmlFor="vendor-name">اسم المورد *</Label>
              <Input
                id="vendor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: شركة الأغذية"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-phone">الهاتف</Label>
              <Input
                id="vendor-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف (اختياري)"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-address">العنوان</Label>
              <Input
                id="vendor-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="العنوان (اختياري)"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-notes">ملاحظات</Label>
              <textarea
                id="vendor-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات إضافية (اختياري)..."
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : vendor ? 'حفظ التعديلات' : 'إضافة المورد'}
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
