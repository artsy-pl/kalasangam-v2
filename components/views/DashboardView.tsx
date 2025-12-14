'use client'

export default function DashboardView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-medium mb-2">Your Profile</h3>
          <p className="text-sm text-slate-600">
            Complete your artist profile to get discovered.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-medium mb-2">Opportunities</h3>
          <p className="text-sm text-slate-600">
            Browse and apply to live gigs and collaborations.
          </p>
        </div>
      </div>
    </div>
  )
}
