/**
 * Authentication Type Definitions
 * Matches the OpenAPI schema from external backend API
 */

export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  fullname: string
  username: string
  password: string
  roleIds: number[]
  is_active?: boolean
}

export interface User {
  id: number
  fullname: string
  username: string
  is_active: boolean
  roles: string[]
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface UserListItem {
  id: number
  fullname: string
  username: string
  is_active: boolean
  roles: string[]
  role_ids: number[]
  created_at: string
}

export interface UpdateUserDto {
  fullname?: string
  roleIds?: number[]
  is_active?: boolean
}

export interface ResetPasswordDto {
  password: string
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}
