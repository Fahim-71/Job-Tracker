// Each card's classes are written out in full so Tailwind can detect them.
const ICONS = {
  total: <path d="M4 6h16M4 12h16M4 18h10" />,
  interview: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  offer: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
  rate: <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />,
}

function StatCard({ icon, label, value, hint, chip, loading }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${chip}`}>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {ICONS[icon]}
          </svg>
        </span>
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-slate-200" aria-label="Loading" />
      ) : (
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      )}
      <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>
    </div>
  )
}

// stats is null until the first /stats response arrives (or if it failed).
export default function StatCards({ stats }) {
  const loading = stats === null

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        icon="total"
        label="Total"
        value={stats?.total}
        hint={loading ? ' ' : `${stats.applied} applied · ${stats.rejected} rejected`}
        chip="bg-linear-to-br from-indigo-500 to-violet-500"
        loading={loading}
      />
      <StatCard
        icon="interview"
        label="Interviews"
        value={stats?.interview}
        hint="In progress"
        chip="bg-linear-to-br from-amber-400 to-orange-500"
        loading={loading}
      />
      <StatCard
        icon="offer"
        label="Offers"
        value={stats?.offer}
        hint="Congratulations"
        chip="bg-linear-to-br from-emerald-400 to-teal-500"
        loading={loading}
      />
      <StatCard
        icon="rate"
        label="Response rate"
        value={loading ? '' : `${stats.responseRate}%`}
        hint="Interviews + offers"
        chip="bg-linear-to-br from-fuchsia-500 to-pink-500"
        loading={loading}
      />
    </div>
  )
}
