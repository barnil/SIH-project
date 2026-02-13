import { useProfile } from '../state/ProfileContext.jsx'

export default function Sidebar() {
  const { dailyCheckIn, state } = useProfile()

  const handleCheckIn = () => {
    const ok = dailyCheckIn()
    if (ok) alert('Daily check-in claimed! +5 points')
    else alert('You already claimed today. Come back tomorrow!')
  }

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-gray-600 mb-3">Overview</h2>
      <ul className="text-sm text-gray-700 space-y-2">
        <li className="flex items-center gap-2"><span aria-hidden>📚</span><span>Learning paths for farmers</span></li>
        <li className="flex items-center gap-2"><span aria-hidden>🌤️</span><span>Weather, forecast and alerts</span></li>
        <li className="flex items-center gap-2"><span aria-hidden>🤖</span><span>AI chatbot and crop tips</span></li>
        <li className="flex items-center gap-2"><span aria-hidden>🏅</span><span>Badges and rewards</span></li>
        <li className="flex items-center gap-2"><span aria-hidden>🛍️</span><span>Marketplace to redeem points</span></li>
      </ul>
      <div className="mt-4 flex flex-col gap-2">
        <button className="btn-primary" onClick={handleCheckIn}>
          <span aria-hidden className="mr-1">✅</span>
          Daily Check-in (+5)
        </button>
        <p className="text-xs text-gray-500">Last claim: {state.lastClaimISO ? new Date(state.lastClaimISO).toLocaleDateString() : '—'}</p>
      </div>
    </div>
  )
}
