import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatCards from '../components/StatCards'
import FilterBar from '../components/FilterBar'
import Board from '../components/Board'
import ApplicationModal from '../components/ApplicationModal'

// Same order the server uses for ?sort=newest.
const newestFirst = (a, b) =>
  b.dateApplied.localeCompare(a.dateApplied) || b._id.localeCompare(a._id)

const CSV_COLUMNS = [
  ['Company', (a) => a.company],
  ['Role', (a) => a.role],
  ['Status', (a) => a.status],
  ['Date Applied', (a) => a.dateApplied?.slice(0, 10)],
  ['Job Link', (a) => a.jobLink],
  ['Salary', (a) => a.salary],
  ['Location', (a) => a.location],
  ['Notes', (a) => a.notes],
]

function csvCell(value) {
  let text = value == null ? '' : String(value)
  // A leading = + - @ makes Excel/Sheets run the cell as a formula, so defuse it.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toCsv(applications) {
  const header = CSV_COLUMNS.map(([name]) => csvCell(name)).join(',')
  const rows = applications.map((a) => CSV_COLUMNS.map(([, get]) => csvCell(get(a))).join(','))
  return [header, ...rows].join('\r\n')
}

function downloadCsv(applications) {
  // The BOM makes Excel read the file as UTF-8.
  const blob = new Blob(['﻿', toCsv(applications)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `job-applications-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function Dashboard() {
  const { user, logout } = useAuth()

  // Filters are sent to the server; the list below is whatever the server returned.
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // result = { key, applications, error } for the query `key`. null until the first response.
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)
  const [statsKey, setStatsKey] = useState(0)

  // null = closed, { application: null } = create, { application } = edit
  const [modal, setModal] = useState(null)
  const [actionError, setActionError] = useState('')

  const queryKey = `${statusFilter}|${search}|${reloadKey}`

  useEffect(() => {
    let cancelled = false
    const params = {}
    if (statusFilter) params.status = statusFilter
    if (search) params.search = search

    api
      .get('/applications', { params })
      .then(({ data }) => {
        if (!cancelled) setResult({ key: queryKey, applications: data.applications, error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setResult((prev) => ({
            key: queryKey,
            applications: prev?.applications ?? [],
            error: getErrorMessage(err),
          }))
        }
      })
    return () => {
      cancelled = true
    }
  }, [queryKey, statusFilter, search])

  // Stats are account-wide, so they ignore the filters and refresh after every change.
  useEffect(() => {
    let cancelled = false
    api
      .get('/applications/stats')
      .then(({ data }) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {
        // The cards keep their last value (or loading look); the board shows real errors.
      })
    return () => {
      cancelled = true
    }
  }, [statsKey])

  const refreshStats = () => setStatsKey((k) => k + 1)
  const updateApplications = (fn) =>
    setResult((r) => (r ? { ...r, applications: fn(r.applications) } : r))

  const fetching = result !== null && result.key !== queryKey
  const showSkeleton = result === null || (Boolean(result.error) && fetching)
  const loadError = result && !fetching ? result.error : ''
  const applications = result?.applications ?? []
  const hasFilters = Boolean(search || statusFilter)
  // Exactly what the board shows: the server-filtered list, minus cards moved out of the
  // selected status since the last fetch.
  const exportable = statusFilter ? applications.filter((a) => a.status === statusFilter) : applications

  const closeModal = useCallback(() => setModal(null), [])
  const openCreate = () => setModal({ application: null })
  const openEdit = (application) => setModal({ application })

  function retry() {
    setReloadKey((k) => k + 1)
  }

  // The modal has already talked to the server; just mirror the result in the board.
  function handleSaved(saved) {
    updateApplications((list) => {
      const next = [saved, ...list.filter((a) => a._id !== saved._id)]
      // Under a status filter, a card edited into another status leaves the view.
      return (statusFilter ? next.filter((a) => a.status === statusFilter) : next).sort(newestFirst)
    })
    setModal(null)
    refreshStats()
  }

  function handleDeleted(id) {
    updateApplications((list) => list.filter((a) => a._id !== id))
    setModal(null)
    refreshStats()
  }

  // Moves the card right away, then confirms with the server; rolls back on failure.
  async function handleStatusChange(id, newStatus) {
    const previous = applications.find((a) => a._id === id)?.status
    if (!previous || previous === newStatus) return

    setActionError('')
    updateApplications((list) => list.map((a) => (a._id === id ? { ...a, status: newStatus } : a)))
    try {
      await api.patch(`/applications/${id}`, { status: newStatus })
      refreshStats()
    } catch (err) {
      // Only undo if the card is still showing the status that just failed.
      updateApplications((list) =>
        list.map((a) => (a._id === id && a.status === newStatus ? { ...a, status: previous } : a)),
      )
      setActionError(`Couldn't update status: ${getErrorMessage(err)}`)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-slate-50 to-fuchsia-50">
      <Navbar user={user} onLogout={logout} />

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Hi{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm text-slate-500">Here's where your applications stand.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCsv(exportable)}
              disabled={showSkeleton || Boolean(loadError) || fetching || exportable.length === 0}
              title={hasFilters ? 'Download the filtered applications as CSV' : 'Download all applications as CSV'}
              className="btn-secondary"
            >
              Export CSV
            </button>
            <button onClick={openCreate} disabled={Boolean(loadError)} className="btn-primary">
              <span aria-hidden="true" className="text-lg leading-none">
                +
              </span>
              Add Application
            </button>
          </div>
        </div>

        <StatCards stats={stats} />

        <FilterBar
          search={search}
          status={statusFilter}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
        />

        {actionError && (
          <p
            role="alert"
            className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200"
          >
            <span>{actionError}</span>
            <button onClick={() => setActionError('')} className="ml-4 font-medium hover:underline">
              Dismiss
            </button>
          </p>
        )}

        {!showSkeleton && !loadError && !hasFilters && applications.length === 0 && (
          <div className="rounded-2xl bg-white/70 p-6 text-center ring-1 ring-indigo-100">
            <p className="font-semibold text-slate-900">Your board is empty. Let's fix that.</p>
            <p className="mt-1 text-sm text-slate-500">
              Add the first job you've applied to and track it from applied to offer.
            </p>
          </div>
        )}

        {loadError ? (
          <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-rose-200">
            <p className="text-sm text-rose-700">{loadError}</p>
            <button onClick={retry} className="btn-primary mt-4">
              Try again
            </button>
          </div>
        ) : (
          <div className={`transition-opacity ${fetching ? 'opacity-60' : ''}`} aria-busy={fetching}>
            <Board
              applications={applications}
              loading={showSkeleton}
              statusFilter={statusFilter}
              filtered={hasFilters}
              onStatusChange={handleStatusChange}
              onOpen={openEdit}
            />
          </div>
        )}
      </main>

      {modal && (
        <ApplicationModal
          application={modal.application}
          onClose={closeModal}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
