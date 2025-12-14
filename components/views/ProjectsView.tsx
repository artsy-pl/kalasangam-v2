'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Project = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  link: string | null
}

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('User not found')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
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
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold">Projects</h2>

      {projects.length === 0 && (
        <div className="text-slate-500">
          No projects yet. Add your first one.
        </div>
      )}

      <div className="space-y-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-xl shadow space-y-1"
          >
            <div className="font-medium">{p.title}</div>
            {p.description && (
              <div className="text-sm text-slate-600">
                {p.description}
              </div>
            )}
            {p.tags?.length && (
              <div className="text-xs text-slate-500">
                {p.tags.join(', ')}
              </div>
            )}
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                className="text-sm text-purple-600"
              >
                View link
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
