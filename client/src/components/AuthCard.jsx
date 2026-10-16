import Logo from './Logo'

// Shared shell for the Login and Register pages.
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-100 via-white to-fuchsia-100 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Logo className="h-11 w-11" />
          <span className="text-xl font-bold tracking-tight text-slate-900">Job Tracker</span>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-indigo-500/10 ring-1 ring-slate-200/70">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
