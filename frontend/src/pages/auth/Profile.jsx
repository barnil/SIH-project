import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../../state/ProfileContext.jsx'
import Legend from '../../shared/Legend.jsx'

export default function Profile() {
  const { state, setUserName, level } = useProfile()
  const navigate = useNavigate()
  const logout = () => {
    const ok = window.confirm('Are you sure you want to log out?')
    if (!ok) return
    setUserName('')
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-emerald-600 via-lime-500 to-cyan-500 shadow-sm">
        <h2 className="text-2xl font-semibold">👤 Profile</h2>
        <p className="mt-1 text-white/90">Manage your basic details and view your progress.</p>
      </div>
      {/* Quick actions pictorials */}
      <section className="grid md:grid-cols-3 gap-3">
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>✏️</span>
          <div>
            <p className="font-medium">Edit Name</p>
            <p className="text-sm text-gray-600">Keep your profile up to date</p>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🏅</span>
          <div>
            <p className="font-medium">View Badges</p>
            <p className="text-sm text-gray-600">Track your achievements</p>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🛍️</span>
          <div>
            <p className="font-medium">Use Points</p>
            <p className="text-sm text-gray-600">Redeem rewards in Marketplace</p>
          </div>
        </div>
      </section>

      <div className="card grid sm:grid-cols-2 gap-4 items-center">
        <div className="flex items-center gap-4">
          <img src="/krishiyukti-logo.png" alt="KrishiYukti" className="h-16 w-16 rounded-lg shadow object-cover" />
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold">{state.userName || 'Guest'}</p>
            <div className="mt-1 text-sm text-gray-600">⭐ Level {level} • 🏅 {state.points} pts • 🔥 {state.streakDays} day{state.streakDays===1?'':'s'} streak</div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {!state.userName && (
            <Link className="btn-primary" to="/login">✏️ Add your name</Link>
          )}
          {state.userName && (
            <>
              <Link className="btn-primary" to="/login">✏️ Edit name</Link>
              <button className="inline-flex items-center gap-2 rounded-md border px-4 py-2 hover:bg-gray-50" onClick={logout}>🚪 Log Out</button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold">Recent Badges</h3>
        {state.badges.length === 0 ? (
          <p className="text-sm text-gray-600 mt-2">No badges yet. Explore learning modules to earn some!</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {state.badges.slice(-6).reverse().map((b,i)=> (
              <li key={i} className="rounded-md px-3 py-1 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200">{b}</li>
            ))}
          </ul>
        )}
      </div>
      <Legend />
    </div>
  )
}
