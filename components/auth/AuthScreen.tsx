'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4">Kalā Sangam</h1>

        <input
          type="email"
          placeholder="Email address"
          className="w-full border rounded px-3 py-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading || !email}
          className="w-full bg-purple-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Sign in with Email'}
        </button>

        {message && (
          <p className="text-sm mt-3 text-slate-600">{message}</p>
        )}
      </div>
    </div>
  )
}
