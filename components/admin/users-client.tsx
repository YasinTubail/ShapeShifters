"use client"

import { useState } from 'react'
import { UserPlus, Trash2, Shield, User, Mail, KeyRound, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import {
  createAdminUser,
  deleteAdminUser,
  updateAdminUserRole,
  updateAdminUserEmail,
  resetAdminUserPassword,
} from '@/app/actions/admin'
import type { AdminUser } from '@/lib/admin-users'

interface Props {
  users: AdminUser[]
  currentUserId: string
}

export function UsersClient({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [showCreate, setShowCreate] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  // New user form
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [newRole, setNewRole] = useState<'owner' | 'editor'>('editor')
  const [creating, setCreating] = useState(false)

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)
  const [resetPw, setResetPw] = useState('')
  const [showResetPw, setShowResetPw] = useState(false)
  const [resetting, setResetting] = useState(false)

  function toast(type: 'ok' | 'err', msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 4000)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 12) { toast('err', 'Password must be at least 12 characters.'); return }
    setCreating(true)
    const res = await createAdminUser(newUsername, newEmail, newPassword, newRole)
    if (res.success) {
      toast('ok', `User "${newUsername}" created.`)
      setNewUsername(''); setNewEmail(''); setNewPassword(''); setNewRole('editor')
      setShowCreate(false)
      // Refresh list
      window.location.reload()
    } else {
      toast('err', res.error ?? 'Failed to create user.')
    }
    setCreating(false)
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    const res = await deleteAdminUser(user.id)
    if (res.success) {
      setUsers(u => u.filter(x => x.id !== user.id))
      toast('ok', `User "${user.username}" deleted.`)
    } else {
      toast('err', res.error ?? 'Failed to delete user.')
    }
  }

  async function handleRoleChange(user: AdminUser, role: 'owner' | 'editor') {
    const res = await updateAdminUserRole(user.id, role)
    if (res.success) {
      setUsers(u => u.map(x => x.id === user.id ? { ...x, role } : x))
      toast('ok', 'Role updated.')
    } else {
      toast('err', res.error ?? 'Failed to update role.')
    }
  }

  async function handleResetPw(e: React.FormEvent) {
    e.preventDefault()
    if (!resetTarget) return
    if (resetPw.length < 12) { toast('err', 'Password must be at least 12 characters.'); return }
    setResetting(true)
    const res = await resetAdminUserPassword(resetTarget.id, resetPw)
    if (res.success) {
      toast('ok', `Password reset for "${resetTarget.username}".`)
      setResetTarget(null); setResetPw('')
    } else {
      toast('err', res.error ?? 'Failed to reset password.')
    }
    setResetting(false)
  }

  return (
    <div className="space-y-6">
      {/* Feedback toast */}
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded text-sm ${feedback.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {feedback.type === 'ok' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <span className="font-semibold text-gray-800">{users.length} {users.length === 1 ? 'User' : 'Users'}</span>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-[#01301e] text-white text-sm px-4 py-2 rounded hover:bg-[#0b6e4f] transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {/* Create user form (inline) */}
        {showCreate && (
          <form onSubmit={handleCreate} className="border-b border-gray-100 p-6 bg-blue-50/40">
            <p className="text-sm font-semibold text-gray-700 mb-4">New Team Member</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Username *</label>
                <input value={newUsername} onChange={e => setNewUsername(e.target.value)} required
                  placeholder="johndoe" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01301e]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email (for password reset)</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="john@example.com" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01301e]" />
              </div>
              <div className="relative">
                <label className="text-xs text-gray-500 mb-1 block">Password * (min 12 chars)</label>
                <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                  placeholder="Strong password" className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#01301e]" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 text-gray-400">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Role *</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as 'owner' | 'editor')}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01301e]">
                  <option value="editor">Editor — manage products & orders</option>
                  <option value="owner">Owner — full access + users</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating}
                className="bg-[#01301e] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#0b6e4f] disabled:opacity-60">
                {creating ? 'Creating…' : 'Create User'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-5 py-2 rounded text-sm text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* User rows */}
        <div className="divide-y divide-gray-100">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50">
              <div className="w-9 h-9 rounded-full bg-[#01301e]/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-[#01301e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{user.username}</p>
                  {user.id === currentUserId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{user.email || 'No email set'}</p>
              </div>
              <div className="shrink-0 hidden sm:block">
                <p className="text-xs text-gray-400">
                  {user.lastLogin ? `Last login ${new Date(user.lastLogin).toLocaleDateString()}` : 'Never logged in'}
                </p>
              </div>
              {/* Role selector */}
              {user.id !== currentUserId ? (
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user, e.target.value as 'owner' | 'editor')}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                >
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
              ) : (
                <span className={`text-xs px-2 py-1 rounded border ${user.role === 'owner' ? 'border-[#53c87a] text-[#01301e] bg-[#53c87a]/10' : 'border-gray-200 text-gray-500'}`}>
                  {user.role === 'owner' ? '👑 Owner' : 'Editor'}
                </span>
              )}
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setResetTarget(user); setResetPw('') }}
                  title="Reset password"
                  className="p-2 text-gray-400 hover:text-[#01301e] hover:bg-gray-100 rounded transition-colors"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
                {user.id !== currentUserId && (
                  <button
                    onClick={() => handleDelete(user)}
                    title="Delete user"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role legend */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-[#01301e]" />
            <span className="font-semibold text-sm">Owner</span>
          </div>
          <p className="text-xs text-gray-500">Full access: products, orders, collections, users, and settings.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-sm">Editor</span>
          </div>
          <p className="text-xs text-gray-500">Manage products, orders, and collections. Cannot manage users or settings.</p>
        </div>
      </div>

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">Set a new password for <strong>{resetTarget.username}</strong></p>
            <form onSubmit={handleResetPw} className="space-y-3">
              <div className="relative">
                <input
                  type={showResetPw ? 'text' : 'password'}
                  value={resetPw}
                  onChange={e => setResetPw(e.target.value)}
                  placeholder="New password (min 12 chars)"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#01301e]"
                />
                <button type="button" onClick={() => setShowResetPw(!showResetPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showResetPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={resetting || !resetPw}
                  className="flex-1 bg-[#01301e] text-white py-2 rounded text-sm font-medium hover:bg-[#0b6e4f] disabled:opacity-60">
                  {resetting ? 'Saving…' : 'Save Password'}
                </button>
                <button type="button" onClick={() => setResetTarget(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
