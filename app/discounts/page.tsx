'use client'

import { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { DiscountsTable } from '@/components/discounts-table'
import { DiscountForm } from '@/components/discount-form'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { apiClient } from '@/lib/api/client'
import { DISCOUNT_ENDPOINTS } from '@/lib/api/endpoints'
import type { Discount } from '@/lib/types/discount.types'

export default function DiscountsPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager', 'Cashier']}>
      <DiscountsPageContent />
    </AuthGuard>
  )
}

function DiscountsPageContent() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)

  // Fetch discounts on mount
  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<Discount[]>(DISCOUNT_ENDPOINTS.discounts)
      setDiscounts(data)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'فشل تحميل الخصومات'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingDiscount(null)
    setFormOpen(true)
  }

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(DISCOUNT_ENDPOINTS.discountById(id))
      toast.success('تم حذف الخصم بنجاح')
      fetchDiscounts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل حذف الخصم')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await apiClient.put(DISCOUNT_ENDPOINTS.toggleActive(id))
      toast.success('تم تحديث حالة الخصم بنجاح')
      fetchDiscounts()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'فشل تحديث حالة الخصم'
      )
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
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">الخصومات</h1>
              <p className="text-muted-foreground">إدارة الخصومات والعروض</p>
            </div>
            <Button onClick={handleAdd}>
              <IconPlus className="h-4 w-4 ml-2" />
              إضافة خصم
            </Button>
          </div>

          <DiscountsTable
            discounts={discounts}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />

          <DiscountForm
            discount={editingDiscount}
            open={formOpen}
            onOpenChange={setFormOpen}
            onSuccess={fetchDiscounts}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
