// Class names are written out in full so Tailwind can detect them.
export const STATUSES = [
  {
    value: 'applied',
    label: 'Applied',
    dot: 'bg-sky-500',
    badge: 'bg-sky-100 text-sky-700',
    column: 'bg-sky-50/80 ring-sky-100',
    cardBorder: 'border-l-sky-400',
    empty: 'Nothing here yet. New applications start in this column.',
  },
  {
    value: 'interview',
    label: 'Interview',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    column: 'bg-amber-50/80 ring-amber-100',
    cardBorder: 'border-l-amber-400',
    empty: 'No interviews yet. Move an application here when you get one.',
  },
  {
    value: 'offer',
    label: 'Offer',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    column: 'bg-emerald-50/80 ring-emerald-100',
    cardBorder: 'border-l-emerald-400',
    empty: 'No offers yet. Keep going, they will show up here.',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700',
    column: 'bg-rose-50/80 ring-rose-100',
    cardBorder: 'border-l-rose-400',
    empty: 'No rejections logged. Move an application here if one closes.',
  },
]
