'use client'

import { useEffect, useState } from 'react'
import { IconRefresh, IconChefHat } from '@tabler/icons-react'
import { toast } from 'sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { KitchenDisplay } from '@/components/kitchen-display'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { apiClient } from '@/lib/api/client'
import { KITCHEN_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  KitchenPendingItem,
  KitchenReceiptGroup,
} from '@/lib/types/kitchen.types'
import { formatDateTime } from '@/lib/utils/date'

export default function KitchenPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Kitchen']}>
      <KitchenPageContent />
    </AuthGuard>
  )
}

function KitchenPageContent() {
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped')
  const [listData, setListData] = useState<KitchenPendingItem[]>([])
  const [groupedData, setGroupedData] = useState<KitchenReceiptGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Fetch kitchen data
  const fetchKitchenData = async (silent = false) => {
    try {
      // Only show loading spinner on initial load or manual refresh
      if (!silent) {
        setLoading(true)
      }

      const endpoint =
        viewMode === 'list'
          ? KITCHEN_ENDPOINTS.pending
          : KITCHEN_ENDPOINTS.byTable

      const data = await apiClient.get<
        KitchenPendingItem[] | KitchenReceiptGroup[]
      >(endpoint)

      if (viewMode === 'list') {
        setListData(data as KitchenPendingItem[])
      } else {
        setGroupedData(data as KitchenReceiptGroup[])
      }

      setLastRefresh(new Date())
    } catch (error) {
      // Only show toast on manual refresh, silent fail on auto-refresh
      if (!silent) {
        toast.error('فشل تحميل بيانات المطبخ')
      }
      console.error('Failed to fetch kitchen data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on mount and when view mode changes
  useEffect(() => {
    fetchKitchenData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchKitchenData(true) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [viewMode])

  const handleManualRefresh = () => {
    fetchKitchenData(false)
  }

  const handleRefresh = () => {
    fetchKitchenData(true)
  }

  // Calculate counts
  const listCount = listData.length
  const groupedCount = groupedData.length

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" side="right" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <IconChefHat className="h-8 w-8" />
                المطبخ
              </h1>
              <p className="text-muted-foreground mt-1">
                إدارة الطلبات وتحديث حالة التحضير
              </p>
            </div>
            <div className="flex items-center gap-2">
              {lastRefresh && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  آخر تحديث: {formatDateTime(lastRefresh.toISOString())}
                </span>
              )}
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <IconRefresh
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline mr-1">تحديث</span>
              </Button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'list' | 'grouped')}
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="grouped">
                مجموعة حسب الطلب ({groupedCount})
              </TabsTrigger>
              <TabsTrigger value="list">قائمة ({listCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            ((viewMode === 'list' && listCount === 0) ||
              (viewMode === 'grouped' && groupedCount === 0)) && (
              <div className="border rounded-lg p-12 text-center">
                <IconChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  لا توجد طلبات في انتظار التحضير
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  سيتم تحديث القائمة تلقائياً كل 30 ثانية
                </p>
              </div>
            )}

          {/* Kitchen Display */}
          {!loading &&
            ((viewMode === 'list' && listCount > 0) ||
              (viewMode === 'grouped' && groupedCount > 0)) && (
              <KitchenDisplay
                viewMode={viewMode}
                listData={listData}
                groupedData={groupedData}
                onRefresh={handleRefresh}
              />
            )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
