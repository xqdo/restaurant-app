'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { AuthGuard } from '@/components/auth-guard'
import { UserForm } from '@/components/user-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default function UsersPage() {
  const [open, setOpen] = useState(false)

  return (
    <AuthGuard requiredRoles={['Admin']}>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
                <p className="text-muted-foreground">
                  إنشاء حسابات المستخدمين الجدد
                </p>
              </div>
              <Button onClick={() => setOpen(true)}>
                إضافة مستخدم جديد
              </Button>
            </div>

            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <div className="space-y-2">
                  <p className="text-lg">
                    لا يوجد عرض لقائمة المستخدمين حالياً
                  </p>
                  <p className="text-sm">
                    استخدم زر "إضافة مستخدم جديد" لإنشاء حسابات جديدة
                  </p>
                </div>
              </CardContent>
            </Card>

            <UserForm open={open} onOpenChange={setOpen} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
