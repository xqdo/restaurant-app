"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconUsers,
  IconTable,
  IconShoppingCart,
  IconPackage,
  IconDiscount,
  IconTruck,
  IconReport,
  IconDashboard,
  IconInnerShadowTop,
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
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "لوحة التحكم",
    url: "/",
    icon: IconDashboard,
  },
  {
    title: "الطاولات",
    url: "/tables",
    icon: IconTable,
  },
  {
    title: "الطلبات",
    url: "/orders",
    icon: IconShoppingCart,
  },
  {
    title: "الأصناف",
    url: "/items",
    icon: IconPackage,
  },
  {
    title: "الخصومات",
    url: "/discounts",
    icon: IconDiscount,
  },
  {
    title: "إدارة المستخدمين",
    url: "/users",
    icon: IconUsers,
  },
  {
    title: "التوصيل",
    url: "/deliveries",
    icon: IconTruck,
  },
  {
    title: "التقارير",
    url: "/reports",
    icon: IconReport,
  },
]

const data = {
  user: {
    name: "أحمد محمد",
    email: "manager@restaurant.com",
    avatar: "/avatars/shadcn.jpg",
  },
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

  const navMain = navItems.map(item => ({
    ...item,
    isActive: pathname === item.url,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
