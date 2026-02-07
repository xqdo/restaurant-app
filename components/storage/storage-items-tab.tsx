'use client'

import { useState, useEffect, useRef } from 'react'
import { IconDots, IconEdit, IconTrash, IconPlus, IconMinus, IconSearch } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { type StorageItem, UNIT_LABELS } from '@/lib/types/storage.types'

interface StorageItemsTabProps {
  items: StorageItem[]
  loading: boolean
  onEdit: (item: StorageItem) => void
  onDelete: (item: StorageItem) => void
  onAddEntry: (itemId: number) => void
  onAddUsage: (itemId: number) => void
  onSearch: (search: string) => void
}

function getStockStatus(item: StorageItem) {
  const current = Number(item.current_quantity)
  const min = item.min_quantity ? Number(item.min_quantity) : null

  if (current === 0) {
    return { label: 'نفذ', variant: 'destructive' as const }
  }
  if (min !== null && current <= min) {
    return { label: 'منخفض', variant: 'warning' as const }
  }
  return { label: 'متوفر', variant: 'success' as const }
}

function getStockPercentage(item: StorageItem): number | null {
  const current = Number(item.current_quantity)
  const min = item.min_quantity ? Number(item.min_quantity) : null
  if (min === null || min === 0) return null
  const full = min * 3
  return Math.min((current / full) * 100, 100)
}

function getBarColor(item: StorageItem): string {
  const current = Number(item.current_quantity)
  const min = item.min_quantity ? Number(item.min_quantity) : null

  if (current === 0) return 'bg-red-500'
  if (min !== null && current <= min) return 'bg-amber-500'
  return 'bg-emerald-500'
}

export function StorageItemsTab({
  items,
  loading,
  onEdit,
  onDelete,
  onAddEntry,
  onAddUsage,
  onSearch,
}: StorageItemsTabProps) {
  const [search, setSearch] = useState('')
  const isFirstRender = useRef(true)
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      onSearchRef.current(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9 text-right"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">لا توجد مواد</h3>
            <p className="text-muted-foreground max-w-sm">
              {search
                ? 'لا توجد نتائج مطابقة للبحث.'
                : 'ابدأ بإضافة مادة جديدة للمخزون لتتبع الكميات والمشتريات.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
          {items.map((item) => {
            const status = getStockStatus(item)
            const percentage = getStockPercentage(item)
            const barColor = getBarColor(item)
            const currentQty = Number(item.current_quantity)
            const minQty = item.min_quantity ? Number(item.min_quantity) : null

            return (
              <Card key={item.id} className="relative py-4 gap-3">
                <CardContent className="px-4 space-y-3 text-right">
                  {/* Top row: name + actions */}
                  <div className="flex flex-row-reverse items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 text-right">
                      <h3 className="font-semibold text-base truncate">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <IconDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="text-right">
                          <DropdownMenuLabel className="text-right">الإجراءات</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <IconEdit className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <IconTrash className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>

                  {/* Quantity display */}
                  <div className="space-y-1.5">
                    <div className="flex flex-row-reverse items-baseline justify-between">
                      <span className="text-2xl font-bold tabular-nums">{currentQty}</span>
                      <span className="text-sm text-muted-foreground">{UNIT_LABELS[item.unit]}</span>
                    </div>
                    {percentage !== null && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden" dir="ltr">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                    {minQty !== null && (
                      <p className="text-xs text-muted-foreground">
                        الحد الأدنى: {minQty}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-row-reverse gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => onAddEntry(item.id)}
                    >
                      <IconPlus className="h-3.5 w-3.5 ml-1" />
                      إضافة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => onAddUsage(item.id)}
                    >
                      <IconMinus className="h-3.5 w-3.5 ml-1" />
                      صرف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
