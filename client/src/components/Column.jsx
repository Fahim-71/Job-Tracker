import ApplicationCard from './ApplicationCard'
import SkeletonCard from './SkeletonCard'

export default function Column({
  status,
  applications,
  loading,
  filtered,
  onStatusChange,
  onOpen,
}) {
  return (
    <section
      aria-labelledby={`col-${status.value}`}
      className={`flex flex-col rounded-2xl p-3 ring-1 ${status.column}`}
    >
      <header className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
          <h2 id={`col-${status.value}`} className="text-sm font-semibold text-slate-800">
            {status.label}
          </h2>
        </div>
        <span
          className={`min-w-7 rounded-full px-2 py-0.5 text-center text-xs font-semibold ${status.badge}`}
          aria-label={`${loading ? 'Loading' : applications.length} applications`}
        >
          {loading ? '–' : applications.length}
        </span>
      </header>

      <div className="flex flex-col gap-2.5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : applications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300/80 bg-white/50 px-3 py-6 text-center text-sm text-slate-500">
            {filtered ? 'No matching applications.' : status.empty}
          </p>
        ) : (
          applications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onStatusChange={onStatusChange}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </section>
  )
}
