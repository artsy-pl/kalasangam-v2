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

  import AuthScreen from '@/components/auth/AuthScreen'

  ...

  if (!session) {
    return <AuthScreen />
  }

  import TopNav from '@/components/navigation/TopNav'

  return (
  <div className="min-h-screen bg-slate-50">
    <TopNav view={view} setView={setView} />
    <div className="p-6">
      <div className="text-slate-600">
        View placeholder: <strong>{view}</strong>
      </div>
    </div>
  </div>
  )
}
