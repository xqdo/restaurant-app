'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { REPORTS_ENDPOINTS } from '@/lib/api/endpoints'
import { type ReportFilters, type TopItemsReportDto } from '@/lib/types/report.types'
import { TopItemsChart } from './top-items-chart'

interface ItemsAnalysisTabProps {
  filters: ReportFilters
}

export function ItemsAnalysisTab({ filters }: ItemsAnalysisTabProps) {
  const [topSellingData, setTopSellingData] = useState<TopItemsReportDto | null>(null)
  const [slowMovingData, setSlowMovingData] = useState<TopItemsReportDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams()
      params.append('limit', '10')

      if (filters.period !== 'custom') {
        params.append('period', filters.period)
      }

      // Fetch top-selling and slow-moving items in parallel
      const [topSelling, slowMoving] = await Promise.all([
        apiClient.get<TopItemsReportDto>(
          `${REPORTS_ENDPOINTS.topSelling}?${params.toString()}`
        ),
        apiClient.get<TopItemsReportDto>(
          `${REPORTS_ENDPOINTS.slowMoving}?${params.toString()}`
        ),
      ])

      setTopSellingData(topSelling)
      setSlowMovingData(slowMoving)
    } catch (error) {
      toast.error('فشل تحميل تقرير الأصناف')
      console.error('Failed to fetch items report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <TopItemsChart
        title="الأصناف الأكثر مبيعاً"
        description="الأصناف ذات الطلب الأعلى"
        data={topSellingData?.items}
        loading={loading}
        type="top"
      />

      <TopItemsChart
        title="الأصناف بطيئة الحركة"
        description="الأصناف ذات الطلب المنخفض"
        data={slowMovingData?.items}
        loading={loading}
        type="slow"
      />
    </div>
  )
}
