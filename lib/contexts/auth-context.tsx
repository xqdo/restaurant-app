'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User, LoginDto, AuthResponse } from '@/lib/types/auth.types'
import { apiClient } from '@/lib/api/client'
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  /**
   * Validate existing token and fetch user profile
   */
  const validateToken = async (token: string) => {
    try {
      const userData = await apiClient.get<User>(AUTH_ENDPOINTS.me)
      setUser(userData)
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('auth-token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Auto-login on app load if token exists
   */
  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      validateToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  /**
   * Login with username and password
   */
  const login = async (username: string, password: string) => {
    const loginDto: LoginDto = { username, password }
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.login,
      loginDto
    )

    // Store token and user data
    localStorage.setItem('auth-token', response.access_token)
    setUser(response.user)
  }

  /**
   * Logout and clear session
   */
  const logout = () => {
    localStorage.removeItem('auth-token')
    setUser(null)
    router.push('/login')
  }

  /**
   * Refresh user profile from server
   */
  const refreshUser = async () => {
    try {
      const userData = await apiClient.get<User>(AUTH_ENDPOINTS.me)
      setUser(userData)
    } catch (error) {
      // If refresh fails, logout
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
