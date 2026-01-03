"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/contexts/auth-context"

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
      </ThemeProvider>
    </AuthProvider>
  )
}
