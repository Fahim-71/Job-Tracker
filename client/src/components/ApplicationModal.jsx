import { useEffect, useRef, useState } from 'react'
import api, { getErrorMessage } from '../api/axios'
import { STATUSES } from '../constants'

const todayLocal = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const toFormState = (application) => ({
  company: application?.company ?? '',
  role: application?.role ?? '',
  status: application?.status ?? 'applied',
  // Dates are stored as UTC midnight, so the UTC date is the one the user picked.
  dateApplied: application ? application.dateApplied.slice(0, 10) : todayLocal(),
  jobLink: application?.jobLink ?? '',
  salary: application?.salary ?? '',
  location: application?.location ?? '',
  notes: application?.notes ?? '',
})

const inputClass = 'input mt-1'
const labelClass = 'block text-sm font-medium text-slate-700'

// One component for both modes: pass `application` to edit, omit it to create.
export default function ApplicationModal({ application, onClose, onSaved, onDeleted }) {
  const isEdit = Boolean(application)
  const [form, setForm] = useState(() => toFormState(application))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const firstField = useRef(null)

  useEffect(() => {
    firstField.current?.focus()

    // Stop the page behind the modal from scrolling.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, busy])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status,
      dateApplied: form.dateApplied,
      jobLink: form.jobLink.trim(),
      salary: form.salary.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
    }
    if (!payload.company || !payload.role) {
      setError('Company and role are required.')
      return
    }

    setBusy(true)
    try {
      const { data } = isEdit
        ? await api.patch(`/applications/${application._id}`, payload)
        : await api.post('/applications', payload)
      onSaved(data.application)
    } catch (err) {
      setError(getErrorMessage(err))
      setBusy(false)
    }
  }

  async function handleDelete() {
    setError('')
    setBusy(true)
    try {
      await api.delete(`/applications/${application._id}`)
      onDeleted(application._id)
    } catch (err) {
      setError(getErrorMessage(err))
      setBusy(false)
      setConfirmingDelete(false)
    }
  }

  // mousedown (not click) so dragging a text selection out of the card doesn't close it.
  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget && !busy) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-modal-title"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between">
          <h2 id="application-modal-title" className="text-lg font-bold text-slate-900">
            {isEdit ? 'Edit application' : 'Add application'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="-mr-2 -mt-1 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="company" className={labelClass}>
                Company <span className="text-rose-500">*</span>
              </label>
              <input
                id="company"
                ref={firstField}
                required
                value={form.company}
                onChange={set('company')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="role" className={labelClass}>
                Role <span className="text-rose-500">*</span>
              </label>
              <input
                id="role"
                required
                value={form.role}
                onChange={set('role')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="status" className={labelClass}>
                Status
              </label>
              <select id="status" value={form.status} onChange={set('status')} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dateApplied" className={labelClass}>
                Date applied
              </label>
              <input
                id="dateApplied"
                type="date"
                required
                value={form.dateApplied}
                onChange={set('dateApplied')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="salary" className={labelClass}>
                Salary
              </label>
              <input
                id="salary"
                placeholder="e.g. 6 LPA"
                value={form.salary}
                onChange={set('salary')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="location" className={labelClass}>
                Location
              </label>
              <input
                id="location"
                value={form.location}
                onChange={set('location')}
                className={inputClass}
              />
            </div>
          </div>

          <label htmlFor="jobLink" className={`${labelClass} mt-4`}>
            Job link
          </label>
          <input
            id="jobLink"
            type="url"
            placeholder="https://"
            value={form.jobLink}
            onChange={set('jobLink')}
            className={inputClass}
          />

          <label htmlFor="notes" className={`${labelClass} mt-4`}>
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={set('notes')}
            className={inputClass}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              {isEdit &&
                (confirmingDelete ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-700">Delete this application?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={busy}
                      className="btn-danger"
                    >
                      {busy ? 'Deleting…' : 'Yes, delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={busy}
                      className="rounded-xl px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    disabled={busy}
                    className="rounded-xl px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                ))}
            </div>

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn-primary"
              >
                {busy && !confirmingDelete ? 'Saving…' : isEdit ? 'Save changes' : 'Add application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
