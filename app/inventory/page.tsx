'use client'

import { useEffect, useState, useCallback } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StorageItemsTab } from '@/components/storage/storage-items-tab'
import { StorageEntriesTab } from '@/components/storage/storage-entries-tab'
import { StorageUsagesTab } from '@/components/storage/storage-usages-tab'
import { StorageItemForm } from '@/components/storage/storage-item-form'
import { StorageEntryForm } from '@/components/storage/storage-entry-form'
import { StorageUsageForm } from '@/components/storage/storage-usage-form'
import { apiClient } from '@/lib/api/client'
import { STORAGE_ENDPOINTS } from '@/lib/api/endpoints'
import { type StorageItem, type StorageEntry, type StorageUsage } from '@/lib/types/storage.types'

export interface EntryFilters {
  storage_item_id?: number
  supplier?: string
}

export interface UsageFilters {
  storage_item_id?: number
  reason?: string
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

export default function InventoryPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager']}>
      <InventoryPageContent />
    </AuthGuard>
  )
}

function InventoryPageContent() {
  const [activeTab, setActiveTab] = useState('items')

  // Data
  const [items, setItems] = useState<StorageItem[]>([])
  const [entries, setEntries] = useState<StorageEntry[]>([])
  const [usages, setUsages] = useState<StorageUsage[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [loadingUsages, setLoadingUsages] = useState(true)

  // Filter states
  const [itemSearch, setItemSearch] = useState('')
  const [entryFilters, setEntryFilters] = useState<EntryFilters>({})
  const [usageFilters, setUsageFilters] = useState<UsageFilters>({})

  // Form states
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [entryFormOpen, setEntryFormOpen] = useState(false)
  const [usageFormOpen, setUsageFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null)
  const [preselectedItemId, setPreselectedItemId] = useState<number | undefined>()

  // Fetch items (with search filter)
  const fetchItems = useCallback(async (search?: string) => {
    try {
      setLoadingItems(true)
      const query = buildQuery({ search: search || undefined })
      const data = await apiClient.get<StorageItem[]>(STORAGE_ENDPOINTS.items + query)
      setItems(data || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تحميل المواد')
    } finally {
      setLoadingItems(false)
    }
  }, [])

  // Fetch entries (with filters)
  const fetchEntries = useCallback(async (filters?: EntryFilters) => {
    try {
      setLoadingEntries(true)
      const query = buildQuery({
        storage_item_id: filters?.storage_item_id,
        supplier: filters?.supplier || undefined,
      })
      const data = await apiClient.get<StorageEntry[]>(STORAGE_ENDPOINTS.entries + query)
      setEntries(data || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تحميل الإدخالات')
    } finally {
      setLoadingEntries(false)
    }
  }, [])

  // Fetch usages (with filters)
  const fetchUsages = useCallback(async (filters?: UsageFilters) => {
    try {
      setLoadingUsages(true)
      const query = buildQuery({
        storage_item_id: filters?.storage_item_id,
        reason: filters?.reason || undefined,
      })
      const data = await apiClient.get<StorageUsage[]>(STORAGE_ENDPOINTS.usages + query)
      setUsages(data || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تحميل عمليات الصرف')
    } finally {
      setLoadingUsages(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchItems()
    fetchEntries()
    fetchUsages()
  }, [fetchItems, fetchEntries, fetchUsages])

  const refreshAll = () => {
    fetchItems(itemSearch)
    fetchEntries(entryFilters)
    fetchUsages(usageFilters)
  }

  // Filter handlers
  const handleItemSearch = useCallback((search: string) => {
    setItemSearch(search)
    fetchItems(search)
  }, [fetchItems])

  const handleEntryFiltersChange = (filters: EntryFilters) => {
    setEntryFilters(filters)
    fetchEntries(filters)
  }

  const handleUsageFiltersChange = (filters: UsageFilters) => {
    setUsageFilters(filters)
    fetchUsages(filters)
  }

  // Item handlers
  const handleAddItem = () => {
    setEditingItem(null)
    setItemFormOpen(true)
  }

  const handleEditItem = (item: StorageItem) => {
    setEditingItem(item)
    setItemFormOpen(true)
  }

  const handleDeleteItem = async (item: StorageItem) => {
    if (!confirm(`هل أنت متأكد من حذف "${item.name}"؟`)) return

    try {
      await apiClient.delete(STORAGE_ENDPOINTS.itemById(item.id))
      toast.success('تم حذف المادة بنجاح')
      refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل حذف المادة')
    }
  }

  // Entry/Usage handlers
  const handleAddEntry = (itemId?: number) => {
    setPreselectedItemId(itemId)
    setEntryFormOpen(true)
  }

  const handleEntryOpenChange = (open: boolean) => {
    setEntryFormOpen(open)
    if (!open) setPreselectedItemId(undefined)
  }

  const handleAddUsage = (itemId?: number) => {
    setPreselectedItemId(itemId)
    setUsageFormOpen(true)
  }

  const handleUsageOpenChange = (open: boolean) => {
    setUsageFormOpen(open)
    if (!open) setPreselectedItemId(undefined)
  }

  const handleDeleteEntry = async (entry: StorageEntry) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإدخال؟')) return

    try {
      await apiClient.delete(STORAGE_ENDPOINTS.entryById(entry.id))
      toast.success('تم حذف الإدخال بنجاح')
      refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل حذف الإدخال')
    }
  }

  const handleDeleteUsage = async (usage: StorageUsage) => {
    if (!confirm('هل أنت متأكد من حذف عملية الصرف؟')) return

    try {
      await apiClient.delete(STORAGE_ENDPOINTS.usageById(usage.id))
      toast.success('تم حذف عملية الصرف بنجاح')
      refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل حذف عملية الصرف')
    }
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

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">المخزون</h1>
              <p className="text-muted-foreground mt-1">
                إدارة المواد والمخزون
              </p>
            </div>
            <Button onClick={handleAddItem}>
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">إضافة مادة</span>
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto" dir="rtl">
              <TabsTrigger value="items">المواد</TabsTrigger>
              <TabsTrigger value="entries">الإدخالات</TabsTrigger>
              <TabsTrigger value="usages">الصرف</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="mt-4">
              <StorageItemsTab
                items={items}
                loading={loadingItems}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onAddEntry={handleAddEntry}
                onAddUsage={handleAddUsage}
                onSearch={handleItemSearch}
              />
            </TabsContent>

            <TabsContent value="entries" className="mt-4">
              <StorageEntriesTab
                entries={entries}
                storageItems={items}
                loading={loadingEntries}
                onDelete={handleDeleteEntry}
                onFiltersChange={handleEntryFiltersChange}
                onAddEntry={() => handleAddEntry()}
              />
            </TabsContent>

            <TabsContent value="usages" className="mt-4">
              <StorageUsagesTab
                usages={usages}
                storageItems={items}
                loading={loadingUsages}
                onDelete={handleDeleteUsage}
                onFiltersChange={handleUsageFiltersChange}
                onAddUsage={() => handleAddUsage()}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Forms */}
        <StorageItemForm
          item={editingItem}
          open={itemFormOpen}
          onOpenChange={setItemFormOpen}
          onSuccess={refreshAll}
        />

        <StorageEntryForm
          storageItems={items}
          preselectedItemId={preselectedItemId}
          open={entryFormOpen}
          onOpenChange={handleEntryOpenChange}
          onSuccess={refreshAll}
        />

        <StorageUsageForm
          storageItems={items}
          preselectedItemId={preselectedItemId}
          open={usageFormOpen}
          onOpenChange={handleUsageOpenChange}
          onSuccess={refreshAll}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
