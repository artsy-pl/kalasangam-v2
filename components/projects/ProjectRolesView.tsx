'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProjectRoleForm from '@/components/projects/ProjectRoleForm'

type Role = {
  id: string
  role_name: string
  description: string | null
  audition_instructions: string | null
  script_url: string | null
  specs: any
}

export default function ProjectRolesView({
  projectId,
}: {
  projectId: string
}) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const loadRoles = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('project_roles')
      .select('*')
      .eq('project_id', projectId)
      .order('role_name')

    if (error) {
      setError(error.message)
    } else {
      setRoles(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadRoles()
  }, [projectId])

  if (loading) return <div>Loading roles…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Roles</h3>
        <button
          onClick={() => {
            setEditingRole(null)
            setShowForm(true)
          }}
          className="text-sm text-purple-600"
        >
          + Add Role
        </button>
      </div>

      {showForm && (
        <ProjectRoleForm
          projectId={projectId}
          initial={editingRole}
          onSaved={() => {
            setShowForm(false)
            setEditingRole(null)
            loadRoles()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingRole(null)
          }}
        />
      )}

      {roles.length === 0 && !showForm && (
        <div className="text-slate-500">
          No roles added yet.
        </div>
      )}

      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white p-4 rounded-xl shadow space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{role.role_name}</div>
              <button
                onClick={() => {
                  setEditingRole(role)
                  setShowForm(true)
                }}
                className="text-xs text-purple-600"
              >
                Edit
              </button>
            </div>

            {role.description && (
              <div className="text-sm text-slate-600">
                {role.description}
              </div>
            )}

            {role.audition_instructions && (
              <div className="text-xs text-slate-500">
                {role.audition_instructions}
              </div>
            )}

            {role.script_url && (
              <a
                href={role.script_url}
                target="_blank"
                className="text-xs text-purple-600"
              >
                View script
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
