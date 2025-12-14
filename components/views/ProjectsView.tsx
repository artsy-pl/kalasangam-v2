'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

import ProjectForm from '@/components/projects/ProjectForm'
import ProjectRolesView from '@/components/projects/ProjectRolesView'
import ApplicationsList from '@/components/applications/ApplicationsList'

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
  const [showCreateForm, setShowCreateForm] = useState(false)

  /* ---------------- Load projects ---------------- */
  const loadProjects = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    // Resolve profile
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

    // Fetch projects created by this profile
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

  useEffect(() => {
    loadProjects()
  }, [])

  if (loading) return <div>Loading projects…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Projects</h2>

        {profileId && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-sm text-purple-600"
          >
            + Create Project
          </button>
        )}
      </div>

      {/* ===== CREATE PROJECT FORM ===== */}
      {showCreateForm && profileId && (
        <ProjectForm
          creatorId={profileId}
          onSaved={() => {
            setShowCreateForm(false)
            loadProjects()
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* ===== EMPTY STATE ===== */}
      {projects.length === 0 && !showCreateForm && (
        <div className="text-slate-500">
          You haven’t created any projects yet.
        </div>
      )}

      {/* ===== PROJECT LIST ===== */}
      <div className="space-y-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-xl shadow space-y-4"
          >
            {/* Project header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-lg">
                  {project.title}
                </div>
                {project.project_type && (
                  <div className="text-xs text-slate-500">
                    {project.project_type}
                  </div>
                )}
              </div>

              <span className="text-xs px-2 py-1 rounded bg-slate-100">
                {project.status}
              </span>
            </div>

            {project.description && (
              <div className="text-sm text-slate-600">
                {project.description}
              </div>
            )}

            {/* ===== ROLES (CASTING SETUP) ===== */}
            <ProjectRolesView projectId={project.id} />

            {/* ===== APPLICATIONS (CREATOR REVIEW) ===== */}
            <ApplicationsList projectId={project.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
