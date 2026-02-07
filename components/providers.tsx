"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        themes={["light", "dark"]}
        storageKey="restaurant-theme"
      >
        {children}
        <Toaster position="top-center" dir="rtl" />
      </ThemeProvider>
    </AuthProvider>
  )
}
