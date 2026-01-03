/**
 * Audit Logs Page
 * Admin-only page for viewing system activity logs
 */

'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { LogFilters } from '@/components/log-filters'
import { AuditLogTable } from '@/components/audit-log-table'
import { LogDetailDialog } from '@/components/log-detail-dialog'
import { Button } from '@/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { getAllAuditLogs } from '@/lib/services/audit.service'
import type {
  AuditLog,
  AuditLogFilters,
} from '@/lib/types/audit.types'

export default function AuditPage() {
  return (
    <AuthGuard requiredRoles={['Admin']}>
      <AuditPageContent />
    </AuthGuard>
  )
}

function AuditPageContent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  })

  // Detail dialog state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Fetch logs on mount and when filters change
  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await getAllAuditLogs(filters)

      setLogs(response.logs || [])
      setPagination({
        total: response.total,
        totalPages: response.totalPages,
      })
    } catch (error) {
      toast.error('فشل تحميل سجلات النشاط')
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters)
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailDialogOpen(true)
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
              <h1 className="text-3xl font-bold">سجلات النشاط</h1>
              <p className="text-muted-foreground mt-1">
                عرض جميع أنشطة النظام والمستخدمين
              </p>
            </div>
          </div>

          {/* Filters */}
          <LogFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Audit Logs Table */}
          <AuditLogTable
            logs={logs}
            loading={loading}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                إجمالي السجلات: {pagination.total} | الصفحة {filters.page || 1}{' '}
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

        {/* Log Detail Dialog */}
        <LogDetailDialog
          log={selectedLog}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
