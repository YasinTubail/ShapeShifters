"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { requestPasswordReset } from '@/app/actions/admin'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await requestPasswordReset(email.trim())
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#01301e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-white mb-1">SHAPESHIFTERS</h1>
          <p className="text-[#53c87a] text-sm tracking-wide">Admin Panel</p>
        </div>

        <div className="bg-white p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
              <h2 className="font-bold text-[#01301e] text-lg mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">
                If an account with that email exists, we sent a reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/admin/login"
                className="text-sm text-[#0b6e4f] hover:text-[#01301e] transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#01301e] flex items-center justify-center">
                  <Mail className="h-5 w-5 text-[#53c87a]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#01301e]">Reset Password</h2>
                  <p className="text-sm text-gray-500">Enter your account email</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-[#01301e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#01301e] text-white py-3 font-medium tracking-wide hover:bg-[#0b6e4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'SEND RESET LINK'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/admin/login"
                  className="text-sm text-gray-400 hover:text-[#01301e] transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[#53c87a]/60 text-xs mt-6">
          SHAPESHIFTERS © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
