"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { adminLogin } from '@/app/actions/admin'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await adminLogin(password)
    if (result.success) {
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password. Please try again.')
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
              <p className="text-sm text-gray-500">Enter your admin password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e] pr-12"
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
              disabled={loading || !password}
              className="w-full bg-[#01301e] text-white py-3 font-medium tracking-wide hover:bg-[#0b6e4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#53c87a]/60 text-xs mt-6">
          SHAPESHIFTERS © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
