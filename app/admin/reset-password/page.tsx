"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/admin'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h2 className="font-bold text-[#01301e] mb-2">Invalid Link</h2>
        <p className="text-sm text-gray-500 mb-4">This reset link is missing or invalid.</p>
        <Link href="/admin/forgot-password" className="text-sm text-[#0b6e4f] hover:underline">
          Request a new link
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 12) { setError('Password must be at least 12 characters.'); return }
    setLoading(true)
    const result = await resetPassword(token, password)
    if (result.success) {
      router.push('/admin/login?reset=1')
    } else {
      setError(result.error ?? 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#01301e] flex items-center justify-center">
          <Lock className="h-5 w-5 text-[#53c87a]" />
        </div>
        <div>
          <h2 className="font-bold text-[#01301e]">New Password</h2>
          <p className="text-sm text-gray-500">Choose a strong password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 12 chars)"
            required
            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] pr-12"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          required
          className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full bg-[#01301e] text-white py-3 font-medium tracking-wide hover:bg-[#0b6e4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'SET NEW PASSWORD'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#01301e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-white mb-1">SHAPESHIFTERS</h1>
          <p className="text-[#53c87a] text-sm tracking-wide">Admin Panel</p>
        </div>
        <div className="bg-white p-8">
          <Suspense fallback={<p className="text-center text-gray-500">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
        <p className="text-center text-[#53c87a]/60 text-xs mt-6">
          SHAPESHIFTERS © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
