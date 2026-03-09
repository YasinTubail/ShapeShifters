import 'server-only'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export type AdminRole = 'owner' | 'editor'

export interface AdminUser {
  id: string
  username: string
  email: string
  passwordHash: string
  role: AdminRole
  createdAt: string
  lastLogin: string | null
  active: boolean
}

export interface ResetToken {
  token: string
  userId: string
  expiresAt: string
  used: boolean
}

const DATA_DIR = join(process.cwd(), 'data')

export function readAdminUsers(): AdminUser[] {
  try {
    const data = readFileSync(join(DATA_DIR, 'admin-users.json'), 'utf-8')
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch { /* fall through */ }
  return []
}

export function writeAdminUsers(users: AdminUser[]): void {
  writeFileSync(join(DATA_DIR, 'admin-users.json'), JSON.stringify(users, null, 2), 'utf-8')
}

export function readResetTokens(): ResetToken[] {
  try {
    const data = readFileSync(join(DATA_DIR, 'admin-resets.json'), 'utf-8')
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed)) return parsed
  } catch { /* fall through */ }
  return []
}

export function writeResetTokens(tokens: ResetToken[]): void {
  writeFileSync(join(DATA_DIR, 'admin-resets.json'), JSON.stringify(tokens, null, 2), 'utf-8')
}
