'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ApplicationsList({
  projectId,
}: {
  projectId: string
}) {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('user_applications')
        .select(
          `
          id,
          status,
          cover_note,
          submission_media,
          role:project_roles(role_name),
          applicant:profiles(full_name, avatar_url)
        `
        )
        .eq('project_id', projectId)

      if (error) {
        setError(error.message)
      } else {
        setApplications(data || [])
      }

      setLoading(false)
    }

    load()
  }, [projectId])

  if (loading) return <div>Loading applications…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Applications</h3>

      {applications.length === 0 && (
        <div className="text-slate-500">
          No applications yet.
        </div>
      )}

      {applications.map((app) => (
        <div
          key={app.id}
          className="bg-white p-4 rounded-xl shadow space-y-1"
        >
          <div className="font-medium">
            {app.applicant?.full_name || 'Applicant'}
          </div>
          <div className="text-xs text-slate-500">
            Role: {app.role?.role_name}
          </div>

          {app.cover_note && (
            <div className="text-sm">{app.cover_note}</div>
          )}

          {app.submission_media && (
            <a
              href={app.submission_media}
              target="_blank"
              className="text-xs text-purple-600"
            >
              View submission
            </a>
          )}

          <div className="text-xs">Status: {app.status}</div>
        </div>
      ))}
    </div>
  )
}
