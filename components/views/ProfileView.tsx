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
  const [form, setForm] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
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

      if (error && error.code !== 'PGRST116') {
        setError(error.message)
      } else {
        const initialProfile = {
          id: user.id,
          name: data?.name ?? '',
          bio: data?.bio ?? '',
          skills: data?.skills ?? [],
          location: data?.location ?? '',
        }
        setProfile(initialProfile)
        setForm(initialProfile)
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  const saveProfile = async () => {
    if (!form) return

    setSaving(true)
    setError(null)

    const { error } = await supabase.from('profiles').upsert({
      ...form,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      setError(error.message)
    } else {
      setProfile(form)
      setEditing(false)
    }

    setSaving(false)
  }

  if (loading) return <div>Loading profile…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Profile</h2>
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-sm text-purple-600"
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <Field
          label="Name"
          value={form?.name}
          editing={editing}
          onChange={(v) => setForm({ ...form!, name: v })}
        />

        <Field
          label="Bio"
          value={form?.bio}
          editing={editing}
          textarea
          onChange={(v) => setForm({ ...form!, bio: v })}
        />

        <Field
          label="Location"
          value={form?.location}
          editing={editing}
          onChange={(v) => setForm({ ...form!, location: v })}
        />

        <Field
          label="Skills (comma separated)"
          value={form?.skills?.join(', ') ?? ''}
          editing={editing}
          onChange={(v) =>
            setForm({
              ...form!,
              skills: v
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />

        {editing && (
          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  editing,
  textarea,
  onChange,
}: {
  label: string
  value: string | null | undefined
  editing: boolean
  textarea?: boolean
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      {editing ? (
        textarea ? (
          <textarea
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        ) : (
          <input
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        )
      ) : (
        <div>{value || '—'}</div>
      )}
    </div>
  )
}
