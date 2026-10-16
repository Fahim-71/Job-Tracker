import { useEffect, useState } from 'react'
import { STATUSES } from '../constants'

const DEBOUNCE_MS = 300

// Typing is debounced; the parent only hears about the search once typing pauses.
export default function FilterBar({ search, status, onSearchChange, onStatusChange }) {
  const [text, setText] = useState(search)

  useEffect(() => {
    const trimmed = text.trim()
    if (trimmed === search) return
    const timer = setTimeout(() => onSearchChange(trimmed), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, search, onSearchChange])

  const hasFilters = Boolean(text || status)

  function clearAll() {
    setText('')
    onSearchChange('')
    onStatusChange('')
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search company or role"
          aria-label="Search company or role"
          className="input !pl-9"
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by status"
        className="input sm:w-48"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
