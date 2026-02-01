'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

  // Reset form when dialog opens
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة طاولة جديدة</DialogTitle>
          <DialogDescription>أدخل رقم الطاولة الجديدة</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إضافة طاولة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
