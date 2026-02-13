import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../../state/ProfileContext.jsx'

export default function Login() {
  const { state, setUserName, authLogin, authRegister } = useProfile()
  const navigate = useNavigate()
  const [showLogo, setShowLogo] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const doLogin = () => {
    // If no name stored yet, set a friendly default
    if (!state.userName || !state.userName.trim()) setUserName('Farmer')
    navigate('/learning')
  }

  const submitAuth = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await authLogin(form.email, form.password)
      } else {
        await authRegister(form.email, form.password, form.fullName)
      }
      navigate('/learning')
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  // If user already has a saved name, skip login on revisit
  useEffect(() => {
    if (state.userName && state.userName.trim()) {
      navigate('/learning', { replace: true })
    }
  }, [state.userName, navigate])

  // Splash fade-in for logo then button
  useEffect(() => {
    const t1 = setTimeout(() => setShowLogo(true), 50)
    const t2 = setTimeout(() => setShowButton(true), 350)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-emerald-600 via-lime-500 to-cyan-500 shadow-sm text-center">
        <h2 className="text-2xl font-semibold flex items-center justify-center gap-2"><span aria-hidden>👋</span> <span>Welcome to KrishiYukti</span></h2>
        <p className="mt-1 text-white/90">Tap <strong>Log In</strong> to continue.</p>
      </div>

      <div className="card flex flex-col gap-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <img src="/krishiyukti-logo.png" alt="KrishiYukti logo" className={`h-20 w-20 rounded-lg shadow object-cover transition-all duration-700 ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} />
          <div className="inline-flex items-center gap-2 text-sm bg-emerald-50 text-emerald-800 px-3 py-1 rounded-md border border-emerald-200">🔐 Account</div>
        </div>
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-md p-1">
            <button className={`px-3 py-1 rounded ${mode==='signin'?'bg-white shadow':''}`} onClick={()=>setMode('signin')}>🔑 Sign In</button>
            <button className={`px-3 py-1 rounded ${mode==='signup'?'bg-white shadow':''}`} onClick={()=>setMode('signup')}>🆕 Create</button>
          </div>
        </div>
        <form onSubmit={submitAuth} className="grid gap-3 max-w-sm mx-auto w-full">
          {mode==='signup' && (
            <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})}/>
          )}
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/>
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/>
          {error && <div className="text-sm text-red-600">❗ {error}</div>}
          <div className="flex items-center gap-2">
            <button className="btn-primary" type="submit" disabled={busy}>{mode==='signin' ? '🔑 Sign In' : '🆕 Create Account'}</button>
            <button type="button" className={`btn-light transition-all duration-700 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} onClick={doLogin}>
              <span aria-hidden className="mr-2">👉</span>
              Continue without account
            </button>
          </div>
        </form>
      </div>

      {/* Pictorial feature guide */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl p-5 bg-white border border-emerald-200 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2"><span aria-hidden>📚</span><span>Learning</span></h3>
          <p className="text-sm text-gray-700 mt-1">Colorful cards. Tap <em>Start</em> and <em>Complete</em> to earn points and badges.</p>
        </div>
        <div className="rounded-xl p-5 bg-white border border-sky-200 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2"><span aria-hidden>🌤️</span><span>Weather & Alerts</span></h3>
          <p className="text-sm text-gray-700 mt-1">See today’s weather, forecast, and safety alerts in simple cards.</p>
        </div>
        <div className="rounded-xl p-5 bg-white border border-emerald-200 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2"><span aria-hidden>🤖</span><span>AI Help</span></h3>
          <p className="text-sm text-gray-700 mt-1">Ask questions. Get simple tips for crops and soil.</p>
        </div>
        <div className="rounded-xl p-5 bg-white border border-amber-200 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2"><span aria-hidden>🛍️</span><span>Marketplace</span></h3>
          <p className="text-sm text-gray-700 mt-1">Use points to get discounts, demos, and more.</p>
        </div>
      </section>
    </div>
  )
}
