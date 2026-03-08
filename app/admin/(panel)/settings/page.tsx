'use client'

import { useState } from 'react'
import { KeyRound, CheckCircle, AlertCircle, Eye, EyeOff, Terminal } from 'lucide-react'
import { changeAdminPassword } from '@/app/actions/admin'

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [cliCommand, setCliCommand] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    setCliCommand('')

    if (newPassword !== confirmPassword) {
      setResult({ success: false, error: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 12) {
      setResult({ success: false, error: 'New password must be at least 12 characters.' })
      return
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setResult({ success: false, error: 'Password must contain uppercase, a number, and a special character.' })
      return
    }

    setLoading(true)
    try {
      const res = await changeAdminPassword(currentPassword, newPassword)
      if (res.success) {
        setResult({ success: true })
        setCliCommand(`echo "${newPassword}" | vercel env add ADMIN_PASSWORD production && vercel --prod`)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setResult({ success: false, error: res.error ?? 'Something went wrong.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your admin panel configuration.</p>
      </div>

      {/* Password change card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <KeyRound className="h-5 w-5 text-[#01301e]" />
          <h2 className="font-semibold text-gray-800">Change Admin Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01301e] pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01301e] pr-10"
                placeholder="Min 12 chars, uppercase, number, symbol"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01301e]"
              placeholder="Repeat new password"
            />
          </div>

          {/* Result messages */}
          {result && !result.success && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {result.error}
            </div>
          )}
          {result?.success && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              Password updated for this session.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#01301e] text-white py-2.5 rounded text-sm font-medium hover:bg-[#01301e]/90 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Vercel CLI instructions */}
      {cliCommand && (
        <div className="mt-6 bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-green-400" />
            <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">Make it permanent on Vercel</p>
          </div>
          <p className="text-gray-400 text-xs mb-2">
            The password is active now, but to survive redeployments run this in your terminal:
          </p>
          <code className="block text-green-300 text-xs break-all font-mono bg-black/30 rounded p-2">
            {cliCommand}
          </code>
        </div>
      )}

      {/* Password requirements */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg px-5 py-4">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Password Requirements</p>
        <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
          <li>At least 12 characters</li>
          <li>At least one uppercase letter (A–Z)</li>
          <li>At least one number (0–9)</li>
          <li>At least one special character (!@#$%^&*…)</li>
        </ul>
      </div>
    </div>
  )
}
