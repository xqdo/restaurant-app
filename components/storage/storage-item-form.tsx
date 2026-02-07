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
import { type StorageItem, type UnitOfMeasurement, UNIT_LABELS } from '@/lib/types/storage.types'

interface StorageItemFormProps {
  item?: StorageItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const UNITS: UnitOfMeasurement[] = ['kg', 'g', 'liter', 'ml', 'piece', 'pack', 'box']

export function StorageItemForm({ item, open, onOpenChange, onSuccess }: StorageItemFormProps) {
  const isMobile = useIsMobile()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState<string>('')
  const [minQuantity, setMinQuantity] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name)
        setDescription(item.description || '')
        setUnit(item.unit)
        setMinQuantity(item.min_quantity ? String(Number(item.min_quantity)) : '')
      } else {
        setName('')
        setDescription('')
        setUnit('')
        setMinQuantity('')
      }
    }
  }, [item, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('اسم المادة مطلوب')
      return
    }

    if (!unit) {
      toast.error('الوحدة مطلوبة')
      return
    }

    setLoading(true)

    try {
      const body: any = {
        name: name.trim(),
        unit,
        description: description.trim() || undefined,
        min_quantity: minQuantity ? parseFloat(minQuantity) : undefined,
      }

      if (item) {
        await apiClient.put(STORAGE_ENDPOINTS.itemById(item.id), body)
      } else {
        await apiClient.post(STORAGE_ENDPOINTS.items, body)
      }

      toast.success(item ? 'تم تحديث المادة بنجاح' : 'تم إضافة المادة بنجاح')
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
          <DrawerTitle>{item ? 'تعديل المادة' : 'إضافة مادة جديدة'}</DrawerTitle>
          <DrawerDescription>
            {item ? 'قم بتحديث معلومات المادة' : 'أضف مادة جديدة للمخزون'}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-2">
              <Label htmlFor="storage-item-name">اسم المادة *</Label>
              <Input
                id="storage-item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: دقيق أبيض"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage-item-unit">الوحدة *</Label>
              <Select value={unit} onValueChange={setUnit} disabled={loading}>
                <SelectTrigger id="storage-item-unit">
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {UNIT_LABELS[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage-item-min">الحد الأدنى للتنبيه</Label>
              <Input
                id="storage-item-min"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                placeholder="اختياري - للتنبيه عند انخفاض المخزون"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage-item-desc">الوصف</Label>
              <textarea
                id="storage-item-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف المادة (اختياري)..."
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : item ? 'حفظ التعديلات' : 'إضافة المادة'}
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
