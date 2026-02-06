/**
 * Order Filters Component
 * Filter controls for receipts list (table, date range, delivery type)
 */

'use client'

import { useEffect, useState } from 'react'
import { IconFilter, IconX } from '@tabler/icons-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { TABLE_ENDPOINTS } from '@/lib/api/endpoints'
import type { ReceiptQueryFilters } from '@/lib/types/receipt.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface OrderFiltersProps {
  filters: ReceiptQueryFilters
  onFiltersChange: (filters: ReceiptQueryFilters) => void
}

interface Table {
  id: number
  number: number
}

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [localFilters, setLocalFilters] = useState<ReceiptQueryFilters>(filters)

  // Fetch all tables for filter dropdown
  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await apiClient.get<{ data: Table[] }>(
        TABLE_ENDPOINTS.tables
      )
      setTables(response.data || [])
    } catch (error) {
      console.error('Failed to fetch tables:', error)
    }
  }

  const handleApplyFilters = () => {
    onFiltersChange({
      ...localFilters,
      page: 1, // Reset to page 1 when filters change
    })
  }

  const handleClearFilters = () => {
    const clearedFilters: ReceiptQueryFilters = {
      completed: false,
      page: 1,
      perPage: filters.perPage || 10,
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters =
    localFilters.table_id ||
    localFilters.start_date ||
    localFilters.end_date ||
    localFilters.is_delivery !== undefined

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFilter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">تصفية الطلبات</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <IconX className="h-4 w-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Order Status Tabs */}
      <div className="flex gap-2">
        <Button
          variant={localFilters.completed === false ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            const updated = { ...localFilters, completed: false, page: 1 }
            setLocalFilters(updated)
            onFiltersChange(updated)
          }}
        >
          الطلبات الحالية
        </Button>
        <Button
          variant={localFilters.completed === true ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            const updated = { ...localFilters, completed: true, page: 1 }
            setLocalFilters(updated)
            onFiltersChange(updated)
          }}
        >
          الطلبات المكتملة
        </Button>
        <Button
          variant={localFilters.completed === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            const updated = { ...localFilters, completed: undefined, page: 1 }
            setLocalFilters(updated)
            onFiltersChange(updated)
          }}
        >
          الكل
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Table Filter */}
        <div className="space-y-2">
          <Label htmlFor="table-filter">الطاولة</Label>
          <Select
            value={
              localFilters.table_id === undefined
                ? 'all'
                : localFilters.table_id === null
                ? 'none'
                : localFilters.table_id.toString()
            }
            onValueChange={(value) => {
              if (value === 'all') {
                setLocalFilters({ ...localFilters, table_id: undefined })
              } else if (value === 'none') {
                setLocalFilters({ ...localFilters, table_id: null as any })
              } else {
                setLocalFilters({ ...localFilters, table_id: parseInt(value) })
              }
            }}
          >
            <SelectTrigger id="table-filter">
              <SelectValue placeholder="جميع الطاولات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الطاولات</SelectItem>
              <SelectItem value="none">بدون طاولة</SelectItem>
              {tables.map((table) => (
                <SelectItem key={table.id} value={table.id.toString()}>
                  طاولة {table.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Filter */}
        <div className="space-y-2">
          <Label htmlFor="start-date">من تاريخ</Label>
          <Input
            id="start-date"
            type="date"
            value={localFilters.start_date || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                start_date: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* End Date Filter */}
        <div className="space-y-2">
          <Label htmlFor="end-date">إلى تاريخ</Label>
          <Input
            id="end-date"
            type="date"
            value={localFilters.end_date || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                end_date: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* Order Type Filter */}
        <div className="space-y-2">
          <Label>نوع الطلب</Label>
          <RadioGroup
            value={
              localFilters.is_delivery === true
                ? 'delivery'
                : localFilters.is_delivery === false
                ? 'local'
                : 'all'
            }
            onValueChange={(value) => {
              setLocalFilters({
                ...localFilters,
                is_delivery: value === 'all' ? undefined : value === 'delivery',
              })
            }}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="font-normal cursor-pointer">
                الكل
              </Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="local" id="local" />
              <Label htmlFor="local" className="font-normal cursor-pointer">
                محلي وسفري
              </Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery" className="font-normal cursor-pointer">
                توصيل
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button onClick={handleApplyFilters}>
          <IconFilter className="h-4 w-4" />
          تطبيق الفلاتر
        </Button>
      </div>
    </div>
  )
}
