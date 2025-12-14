'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type ProjectFormProps = {
  creatorId: string
  initial?: any
  onSaved: () => void
  onCancel: () => void
}

export default function ProjectForm({
  creatorId,
  initial,
  onSaved,
  onCancel,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [projectType, setProjectType] = useState(initial?.project_type ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'open')
  const [locations, setLocations] = useState(
    initial?.project_location?.join(', ') ?? ''
  )
  const [languages, setLanguages] = useState(
    initial?.language_requirements?.join(', ') ?? ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      title,
      description,
      project_type: projectType || null,
      status,
      project_location: locations
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
      language_requirements: languages
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
      creator_id: creatorId,
    }

    const { error } = initial?.id
      ? await supabase
          .from('projects')
          .update(payload)
          .eq('id', initial.id)
      : await supabase.from('projects').insert(payload)

    if (error) {
      setError(error.message)
    } else {
      onSaved()
    }

    setSaving(false)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h3 className="font-medium">
        {initial ? 'Edit Project' : 'New Project'}
      </h3>

      <input
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        placeholder="Project type (Film, Ad, Web Series...)"
        value={projectType}
        onChange={(e) => setProjectType(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="open">Open</option>
        <option value="casting">Casting</option>
        <option value="production">Production</option>
        <option value="closed">Closed</option>
      </select>

      <input
        placeholder="Project locations (comma separated)"
        value={locations}
        onChange={(e) => setLocations(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        placeholder="Language requirements (comma separated)"
        value={languages}
        onChange={(e) => setLanguages(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {saving ? 'Saving…' : 'Save'}
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
