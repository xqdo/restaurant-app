'use client'

import { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api/client'
import { DELIVERY_ENDPOINTS } from '@/lib/api/endpoints'
import type { DeliveryGuy, DeliveryGuyStats } from '@/lib/types/delivery.types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DriverCard } from '@/components/driver-card'
import { DriverForm } from '@/components/driver-form'

export function DriverList() {
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<DeliveryGuy[]>([])
  const [driverStats, setDriverStats] = useState<Map<number, DeliveryGuyStats>>(
    new Map()
  )
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<DeliveryGuy | null>(null)

  // Check if user can manage drivers (Admin/Manager)
  const canManage =
    user?.roles.some((role) => ['Admin', 'Manager'].includes(role)) ?? false

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<DeliveryGuy[]>(
        DELIVERY_ENDPOINTS.drivers
      )
      // Filter out deleted drivers
      const activeDrivers = data.filter((d) => !d.isdeleted)
      setDrivers(activeDrivers)

      // Fetch stats for each driver
      await fetchDriverStats(activeDrivers)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'فشل تحميل السائقين'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchDriverStats = async (driverList: DeliveryGuy[]) => {
    const statsMap = new Map<number, DeliveryGuyStats>()

    await Promise.all(
      driverList.map(async (driver) => {
        try {
          const stats = await apiClient.get<DeliveryGuyStats>(
            DELIVERY_ENDPOINTS.driverStats(driver.id)
          )
          statsMap.set(driver.id, stats)
        } catch (error) {
          // Silently fail for individual stats - not critical
          console.error(`Failed to fetch stats for driver ${driver.id}:`, error)
        }
      })
    )

    setDriverStats(statsMap)
  }

  const handleDelete = async (driverId: number) => {
    try {
      await apiClient.delete(DELIVERY_ENDPOINTS.driverById(driverId))
      toast.success('تم حذف السائق')
      fetchDrivers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل حذف السائق')
    }
  }

  const handleEdit = (driver: DeliveryGuy) => {
    setEditingDriver(driver)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchDrivers()
    setEditingDriver(null)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setEditingDriver(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">السائقين</h2>
          <p className="text-muted-foreground">
            إدارة سائقي التوصيل ومتابعة أداءهم
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setFormOpen(true)}>
            <IconPlus className="ml-2 h-4 w-4" />
            إضافة سائق
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && drivers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">لا يوجد سائقين</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            ابدأ بإضافة أول سائق لإدارة توصيلات المطعم
          </p>
          {canManage && (
            <Button onClick={() => setFormOpen(true)} className="mt-4">
              <IconPlus className="ml-2 h-4 w-4" />
              إضافة أول سائق
            </Button>
          )}
        </div>
      )}

      {/* Driver Grid */}
      {!loading && drivers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {drivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              stats={driverStats.get(driver.id) || null}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      {/* Driver Form */}
      <DriverForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
        driver={editingDriver}
      />
    </div>
  )
}
