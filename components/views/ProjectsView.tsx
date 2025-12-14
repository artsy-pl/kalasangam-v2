'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Project = {
  id: string
  title: string
  description: string | null
  status: string
  project_type: string | null
  created_at: string
}

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      // 1. Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      // 2. Resolve profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        setError('Profile not found')
        setLoading(false)
        return
      }

      // 3. Fetch projects created by this profile
      const { data, error } = await supabase
        .from('projects')
        .select(
          'id, title, description, status, project_type, created_at'
        )
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setProjects(data || [])
      }

      setLoading(false)
    }

    loadProjects()
  }, [])

  if (loading) return <div>Loading projects…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Projects</h2>
        {/* Add Project button comes in Phase 6B */}
      </div>

      {projects.length === 0 && (
        <div className="text-slate-500">
          You haven’t created any projects yet.
        </div>
      )}

      <div className="space-y-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-xl shadow space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.title}</div>
              <span className="text-xs px-2 py-1 rounded bg-slate-100">
                {p.status}
              </span>
            </div>

            {p.project_type && (
              <div className="text-xs text-slate-500">
                {p.project_type}
              </div>
            )}

            {p.description && (
              <div className="text-sm text-slate-600">
                {p.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
