import { useProfile } from '../../state/ProfileContext.jsx'
import Legend from '../../shared/Legend.jsx'

export default function Badges() {
  const { state } = useProfile()
  const empty = state.badges.length === 0

  // Base badges we know can be awarded via rules. These will show in monochrome until earned.
  const baseBadgeCatalog = [
    'Starter',
    '3-Day Streak',
    '1-Week Streak',
    'Rising Farmer (100 pts)',
    'Skilled Cultivator (250 pts)',
    'Expert Agronomist (500 pts)',
    'Master of Fields (1000 pts)',
  ]

  const isAwarded = (name) => state.badges.includes(name)
  const dynamicAwarded = state.badges.filter((b) => !baseBadgeCatalog.includes(b))
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-emerald-600 via-lime-500 to-cyan-500 shadow-sm">
        <h2 className="text-2xl font-semibold">🏅 Badges</h2>
        <p className="mt-1 text-white/90">Earn badges by keeping your daily streak, completing modules, and finishing special courses.</p>
      </div>
      {/* How to earn pictorials */}
      <section className="grid md:grid-cols-3 gap-3">
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🔥</span>
          <div>
            <p className="font-medium">Daily Streak</p>
            <p className="text-sm text-gray-600">Login and learn daily</p>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🎮</span>
          <div>
            <p className="font-medium">Complete Quests</p>
            <p className="text-sm text-gray-600">Finish learning modules</p>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🎓</span>
          <div>
            <p className="font-medium">Earn Certificates</p>
            <p className="text-sm text-gray-600">Special courses unlock badges</p>
          </div>
        </div>
      </section>

      {/* Catalog badges: monochrome (locked) vs bright (earned) */}
      <section className="space-y-3">
        <h3 className="font-semibold">📖 Catalog</h3>
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {baseBadgeCatalog.map((b, i) => {
            const earned = isAwarded(b)
            return (
              <li key={i} className={`rounded-xl p-4 shadow-sm flex items-center gap-3 border ${earned ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-transparent' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                <span className={`text-2xl ${earned ? '' : 'opacity-60'}`}>🏅</span>
                <span className={`font-medium ${earned ? '' : 'text-gray-600'}`}>{b}</span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Dynamic/earned-only badges (e.g., modules, special courses) */}
      {dynamicAwarded.length > 0 ? (
        <section className="space-y-3">
          <h3 className="font-semibold">🏆 Earned</h3>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dynamicAwarded.map((b, i) => (
              <li key={i} className="rounded-xl p-4 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm flex items-center gap-3">
                <span className="text-2xl">🏅</span>
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-200 text-emerald-800 text-sm">
          ℹ️ No earned badges yet from modules/courses. Try completing a module to unlock more badges.
        </div>
      )}
      <Legend />
    </div>
  )
}
