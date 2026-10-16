import Column from './Column'
import { STATUSES } from '../constants'

// Columns stack on phones, 2-up on tablets, four across on desktop.
// With a status filter active only that column is shown.
export default function Board({
  applications,
  loading,
  statusFilter,
  filtered,
  onStatusChange,
  onOpen,
}) {
  const visible = statusFilter ? STATUSES.filter((s) => s.value === statusFilter) : STATUSES
  const layout =
    visible.length === 1 ? 'grid-cols-1 sm:max-w-md' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={`grid gap-4 ${layout}`}>
      {visible.map((status) => (
        <Column
          key={status.value}
          status={status}
          loading={loading}
          filtered={filtered}
          applications={applications.filter((a) => a.status === status.value)}
          onStatusChange={onStatusChange}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
