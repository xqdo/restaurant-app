'use client'

import { useState } from 'react'
import { IconDots, IconTrash } from '@tabler/icons-react'
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
import { TableStatusBadge } from '@/components/table-status-badge'
import type { Table, TableStatus } from '@/lib/types/table.types'

interface TableCardProps {
  table: Table
  onStatusChange: (tableId: number, newStatus: TableStatus) => Promise<void>
  onDelete: (tableId: number) => Promise<void>
  canManage: boolean
}

export function TableCard({
  table,
  onStatusChange,
  onDelete,
  canManage,
}: TableCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusClick = async (newStatus: TableStatus) => {
    if (isUpdating || newStatus === table.status) return

    setIsUpdating(true)
    try {
      await onStatusChange(table.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      await onDelete(table.id)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className={`relative ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-2xl font-bold">رقم {table.number}</div>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-right">
              <DropdownMenuLabel className="text-right">الإجراءات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600 flex-row-reverse"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                حذف الطاولة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">الحالة:</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <TableStatusBadge status={table.status} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="text-right">
              <DropdownMenuLabel className="text-right">تغيير الحالة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusClick('AVAILABLE')} className="text-right">
                🟢 متاح
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusClick('OCCUPIED')} className="text-right">
                🔴 مشغول
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusClick('RESERVED')} className="text-right">
                🟡 محجوز
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
