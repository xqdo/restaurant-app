'use client'

import { useState } from 'react'
import { IconPhone, IconDots, IconEdit, IconTrash } from '@tabler/icons-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { DeliveryGuy, DeliveryGuyStats } from '@/lib/types/delivery.types'

interface DriverCardProps {
  driver: DeliveryGuy
  stats?: DeliveryGuyStats | null
  onEdit: (driver: DeliveryGuy) => void
  onDelete: (driverId: number) => Promise<void>
  canManage: boolean
}

export function DriverCard({
  driver,
  stats,
  onEdit,
  onDelete,
  canManage,
}: DriverCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (isDeleting) return

    if (!confirm(`هل أنت متأكد من حذف السائق "${driver.name}"؟`)) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(driver.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    onEdit(driver)
  }

  return (
    <Card
      className={`relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
      dir="rtl"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-xl font-bold truncate text-right">{driver.name}</div>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-right" dir="rtl">
              <DropdownMenuLabel className="text-right">الإجراءات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit} className="flex-row-reverse">
                <IconEdit className="mr-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600 flex-row-reverse"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-right">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{driver.phone_number}</span>
            <IconPhone className="h-4 w-4" />
          </div>

          {stats && (
            <div className="pt-2 border-t space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">{stats.total_deliveries}</span>
                <span className="text-muted-foreground">إجمالي التوصيلات:</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-orange-600">
                  {stats.unpaid_deliveries}
                </span>
                <span className="text-muted-foreground">غير مدفوع:</span>
              </div>
              {stats.unpaid_earnings > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-orange-600">
                    {stats.unpaid_earnings.toLocaleString('en-US')} د.ع
                  </span>
                  <span className="text-muted-foreground">المبلغ المستحق:</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
