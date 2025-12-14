'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProjectRoleForm from '@/components/projects/ProjectRoleForm'
import ApplicationForm from '@/components/applications/ApplicationForm'

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

  const [showRoleForm, setShowRoleForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const [showApplyForRoleId, setShowApplyForRoleId] =
    useState<string | null>(null)
  const [applicantProfileId, setApplicantProfileId] =
    useState<string | null>(null)

  /* ---------------- Load applicant profile ---------------- */
  useEffect(() => {
    const loadApplicantProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (data) setApplicantProfileId(data.id)
    }

    loadApplicantProfile()
  }, [])

  /* ---------------- Load roles ---------------- */
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
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Roles</h3>
        <button
          onClick={() => {
            setEditingRole(null)
            setShowRoleForm(true)
          }}
          className="text-sm text-purple-600"
        >
          + Add Role
        </button>
      </div>

      {/* ===== CREATE / EDIT ROLE ===== */}
      {showRoleForm && (
        <ProjectRoleForm
          projectId={projectId}
          initial={editingRole}
          onSaved={() => {
            setShowRoleForm(false)
            setEditingRole(null)
            loadRoles()
          }}
          onCancel={() => {
            setShowRoleForm(false)
            setEditingRole(null)
          }}
        />
      )}

      {/* ===== EMPTY STATE ===== */}
      {roles.length === 0 && !showRoleForm && (
        <div className="text-slate-500">No roles added yet.</div>
      )}

      {/* ===== ROLES LIST ===== */}
      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white p-4 rounded-xl shadow space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{role.role_name}</div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingRole(role)
                    setShowRoleForm(true)
                  }}
                  className="text-xs text-purple-600"
                >
                  Edit
                </button>

                {applicantProfileId && (
                  <button
                    onClick={() =>
                      setShowApplyForRoleId(role.id)
                    }
                    className="text-xs text-green-600"
                  >
                    Apply
                  </button>
                )}
              </div>
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

            {/* ===== APPLY FORM ===== */}
            {showApplyForRoleId === role.id &&
              applicantProfileId && (
                <ApplicationForm
                  projectId={projectId}
                  roleId={role.id}
                  applicantId={applicantProfileId}
                  onSubmitted={() =>
                    setShowApplyForRoleId(null)
                  }
                  onCancel={() =>
                    setShowApplyForRoleId(null)
                  }
                />
              )}
          </div>
        ))}
      </div>
    </div>
  )
}
