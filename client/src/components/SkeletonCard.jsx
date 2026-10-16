export default function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />
      <div className="mt-3 h-8 w-full rounded-lg bg-slate-100" />
    </div>
  )
}
