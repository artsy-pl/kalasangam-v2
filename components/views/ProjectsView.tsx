'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProjectForm from '@/components/projects/ProjectForm'

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

  const [profileId, setProfileId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)

      // 1. Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      // 2. Resolve profile
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

      setProfileId(profile.id)

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
    <div className="space-y-6 max-w-3xl">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Projects</h2>

        {profileId && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-purple-600"
          >
            + Create Project
          </button>
        )}
      </div>

      {/* ===== CREATE / EDIT FORM ===== */}
      {showForm && profileId && (
        <ProjectForm
          creatorId={profileId}
          onSaved={() => {
            setShowForm(false)
            window.location.reload()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ===== PROJECT LIST ===== */}
      {projects.length === 0 && !showForm && (
        <div className="text-slate-500">
          You haven’t created any projects yet.
        </div>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-4 rounded-xl shadow space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{project.title}</div>
              <span className="text-xs px-2 py-1 rounded bg-slate-100">
                {project.status}
              </span>
            </div>

            {project.project_type && (
              <div className="text-xs text-slate-500">
                {project.project_type}
              </div>
            )}

            {project.description && (
              <div className="text-sm text-slate-600">
                {project.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
