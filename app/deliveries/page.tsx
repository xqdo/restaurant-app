'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DriverList } from '@/components/driver-list'
import { DeliveryReceiptsList } from '@/components/delivery-receipts-list'
import { DriverSettlementView } from '@/components/driver-settlement-view'

export default function DeliveriesPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager', 'Delivery']}>
      <DeliveriesPageContent />
    </AuthGuard>
  )
}

function DeliveriesPageContent() {
  const [activeTab, setActiveTab] = useState('drivers')

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
          <div className="text-right">
            <h1 className="text-3xl font-bold">التوصيل</h1>
            <p className="text-muted-foreground mt-1">
              إدارة السائقين وطلبات التوصيل والتسويات
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto" dir="rtl">
              <TabsTrigger value="drivers">السائقين</TabsTrigger>
              <TabsTrigger value="deliveries">طلبات التوصيل</TabsTrigger>
              <TabsTrigger value="settlements">التسويات</TabsTrigger>
            </TabsList>

            {/* Drivers Tab */}
            <TabsContent value="drivers" className="mt-4">
              <DriverList />
            </TabsContent>

            {/* Delivery Orders Tab */}
            <TabsContent value="deliveries" className="mt-4">
              <DeliveryReceiptsList />
            </TabsContent>

            {/* Settlements Tab */}
            <TabsContent value="settlements" className="mt-4">
              <DriverSettlementView />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
