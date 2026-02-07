'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReportFilters, calculateDateRange } from '@/components/reports/report-filters'
import { InventoryStatusReport } from './inventory-status-report'
import { StockMovementReport } from './stock-movement-report'
import { PurchaseCostReport } from './purchase-cost-report'
import { WasteReport } from './waste-report'
import { VendorPerformanceReport } from './vendor-performance-report'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { localStartOfDayUTC, localEndOfDayUTC } from '@/lib/utils/date'
import type {
  ReportFilters as ReportFiltersType,
  InventoryStatusReportDto,
  StockMovementReportDto,
  PurchaseCostReportDto,
  WasteReportDto,
  VendorPerformanceReportDto,
} from '@/lib/types/report.types'

type InventorySubReport = 'status' | 'movement' | 'purchases' | 'waste' | 'vendors'

const SUB_REPORT_LABELS: Record<InventorySubReport, string> = {
  status: 'حالة المخزون',
  movement: 'حركة المخزون',
  purchases: 'تكاليف المشتريات',
  waste: 'الهدر والفاقد',
  vendors: 'أداء الموردين',
}

export function InventoryReportsSection() {
  const [activeReport, setActiveReport] = useState<InventorySubReport>('status')
  const [filters, setFilters] = useState<ReportFiltersType>({ period: 'monthly' })
  const [loading, setLoading] = useState(false)

  const [statusData, setStatusData] = useState<InventoryStatusReportDto | null>(null)
  const [movementData, setMovementData] = useState<StockMovementReportDto | null>(null)
  const [purchasesData, setPurchasesData] = useState<PurchaseCostReportDto | null>(null)
  const [wasteData, setWasteData] = useState<WasteReportDto | null>(null)
  const [vendorsData, setVendorsData] = useState<VendorPerformanceReportDto | null>(null)

  // Track which reports have been fetched for this filter state
  const fetchedRef = useRef<Set<string>>(new Set())

  const getCacheKey = useCallback(
    (report: InventorySubReport) => {
      if (report === 'status') return 'status'
      return `${report}-${filters.period}-${filters.startDate}-${filters.endDate}`
    },
    [filters],
  )

  const fetchReport = useCallback(
    async (report: InventorySubReport) => {
      const key = getCacheKey(report)
      if (fetchedRef.current.has(key)) return

      setLoading(true)
      try {
        if (report === 'status') {
          const data = await apiClient.get<InventoryStatusReportDto>(
            REPORTS_ENDPOINTS.inventoryStatus,
          )
          setStatusData(data)
        } else {
          const { startDate, endDate } = calculateDateRange(
            filters.period,
            filters.startDate,
            filters.endDate,
          )

          const startLocal = new Date(startDate + 'T00:00:00')
          const endLocal = new Date(endDate + 'T00:00:00')

          const params = new URLSearchParams({
            start: localStartOfDayUTC(startLocal).split('T')[0],
            end: localEndOfDayUTC(endLocal).split('T')[0],
          })

          const endpoints: Record<string, string> = {
            movement: REPORTS_ENDPOINTS.inventoryMovement,
            purchases: REPORTS_ENDPOINTS.inventoryPurchases,
            waste: REPORTS_ENDPOINTS.inventoryWaste,
            vendors: REPORTS_ENDPOINTS.vendorPerformance,
          }

          const url = `${endpoints[report]}?${params.toString()}`

          switch (report) {
            case 'movement': {
              const data = await apiClient.get<StockMovementReportDto>(url)
              setMovementData(data)
              break
            }
            case 'purchases': {
              const data = await apiClient.get<PurchaseCostReportDto>(url)
              setPurchasesData(data)
              break
            }
            case 'waste': {
              const data = await apiClient.get<WasteReportDto>(url)
              setWasteData(data)
              break
            }
            case 'vendors': {
              const data = await apiClient.get<VendorPerformanceReportDto>(url)
              setVendorsData(data)
              break
            }
          }
        }

        fetchedRef.current.add(key)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'فشل تحميل التقرير')
      } finally {
        setLoading(false)
      }
    },
    [filters, getCacheKey],
  )

  // Clear cache when filters change (except for status which has no date filter)
  useEffect(() => {
    const newSet = new Set<string>()
    // Keep status cache since it doesn't depend on date filters
    if (fetchedRef.current.has('status')) {
      newSet.add('status')
    }
    fetchedRef.current = newSet

    // Clear date-dependent data
    setMovementData(null)
    setPurchasesData(null)
    setWasteData(null)
    setVendorsData(null)
  }, [filters])

  // Fetch active report on tab switch or filter change
  useEffect(() => {
    fetchReport(activeReport)
  }, [activeReport, fetchReport])

  const handleSubReportChange = (value: string) => {
    if (value) {
      setActiveReport(value as InventorySubReport)
    }
  }

  const showDateFilters = activeReport !== 'status'

  return (
    <div className="space-y-4">
      {/* Sub-Report Selector - Desktop */}
      <div className="hidden md:block no-print">
        <ToggleGroup
          type="single"
          value={activeReport}
          onValueChange={handleSubReportChange}
          className="justify-start"
        >
          {(Object.keys(SUB_REPORT_LABELS) as InventorySubReport[]).map((key) => (
            <ToggleGroupItem key={key} value={key}>
              {SUB_REPORT_LABELS[key]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Sub-Report Selector - Mobile */}
      <div className="block md:hidden no-print">
        <Select value={activeReport} onValueChange={handleSubReportChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SUB_REPORT_LABELS) as InventorySubReport[]).map((key) => (
              <SelectItem key={key} value={key}>
                {SUB_REPORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Filters (hidden for status report) */}
      {showDateFilters && <ReportFilters filters={filters} onFiltersChange={setFilters} />}

      {/* Report Content */}
      {activeReport === 'status' && (
        <InventoryStatusReport data={statusData} loading={loading} />
      )}
      {activeReport === 'movement' && (
        <StockMovementReport data={movementData} loading={loading} />
      )}
      {activeReport === 'purchases' && (
        <PurchaseCostReport data={purchasesData} loading={loading} />
      )}
      {activeReport === 'waste' && <WasteReport data={wasteData} loading={loading} />}
      {activeReport === 'vendors' && (
        <VendorPerformanceReport data={vendorsData} loading={loading} />
      )}
    </div>
  )
}
