"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  IconUsers,
  IconTable,
  IconShoppingCart,
  IconPackage,
  IconTruck,
  IconReport,
  IconDashboard,
  IconInnerShadowTop,
  IconToolsKitchen2,
  IconHistory,
  IconBoxMultiple,
  IconTruckDelivery,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

const navSections = [
  {
    title: "الرئيسية",
    items: [
      {
        title: "لوحة التحكم",
        url: "/",
        icon: IconDashboard,
        roles: [], // All roles can access
      },
    ],
  },
  {
    title: "العمليات",
    items: [
      {
        title: "الطاولات",
        url: "/tables",
        icon: IconTable,
        roles: ['Admin', 'Manager', 'Waiter'],
      },
      {
        title: "الطلبات",
        url: "/orders",
        icon: IconShoppingCart,
        roles: ['Admin', 'Manager', 'Waiter'],
      },
      {
        title: "المطبخ",
        url: "/kitchen",
        icon: IconToolsKitchen2,
        roles: ['Admin', 'Kitchen'],
      },
    ],
  },
  {
    title: "الإدارة",
    items: [
      {
        title: "الأصناف",
        url: "/items",
        icon: IconPackage,
        roles: ['Admin', 'Manager'],
      },
      {
        title: "إدارة المستخدمين",
        url: "/users",
        icon: IconUsers,
        roles: ['Admin'],
      },
    ],
  },

  {
    title: "الخدمات",
    items: [
      {
        title: "التوصيل",
        url: "/deliveries",
        icon: IconTruck,
        roles: ['Admin', 'Delivery'],
      },
    ],
  },
  {
    title: "المخزون",
    items: [
      {
        title: "المخزون",
        url: "/inventory",
        icon: IconBoxMultiple,
        roles: ['Admin', 'Manager'],
      },
      {
        title: "الموردون",
        url: "/vendors",
        icon: IconTruckDelivery,
        roles: ['Admin', 'Manager'],
      },
    ],
  },

  {
    title: "التقارير والسجلات",
    items: [
      {
        title: "التقارير",
        url: "/reports",
        icon: IconReport,
        roles: ['Admin', 'Manager'],
      },
      {
        title: "سجلات النشاط",
        url: "/audit",
        icon: IconHistory,
        roles: ['Admin'],
      },
    ],
  },
]

const data = {
  teams: [
    {
      name: "مطعم",
      logo: IconInnerShadowTop,
      plan: "Premium",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  // Filter nav sections based on user roles
  const filteredNavSections = React.useMemo(() => {
    return navSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // If no roles specified, show to everyone
        if (!item.roles || item.roles.length === 0) {
          return true
        }

        // Show if user has any of the required roles
        return user?.roles?.some(role => item.roles.includes(role)) || false
      }).map(({ roles, ...item }) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    })).filter(section => section.items.length > 0) // Remove empty sections
  }, [user, isLoading, pathname])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <SidebarGroup>
            <SidebarMenu>
              {[...Array(6)].map((_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton disabled>
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-32" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <NavMain sections={filteredNavSections} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
