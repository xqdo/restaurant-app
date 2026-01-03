/**
 * Menu Type Definitions
 * For menu items and sections from external backend API
 */

// Menu section
export interface MenuSection {
  id: number
  name: string
  created_at: string
  updated_at?: string
  item_count?: number
}

// Menu item (from GET /menu/items)
export interface MenuItem {
  id: number
  name: string
  price: string // Decimal as string
  section_id: number
  section_name: string
  description?: string
  image_path?: string
  created_at: string
  updated_at?: string
}

// Grouped menu items by section (for UI)
export interface MenuItemsBySection {
  section: MenuSection
  items: MenuItem[]
}
