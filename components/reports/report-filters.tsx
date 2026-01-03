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
import { IconFilter, IconX } from '@tabler/icons-react'
import { type ReportFilters, type ReportPeriod } from '@/lib/types/report.types'
import { formatDateForAPI } from '@/lib/utils/date'

interface ReportFiltersProps {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters)

  const handlePeriodChange = (period: ReportPeriod) => {
    const newFilters = { ...localFilters, period, page: 1 }

    // If switching from custom to predefined period, clear custom dates
    if (period !== 'custom') {
      delete newFilters.startDate
      delete newFilters.endDate
    }

    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFilters = { ...localFilters, [field]: value, page: 1 }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
  }

  const handleClearFilters = () => {
    const newFilters: ReportFilters = {
      period: '7days',
      page: 1,
      limit: 50,
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const hasActiveFilters = filters.period !== '7days' || filters.startDate || filters.endDate

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFilter className="h-5 w-5" />
          <h3 className="font-semibold">الفترة الزمنية</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <IconX className="h-4 w-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Desktop: ToggleGroup */}
      <div className="hidden md:block">
        <ToggleGroup
          type="single"
          value={localFilters.period}
          onValueChange={(value) => value && handlePeriodChange(value as ReportPeriod)}
          className="justify-start"
        >
          <ToggleGroupItem value="7days">آخر 7 أيام</ToggleGroupItem>
          <ToggleGroupItem value="30days">آخر 30 يوماً</ToggleGroupItem>
          <ToggleGroupItem value="90days">آخر 90 يوماً</ToggleGroupItem>
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
            <SelectItem value="7days">آخر 7 أيام</SelectItem>
            <SelectItem value="30days">آخر 30 يوماً</SelectItem>
            <SelectItem value="90days">آخر 90 يوماً</SelectItem>
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
export function calculateDateRange(period: ReportPeriod): {
  startDate: string
  endDate: string
} {
  const today = new Date()
  const endDate = formatDateForAPI(today)

  let startDate: string

  switch (period) {
    case '7days': {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)
      startDate = formatDateForAPI(sevenDaysAgo)
      break
    }
    case '30days': {
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)
      startDate = formatDateForAPI(thirtyDaysAgo)
      break
    }
    case '90days': {
      const ninetyDaysAgo = new Date(today)
      ninetyDaysAgo.setDate(today.getDate() - 90)
      startDate = formatDateForAPI(ninetyDaysAgo)
      break
    }
    default:
      startDate = endDate
  }

  return { startDate, endDate }
}
