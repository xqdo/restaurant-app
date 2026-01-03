'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import { TABLE_ENDPOINTS } from '@/lib/api/endpoints'
import type { CreateTableDto } from '@/lib/types/table.types'

interface TableFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TableForm({ open, onOpenChange, onSuccess }: TableFormProps) {
  const [tableNumber, setTableNumber] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setTableNumber('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const number = parseInt(tableNumber, 10)
    if (!tableNumber || isNaN(number) || number <= 0) {
      toast.error('الرجاء إدخال رقم طاولة صحيح')
      return
    }

    setLoading(true)
    try {
      const data: CreateTableDto = { number }
      await apiClient.post(TABLE_ENDPOINTS.tables, data)

      toast.success('تم إنشاء الطاولة بنجاح')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل إنشاء الطاولة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-right">
          <DrawerTitle>إضافة طاولة جديدة</DrawerTitle>
          <DrawerDescription>أدخل رقم الطاولة الجديدة</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">رقم الطاولة *</Label>
              <Input
                id="tableNumber"
                type="number"
                min="1"
                step="1"
                placeholder="مثال: 12"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-sm text-muted-foreground">
                أدخل رقم فريد للطاولة (رقم موجب)
              </p>
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'جاري الإنشاء...' : 'إضافة طاولة'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={loading} className="w-full">
                <IconX className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
