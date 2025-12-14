'use client'

import { ViewState } from '@/components/AppShell'

type Props = {
  view: ViewState
  setView: (v: ViewState) => void
}

export default function TopNav({ view, setView }: Props) {
  const tabs: ViewState[] = [
    'dashboard',
    'profile',
    'projects',
    'applications',
    'skilling',
    'ai-coach',
  ]

  return (
    <div className="flex gap-4 border-b px-4 py-2 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setView(tab)}
          className={`capitalize text-sm ${
            view === tab
              ? 'text-purple-600 font-semibold'
              : 'text-slate-600'
          }`}
        >
          {tab.replace('-', ' ')}
        </button>
      ))}
    </div>
  )
}
