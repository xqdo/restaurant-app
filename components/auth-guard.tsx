'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface AuthGuardProps {
  children: ReactNode
  requiredRoles?: string[]
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) {
      return
    }

    // Not authenticated - redirect to login with return URL
    if (!isAuthenticated) {
      const returnUrl = pathname
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) =>
        user?.roles?.includes(role)
      )

      if (!hasRequiredRole) {
        // User doesn't have required role - show 403 error
        router.push('/403')
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, requiredRoles])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - don't render children (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user?.roles?.includes(role)
    )

    if (!hasRequiredRole) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">403</h1>
            <p className="text-xl mb-2">غير مصرح</p>
            <p className="text-muted-foreground">
              ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              الأدوار المطلوبة: {requiredRoles.join(', ')}
            </p>
          </div>
        </div>
      )
    }
  }

  // All checks passed - render children
  return <>{children}</>
}
