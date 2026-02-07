export interface Vendor {
  id: number
  name: string
  phone?: string | null
  address?: string | null
  notes?: string | null
  base_entity_id: number
  baseEntity?: {
    created_at: string
    created_by: number
    updated_at?: string | null
    createdByUser?: { id: number; fullname: string }
  }
}

export interface CreateVendorDto {
  name: string
  phone?: string
  address?: string
  notes?: string
}

export interface UpdateVendorDto {
  name?: string
  phone?: string
  address?: string
  notes?: string
}
