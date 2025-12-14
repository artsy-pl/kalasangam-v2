'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Profile = {
  id: string
  name: string | null
  bio: string | null
  skills: string[] | null
  location: string | null
}

export default function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('User not found')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setProfile(data)
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  if (loading) return <div>Loading profile…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-xl font-semibold">Your Profile</h2>

      <div className="bg-white rounded-xl p-4 shadow space-y-2">
        <div>
          <div className="text-sm text-slate-500">Name</div>
          <div>{profile?.name || '—'}</div>
        </div>

        <div>
          <div className="text-sm text-slate-500">Bio</div>
          <div>{profile?.bio || '—'}</div>
        </div>

        <div>
          <div className="text-sm text-slate-500">Location</div>
          <div>{profile?.location || '—'}</div>
        </div>

        <div>
          <div className="text-sm text-slate-500">Skills</div>
          <div>
            {profile?.skills?.length
              ? profile.skills.join(', ')
              : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
