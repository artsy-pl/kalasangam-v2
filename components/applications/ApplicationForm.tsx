'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  projectId: string
  roleId: string
  applicantId: string
  onSubmitted: () => void
  onCancel: () => void
}

export default function ApplicationForm({
  projectId,
  roleId,
  applicantId,
  onSubmitted,
  onCancel,
}: Props) {
  const [coverNote, setCoverNote] = useState('')
  const [submissionMedia, setSubmissionMedia] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('user_applications').insert({
      applicant_id: applicantId,
      project_id: projectId,
      role_id: roleId,
      cover_note: coverNote,
      submission_media: submissionMedia,
      status: 'applied',
    })

    if (error) {
      setError(error.message)
    } else {
      onSubmitted()
    }

    setSaving(false)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h4 className="font-medium">Apply to Role</h4>

      <textarea
        placeholder="Cover note"
        value={coverNote}
        onChange={(e) => setCoverNote(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        placeholder="Submission media link (optional)"
        value={submissionMedia}
        onChange={(e) => setSubmissionMedia(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={saving}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {saving ? 'Submitting…' : 'Submit Application'}
        </button>
        <button
          onClick={onCancel}
          className="text-slate-600 px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
