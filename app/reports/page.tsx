'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type ReportFilters as ReportFiltersType } from '@/lib/types/report.types'
import { ReportFilters } from '@/components/reports/report-filters'
import { SalesOverviewTab } from '@/components/reports/sales-overview-tab'
import { ItemsAnalysisTab } from '@/components/reports/items-analysis-tab'
import { RevenueBreakdownTab } from '@/components/reports/revenue-breakdown-tab'
import { StaffPerformanceTab } from '@/components/reports/staff-performance-tab'
import { TablesTurnoverTab } from '@/components/reports/tables-turnover-tab'
import { DiscountsUsageTab } from '@/components/reports/discounts-usage-tab'

export default function ReportsPage() {
  return (
    <AuthGuard requiredRoles={['Admin', 'Manager']}>
      <ReportsPageContent />
    </AuthGuard>
  )
}

function ReportsPageContent() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: '7days',
    page: 1,
    limit: 50,
  })

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
          <div>
            <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
            <p className="text-muted-foreground mt-1">
              تحليل شامل لأداء المطعم ومبيعاته
            </p>
          </div>

          {/* Global Filters */}
          <ReportFilters filters={filters} onFiltersChange={setFilters} />

          {/* Tabs for Different Reports */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="sales">المبيعات</TabsTrigger>
              <TabsTrigger value="items">الأصناف</TabsTrigger>
              <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
              <TabsTrigger value="staff">الموظفين</TabsTrigger>
              <TabsTrigger value="tables">الطاولات</TabsTrigger>
              <TabsTrigger value="discounts">الخصومات</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <SalesOverviewTab filters={filters} />
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <ItemsAnalysisTab filters={filters} />
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <RevenueBreakdownTab filters={filters} />
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <StaffPerformanceTab filters={filters} />
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              <TablesTurnoverTab filters={filters} />
            </TabsContent>

            <TabsContent value="discounts" className="space-y-4">
              <DiscountsUsageTab filters={filters} />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
