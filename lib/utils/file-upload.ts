import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'images')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 10)
  const extension = path.extname(originalName)
  const nameWithoutExt = path
    .basename(originalName, extension)
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()

  return `${timestamp}-${randomString}-${nameWithoutExt}${extension}`
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Save file to disk
 */
export async function saveFile(
  file: File,
  filename: string
): Promise<string> {
  await ensureUploadDir()

  const buffer = Buffer.from(await file.arrayBuffer())
  const filepath = path.join(UPLOAD_DIR, filename)

  await writeFile(filepath, buffer)

  return getPublicPath(filename)
}

/**
 * Delete file from disk
 */
export async function deleteFile(relativePath: string): Promise<void> {
  try {
    // Convert relative path to absolute
    const filename = path.basename(relativePath)
    const filepath = path.join(UPLOAD_DIR, filename)

    if (existsSync(filepath)) {
      await unlink(filepath)
    }
  } catch (error) {
    // Log error but don't throw - file may already be deleted
    console.error('Error deleting file:', error)
  }
}

/**
 * Get public path for database storage
 */
export function getPublicPath(filename: string): string {
  return `/uploads/images/${filename}`
}
