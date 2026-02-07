'use client'

import { useState } from 'react'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { IconFilter, IconPrinter, IconX } from '@tabler/icons-react'
import { type ReportFilters, type ReportPeriod } from '@/lib/types/report.types'
import { formatDateForAPI } from '@/lib/utils/date'
import { startOfWeek, startOfMonth } from 'date-fns'

interface ReportFiltersProps {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters)

  const handlePeriodChange = (period: ReportPeriod) => {
    const newFilters = { ...localFilters, period }

    if (period !== 'custom') {
      delete newFilters.startDate
      delete newFilters.endDate
    }

    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
  }

  const handleClearFilters = () => {
    const newFilters: ReportFilters = {
      period: 'today',
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const hasActiveFilters = filters.period !== 'today' || filters.startDate || filters.endDate

  return (
    <div className="border rounded-lg p-4 space-y-4 no-print">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFilter className="h-5 w-5" />
          <h3 className="font-semibold">الفترة الزمنية</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <IconX className="h-4 w-4" />
              مسح الفلاتر
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <IconPrinter className="h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Desktop: ToggleGroup */}
      <div className="hidden md:block">
        <ToggleGroup
          type="single"
          value={localFilters.period}
          onValueChange={(value) => value && handlePeriodChange(value as ReportPeriod)}
          className="justify-start"
        >
          <ToggleGroupItem value="today">اليوم</ToggleGroupItem>
          <ToggleGroupItem value="yesterday">أمس</ToggleGroupItem>
          <ToggleGroupItem value="weekly">هذا الأسبوع</ToggleGroupItem>
          <ToggleGroupItem value="monthly">هذا الشهر</ToggleGroupItem>
          <ToggleGroupItem value="custom">مخصص</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Mobile: Select */}
      <div className="block md:hidden">
        <Select
          value={localFilters.period}
          onValueChange={(value) => handlePeriodChange(value as ReportPeriod)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الفترة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="yesterday">أمس</SelectItem>
            <SelectItem value="weekly">هذا الأسبوع</SelectItem>
            <SelectItem value="monthly">هذا الشهر</SelectItem>
            <SelectItem value="custom">مخصص</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range */}
      {localFilters.period === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="start-date">من تاريخ</Label>
            <Input
              id="start-date"
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              max={formatDateForAPI(new Date())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">إلى تاريخ</Label>
            <Input
              id="end-date"
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              max={formatDateForAPI(new Date())}
              min={localFilters.startDate}
            />
          </div>
        </div>
      )}

      {/* Apply Button (only for custom dates) */}
      {localFilters.period === 'custom' && (
        <div className="flex justify-end pt-2">
          <Button onClick={handleApplyFilters}>
            <IconFilter className="h-4 w-4" />
            تطبيق
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Calculate date range based on period
 */
export function calculateDateRange(
  period: ReportPeriod,
  customStartDate?: string,
  customEndDate?: string,
): {
  startDate: string
  endDate: string
} {
  const today = new Date()
  const todayStr = formatDateForAPI(today)

  switch (period) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr }

    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const yesterdayStr = formatDateForAPI(yesterday)
      return { startDate: yesterdayStr, endDate: yesterdayStr }
    }

    case 'weekly': {
      const weekStart = startOfWeek(today, { weekStartsOn: 6 })
      return { startDate: formatDateForAPI(weekStart), endDate: todayStr }
    }

    case 'monthly': {
      const monthStart = startOfMonth(today)
      return { startDate: formatDateForAPI(monthStart), endDate: todayStr }
    }

    case 'custom':
      return {
        startDate: customStartDate || todayStr,
        endDate: customEndDate || todayStr,
      }

    default:
      return { startDate: todayStr, endDate: todayStr }
  }
}
