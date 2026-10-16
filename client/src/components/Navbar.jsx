import Logo from './Logo'

export default function Navbar({ user, onLogout }) {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-slate-900">Job Tracker</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white"
              aria-hidden="true"
            >
              {initial}
            </span>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user?.name}</span>
          </div>
          <button onClick={onLogout} className="btn-secondary !px-3 !py-1.5">
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
