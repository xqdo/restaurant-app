'use client'

import { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { OrderForm } from '@/components/order-form'
import { OrderFilters } from '@/components/order-filters'
import { ReceiptsTable } from '@/components/receipts-table'
import { OrderDetailDrawer } from '@/components/order-detail-drawer'
import { Button } from '@/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { apiClient } from '@/lib/api/client'
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  ReceiptListItem,
  ReceiptQueryFilters,
  PaginatedReceiptsResponse,
  OrderStatus,
  ReceiptItemStatus,
} from '@/lib/types/receipt.types'

export default function OrdersPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager', 'Waiter']}>
      <OrdersPageContent />
    </AuthGuard>
  )
}

function OrdersPageContent() {
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReceiptQueryFilters>({
    completed: false,
    page: 1,
    perPage: 10,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  })

  // Form and detail states
  const [formOpen, setFormOpen] = useState(false)
  const [detailReceiptId, setDetailReceiptId] = useState<number | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)

  // Fetch receipts on mount and when filters change
  useEffect(() => {
    fetchReceipts()
  }, [filters])

  const fetchReceipts = async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams()
      if (filters.completed !== undefined) {
        params.append('completed', filters.completed.toString())
      }
      if (filters.table_id) {
        params.append('table_id', filters.table_id.toString())
      }
      if (filters.is_delivery !== undefined) {
        params.append('is_delivery', filters.is_delivery.toString())
      }
      if (filters.start_date) {
        params.append('start_date', filters.start_date)
      }
      if (filters.end_date) {
        params.append('end_date', filters.end_date)
      }
      params.append('page', (filters.page || 1).toString())
      params.append('perPage', (filters.perPage || 10).toString())

      const endpoint = `${ORDER_ENDPOINTS.receipts}?${params.toString()}`
      const response = await apiClient.get<any>(endpoint)

      console.log('Raw API Response:', response)
      console.log('Response.data:', response.data)
      console.log('Response.meta:', response.meta)

      // Derive overall order status from item statuses and completed_at
      const deriveOrderStatus = (backendReceipt: any): OrderStatus => {
        if (backendReceipt.completed_at) return 'completed'

        const items = backendReceipt.receiptItems || []
        if (items.length === 0) return 'pending'

        const statuses: ReceiptItemStatus[] = items.map((i: any) => i.status)

        if (statuses.every((s) => s === 'done')) return 'done'
        if (statuses.some((s) => s === 'ready')) return 'ready'
        if (statuses.some((s) => s === 'preparing')) return 'preparing'
        return 'pending'
      }

      // Transform backend data to match ReceiptListItem interface
      const transformReceipt = (backendReceipt: any): ReceiptListItem => {
        return {
          id: backendReceipt.id,
          number: backendReceipt.number,
          is_delivery: backendReceipt.is_delivery,
          phone_number: backendReceipt.phone_number,
          location: backendReceipt.location,
          table: backendReceipt.table ? {
            id: backendReceipt.table.id,
            number: backendReceipt.table.number,
            status: backendReceipt.table.status,
          } : undefined,
          created_by_name: backendReceipt.baseEntity?.createdByUser?.fullname || 'غير معروف',
          created_at: backendReceipt.baseEntity?.created_at || '',
          total: '0',
          item_count: (backendReceipt.receiptItems || []).length,
          order_status: deriveOrderStatus(backendReceipt),
        }
      }

      const receiptsData = (response.data || []).map(transformReceipt)
      console.log('Final receiptsData:', receiptsData)

      const meta = {
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 0,
      }

      setReceipts(receiptsData)
      setPagination(meta)
    } catch (error) {
      toast.error('فشل تحميل الطلبات')
      console.error('Failed to fetch receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: ReceiptQueryFilters) => {
    setFilters(newFilters)
  }

  const handleViewDetails = (receiptId: number) => {
    setDetailReceiptId(receiptId)
    setDetailDrawerOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage })
  }

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
              <h1 className="text-3xl font-bold">الطلبات</h1>
              <p className="text-muted-foreground mt-1">
                إدارة طلبات المطعم والفواتير
              </p>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">طلب جديد</span>
            </Button>
          </div>

          {/* Filters */}
          <OrderFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Receipts Table */}
          <ReceiptsTable
            receipts={receipts}
            loading={loading}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                إجمالي النتائج: {pagination.total} | الصفحة {filters.page || 1}{' '}
                من {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={!filters.page || filters.page <= 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={
                    !filters.page || filters.page >= pagination.totalPages
                  }
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Form Drawer */}
        <OrderForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={fetchReceipts}
        />

        {/* Order Detail Drawer */}
        <OrderDetailDrawer
          receiptId={detailReceiptId}
          open={detailDrawerOpen}
          onOpenChange={setDetailDrawerOpen}
          onUpdate={fetchReceipts}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
