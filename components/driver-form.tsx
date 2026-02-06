'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { IconX } from '@tabler/icons-react'
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
import { DELIVERY_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  DeliveryGuy,
  CreateDeliveryGuyDto,
  UpdateDeliveryGuyDto,
} from '@/lib/types/delivery.types'

interface DriverFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  driver?: DeliveryGuy | null
}

export function DriverForm({
  open,
  onOpenChange,
  onSuccess,
  driver,
}: DriverFormProps) {
  const isMobile = useIsMobile()
  const [name, setName] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const isEditMode = !!driver

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      if (driver) {
        // Edit mode - populate with existing data
        setName(driver.name)
        setPhoneNumber(driver.phone_number)
      } else {
        // Create mode - reset fields
        setName('')
        setPhoneNumber('')
      }
    }
  }, [open, driver])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast.error('الرجاء إدخال اسم السائق')
      return
    }

    if (!phoneNumber.trim()) {
      toast.error('الرجاء إدخال رقم الهاتف')
      return
    }

    setLoading(true)
    try {
      if (isEditMode) {
        // Update existing driver
        const data: UpdateDeliveryGuyDto = {
          name: name.trim(),
          phone_number: phoneNumber.trim(),
        }
        await apiClient.put(DELIVERY_ENDPOINTS.driverById(driver.id), data)
        toast.success('تم تحديث السائق بنجاح')
      } else {
        // Create new driver
        const data: CreateDeliveryGuyDto = {
          name: name.trim(),
          phone_number: phoneNumber.trim(),
        }
        await apiClient.post(DELIVERY_ENDPOINTS.drivers, data)
        toast.success('تم إضافة السائق بنجاح')
      }

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `فشل ${isEditMode ? 'تحديث' : 'إضافة'} السائق`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? 'bottom' : 'left'}
    >
      <DrawerContent>
        <DrawerHeader className="text-right">
          <DrawerTitle>
            {isEditMode ? 'تعديل السائق' : 'إضافة سائق جديد'}
          </DrawerTitle>
          <DrawerDescription>
            {isEditMode
              ? 'قم بتعديل بيانات السائق'
              : 'أدخل بيانات السائق الجديد'}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} dir="rtl">
          <div className="px-4 space-y-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="name">اسم السائق *</Label>
              <Input
                id="name"
                type="text"
                placeholder="مثال: أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                dir="rtl"
                className="text-right"
              />
            </div>

            <div className="space-y-2 text-right">
              <Label htmlFor="phoneNumber">رقم الهاتف *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="مثال: 07858004369"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                required
                dir="rtl"
                className="text-right"
              />
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? isEditMode
                  ? 'جاري التحديث...'
                  : 'جاري الإضافة...'
                : isEditMode
                  ? 'تحديث السائق'
                  : 'إضافة سائق'}
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
