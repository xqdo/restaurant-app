'use client'

import { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api/client'
import { TABLE_ENDPOINTS } from '@/lib/api/endpoints'
import type { Table, TableStatus } from '@/lib/types/table.types'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { TableGrid } from '@/components/table-grid'
import { TableForm } from '@/components/table-form'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TablesPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager', 'Waiter']}>
      <TablesPageContent />
    </AuthGuard>
  )
}

function TablesPageContent() {
  const { user } = useAuth()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'ALL' | TableStatus>('ALL')

  // Check if user can manage tables (Manager/Admin)
  const canManage = user?.roles.some(role => ['Admin', 'Manager'].includes(role)) ?? false

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<Table[]>(TABLE_ENDPOINTS.tables)
      setTables(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تحميل الطاولات')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (tableId: number, newStatus: TableStatus) => {
    try {
      await apiClient.patch(TABLE_ENDPOINTS.updateStatus(tableId), { status: newStatus })
      toast.success('تم تحديث حالة الطاولة')
      fetchTables() // Refresh list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تحديث الحالة')
    }
  }

  const handleDelete = async (tableId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الطاولة؟')) return

    try {
      await apiClient.delete(TABLE_ENDPOINTS.byId(tableId))
      toast.success('تم حذف الطاولة')
      fetchTables()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل حذف الطاولة')
    }
  }

  // Filter tables by status for display
  const filteredTables = statusFilter === 'ALL'
    ? tables
    : tables.filter(t => t.status === statusFilter)

  // Calculate counts for each status
  const counts = {
    all: tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    reserved: tables.filter(t => t.status === 'RESERVED').length,
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
              <h1 className="text-3xl font-bold">الطاولات</h1>
              <p className="text-muted-foreground mt-1">
                إدارة طاولات المطعم وحالتها
              </p>
            </div>
            {canManage && (
              <Button onClick={() => setFormOpen(true)}>
                <IconPlus className="ml-2 h-4 w-4" />
                <span className="hidden sm:inline">إضافة طاولة</span>
                <span className="sm:hidden">إضافة</span>
              </Button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="ALL">الكل ({counts.all})</TabsTrigger>
              <TabsTrigger value="AVAILABLE">
                🟢 متاح ({counts.available})
              </TabsTrigger>
              <TabsTrigger value="OCCUPIED">
                🔴 مشغول ({counts.occupied})
              </TabsTrigger>
              <TabsTrigger value="RESERVED">
                🟡 محجوز ({counts.reserved})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredTables.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-semibold">لا توجد طاولات</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                {statusFilter === 'ALL'
                  ? 'ابدأ بإضافة طاولة جديدة'
                  : `لا توجد طاولات بحالة "${
                      statusFilter === 'AVAILABLE'
                        ? 'متاح'
                        : statusFilter === 'OCCUPIED'
                        ? 'مشغول'
                        : 'محجوز'
                    }"`}
              </p>
              {canManage && statusFilter === 'ALL' && (
                <Button onClick={() => setFormOpen(true)} className="mt-4">
                  <IconPlus className="ml-2 h-4 w-4" />
                  إضافة أول طاولة
                </Button>
              )}
            </div>
          )}

          {/* Tables Grid */}
          {!loading && filteredTables.length > 0 && (
            <TableGrid
              tables={filteredTables}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              canManage={canManage}
            />
          )}
        </div>

        {/* Create Table Form */}
        {canManage && (
          <TableForm
            open={formOpen}
            onOpenChange={setFormOpen}
            onSuccess={fetchTables}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
