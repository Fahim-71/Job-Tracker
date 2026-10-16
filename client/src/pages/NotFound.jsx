import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-indigo-100 via-white to-fuchsia-100 px-4 text-center">
      <p className="bg-linear-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-7xl font-extrabold text-transparent">
        404
      </p>
      <h1 className="mt-4 text-xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">That page doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary mt-6">
        Back to dashboard
      </Link>
    </div>
  )
}
