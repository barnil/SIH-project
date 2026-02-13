export default function Legend({ items }) {
  const defaultItems = [
    { icon: '▶️', label: 'Start' },
    { icon: '✅', label: 'Complete' },
    { icon: '⭐', label: 'Level' },
    { icon: '🏅', label: 'Badges / Points' },
    { icon: '🌤️', label: 'Weather' },
    { icon: '📩', label: 'Send' },
    { icon: '🔍', label: 'Get Suggestions' },
    { icon: '🎟️', label: 'Redeem' },
    { icon: '🔥', label: 'Streak' },
    { icon: '💰', label: 'Balance' },
  ]
  const data = Array.isArray(items) && items.length ? items : defaultItems
  return (
    <div className="rounded-xl p-4 bg-white border border-gray-200 shadow-sm">
      <div className="text-sm font-semibold mb-2 flex items-center gap-2"><span aria-hidden>ℹ️</span><span>Legend</span></div>
      <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
        {data.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-base" aria-hidden>{it.icon}</span>
            <span>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
