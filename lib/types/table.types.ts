/**
 * Table Type Definitions
 * Matches the OpenAPI schema from external backend API
 */

// Table status enum
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'

// Main Table entity (response from GET /tables, GET /tables/{id})
export interface Table {
  id: number
  number: number
  status: TableStatus
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

// DTO for creating a new table (POST /tables)
export interface CreateTableDto {
  number: number
}

// DTO for updating table status (PATCH /tables/{id}/status)
export interface UpdateTableStatusDto {
  status: TableStatus
}
