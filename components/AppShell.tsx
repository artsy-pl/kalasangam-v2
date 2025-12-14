'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type ViewState =
  | 'dashboard'
  | 'profile'
  | 'projects'
  | 'applications'
  | 'skilling'
  | 'ai-coach'

export default function AppShell() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewState>('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    )
  }

  if (!session) {
    return <div>Auth screen coming next</div>
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 font-bold">Kalā Sangam</div>
      <div className="p-4">Current view: {view}</div>
    </div>
  )
}
