'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  projectId: string
  initial?: any
  onSaved: () => void
  onCancel: () => void
}

export default function ProjectRoleForm({
  projectId,
  initial,
  onSaved,
  onCancel,
}: Props) {
  const [roleName, setRoleName] = useState(initial?.role_name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [auditionInstructions, setAuditionInstructions] = useState(
    initial?.audition_instructions ?? ''
  )
  const [scriptUrl, setScriptUrl] = useState(initial?.script_url ?? '')
  const [specsJson, setSpecsJson] = useState(
    initial?.specs ? JSON.stringify(initial.specs, null, 2) : '{}'
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (!roleName.trim()) {
      setError('Role name is required')
      return
    }

    let parsedSpecs = {}
    try {
      parsedSpecs = specsJson ? JSON.parse(specsJson) : {}
    } catch {
      setError('Specs must be valid JSON')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      project_id: projectId,
      role_name: roleName,
      description,
      audition_instructions: auditionInstructions,
      script_url: scriptUrl || null,
      specs: parsedSpecs,
    }

    const { error } = initial?.id
      ? await supabase
          .from('project_roles')
          .update(payload)
          .eq('id', initial.id)
      : await supabase.from('project_roles').insert(payload)

    if (error) {
      setError(error.message)
    } else {
      onSaved()
    }

    setSaving(false)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h4 className="font-medium">
        {initial ? 'Edit Role' : 'New Role'}
      </h4>

      <input
        placeholder="Role name (e.g. Lead Actor)"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <textarea
        placeholder="Role description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <textarea
        placeholder="Audition instructions"
        value={auditionInstructions}
        onChange={(e) => setAuditionInstructions(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        placeholder="Script URL (optional)"
        value={scriptUrl}
        onChange={(e) => setScriptUrl(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <textarea
        placeholder="Specs (JSON)"
        value={specsJson}
        onChange={(e) => setSpecsJson(e.target.value)}
        className="w-full border rounded px-3 py-2 font-mono text-sm"
        rows={5}
      />

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {saving ? 'Saving…' : 'Save Role'}
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
