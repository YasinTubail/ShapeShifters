"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { adminLogin } from '@/app/actions/admin'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await adminLogin(username.trim(), password)
    if (result.success) {
      router.push('/admin/dashboard')
    } else {
      setError(result.error ?? 'Incorrect username or password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#01301e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-white mb-1">SHAPESHIFTERS</h1>
          <p className="text-[#53c87a] text-sm tracking-wide">Admin Panel</p>
        </div>

        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#01301e] flex items-center justify-center">
              <Lock className="h-5 w-5 text-[#53c87a]" />
            </div>
            <div>
              <h2 className="font-bold text-[#01301e]">Sign in</h2>
              <p className="text-sm text-gray-500">Enter your credentials to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-[#01301e] text-white py-3 font-medium tracking-wide hover:bg-[#0b6e4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/admin/forgot-password" className="text-sm text-[#0b6e4f] hover:text-[#01301e] transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-center text-[#53c87a]/60 text-xs mt-6">
          SHAPESHIFTERS © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
