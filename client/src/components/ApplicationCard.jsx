import { STATUSES } from '../constants'

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC', // dates are stored as UTC midnight; local time would shift the day
  })

export default function ApplicationCard({ application, onStatusChange, onOpen }) {
  const { _id, company, role, status, dateApplied, location } = application
  const accent = STATUSES.find((s) => s.value === status)?.cardBorder ?? ''

  return (
    <article
      className={`rounded-xl border border-l-4 border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${accent}`}
    >
      <button
        type="button"
        onClick={() => onOpen(application)}
        className="block w-full rounded-t-xl p-3 pb-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={`Edit ${role} at ${company}`}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white"
            aria-hidden="true"
          >
            {company.trim()[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900" title={company}>
              {company}
            </h3>
            <p className="truncate text-sm text-slate-500" title={role}>
              {role}
            </p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pb-3 text-xs text-slate-500">
          <time dateTime={dateApplied}>{formatDate(dateApplied)}</time>
          {location && <span className="truncate">{location}</span>}
        </div>
      </button>

      <label className="block px-3 pb-3">
        <span className="sr-only">Status for {company}</span>
        <select
          value={status}
          onChange={(e) => onStatusChange(_id, e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}
