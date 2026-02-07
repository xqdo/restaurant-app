'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconDots } from '@tabler/icons-react'
import { toast } from 'sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { VendorForm } from '@/components/vendors/vendor-form'
import { apiClient } from '@/lib/api/client'
import { VENDOR_ENDPOINTS } from '@/lib/api/endpoints'
import { type Vendor } from '@/lib/types/vendor.types'

function buildQuery(params: Record<string, string | undefined>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

export default function VendorsPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager']}>
      <VendorsPageContent />
    </AuthGuard>
  )
}

function VendorsPageContent() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const isFirstRender = useRef(true)
  const fetchRef = useRef<(search?: string) => void>(() => {})

  const fetchVendors = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      const query = buildQuery({ search: search || undefined })
      const data = await apiClient.get<Vendor[]>(VENDOR_ENDPOINTS.vendors + query)
      setVendors(data || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تحميل الموردين')
    } finally {
      setLoading(false)
    }
  }, [])

  fetchRef.current = fetchVendors

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      fetchRef.current(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleAdd = () => {
    setEditingVendor(null)
    setFormOpen(true)
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormOpen(true)
  }

  const handleDelete = async (vendor: Vendor) => {
    if (!confirm(`هل أنت متأكد من حذف "${vendor.name}"؟`)) return

    try {
      await apiClient.delete(VENDOR_ENDPOINTS.vendorById(vendor.id))
      toast.success('تم حذف المورد بنجاح')
      fetchVendors(search)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل حذف المورد')
    }
  }

  const handleSuccess = () => {
    fetchVendors(search)
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
              <h1 className="text-3xl font-bold">الموردون</h1>
              <p className="text-muted-foreground mt-1">
                إدارة الموردين والمزودين
              </p>
            </div>
            <Button onClick={handleAdd}>
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">إضافة مورد</span>
            </Button>
          </div>

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

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">لا يوجد موردون</h3>
                <p className="text-muted-foreground max-w-sm">
                  {search
                    ? 'لا توجد نتائج مطابقة للبحث.'
                    : 'ابدأ بإضافة مورد جديد لإدارة الموردين والمشتريات.'}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">ملاحظات</TableHead>
                  <TableHead className="text-right w-[50px]">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium text-right">
                      {vendor.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {vendor.phone || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {vendor.address || '—'}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {vendor.notes || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <IconDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="text-right">
                          <DropdownMenuLabel className="text-right">الإجراءات</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                            <IconEdit className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(vendor)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <IconTrash className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Form */}
        <VendorForm
          vendor={editingVendor}
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={handleSuccess}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
