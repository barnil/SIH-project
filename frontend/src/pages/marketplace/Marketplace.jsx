import { useMemo, useState } from 'react'
import { useProfile } from '../../state/ProfileContext.jsx'
import Legend from '../../shared/Legend.jsx'

const CATALOG = [
  { id: 'fert-5', name: 'Fertilizer Discount Coupon', emoji: '🧪', category: 'Supplies', cost: 50, desc: '₹50 off at partner stores', color: 'from-emerald-500 to-teal-500' },
  { id: 'seed-pack', name: 'Premium Seed Pack', emoji: '🌱', category: 'Supplies', cost: 80, desc: 'High‑germination seeds for the season', color: 'from-green-500 to-emerald-600' },
  { id: 'soil-test', name: 'Free Soil Test', emoji: '🧫', category: 'Services', cost: 120, desc: 'One free soil test at partner lab', color: 'from-lime-500 to-emerald-500' },
  { id: 'vet-call', name: 'Vet Tele‑Consult', emoji: '🐄', category: 'Services', cost: 150, desc: '10‑min call for livestock health', color: 'from-amber-500 to-orange-500' },
  { id: 'drone-demo', name: 'Drone Demo Session', emoji: '🛰️', category: 'Training', cost: 220, desc: 'Hands‑on demo with experts', color: 'from-cyan-500 to-emerald-600' },
  { id: 'kcc-helper', name: 'KCC Application Help', emoji: '📄', category: 'Services', cost: 180, desc: 'Assistance for Kisan Credit Card forms', color: 'from-sky-500 to-indigo-600' },
  { id: 'market-pass', name: 'Local Mandi Pass', emoji: '🪪', category: 'Access', cost: 200, desc: 'Fast‑track entry at partner mandis', color: 'from-teal-600 to-green-700' },
  { id: 'insure-10', name: 'Crop Insurance Cashback', emoji: '🛡️', category: 'Finance', cost: 300, desc: '₹100 cashback on premium', color: 'from-green-600 to-emerald-700' },
  { id: 'weather-pro', name: 'Weather Pro Alerts (30d)', emoji: '🌤️', category: 'Digital', cost: 120, desc: 'Hourly forecasts and extreme alerts', color: 'from-blue-500 to-cyan-600' },
  { id: 'train-day', name: 'Field Training Day', emoji: '🎓', category: 'Training', cost: 260, desc: 'One‑day practical workshop', color: 'from-fuchsia-500 to-pink-500' },
]

export default function Marketplace() {
  const { state, awardBadge, refreshProfile } = useProfile()
  const [owned, setOwned] = useState([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState('popular')

  const categories = useMemo(() => ['All', ...Array.from(new Set(CATALOG.map(i => i.category)))], [])
  const filtered = useMemo(() => {
    let items = CATALOG.filter(i =>
      (!q || (i.name + ' ' + i.desc).toLowerCase().includes(q.toLowerCase())) &&
      (cat === 'All' || i.category === cat)
    )
    if (sort === 'cost-asc') items = items.slice().sort((a,b)=>a.cost-b.cost)
    if (sort === 'cost-desc') items = items.slice().sort((a,b)=>b.cost-a.cost)
    return items
  }, [q, cat, sort])

  const redeem = async (item) => {
    if (state.points < item.cost) {
      alert('Not enough points to redeem this reward.')
      return
    }
    try {
      const deviceId = state.deviceId || localStorage.getItem('fa_device_id_v1')
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          item_id: item.id,
          item_name: item.name,
          cost: item.cost,
        })
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Redeem failed')
      }
      await refreshProfile()
      setOwned((o) => [...o, item])
      awardBadge('Smart Saver')
      alert(`Redeemed: ${item.name}! Check your email or profile for details.`)
    } catch (e) {
      console.warn('Redeem failed', e)
      alert('Failed to redeem. Please try again later.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-emerald-600 via-lime-500 to-cyan-500 shadow-sm">
        <h2 className="text-2xl font-semibold">🛍️ Marketplace</h2>
        <p className="mt-1 text-white/90">Redeem your hard‑earned points for supplies, services, and training.</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md text-sm">
          <span className="font-medium">💰 Your Balance:</span>
          <span className="px-2 py-0.5 rounded bg-white/20">{state.points} pts</span>
        </div>
      </div>

      {/* How it works pictorials */}
      <section className="grid md:grid-cols-3 gap-3">
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🏆</span>
          <div>
            <p className="font-medium">Earn Points</p>
            <p className="text-sm text-gray-600">Complete learning quests and daily streaks</p>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🔎</span>
          <div>
            <p className="font-medium">Browse Rewards</p>
            <p className="text-sm text-gray-600">Find supplies, services, and training</p>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🎟️</span>
          <div>
            <p className="font-medium">Redeem Easily</p>
            <p className="text-sm text-gray-600">Get coupons or confirmations instantly</p>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Available Rewards</h3>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔎</span>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search (e.g., seed, soil, training)" className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"/>
          </div>
          <select value={cat} onChange={(e)=>setCat(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e)=>setSort(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="popular">Sort: Popular</option>
            <option value="cost-asc">Cost: Low → High</option>
            <option value="cost-desc">Cost: High → Low</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => (
            <article key={it.id} className={`rounded-xl p-5 text-white shadow-sm bg-gradient-to-br ${it.color}`}>
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-semibold flex items-center gap-2"><span className="text-2xl" aria-hidden>{it.emoji || '🎁'}</span>{it.name}</h4>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">{it.cost} pts</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{it.category}</span>
                </div>
              </div>
              <p className="mt-1 text-white/90 text-sm">{it.desc}</p>
              <div className="mt-4 flex items-center gap-2">
                <button className="btn-outline-white" onClick={() => redeem(it)} disabled={state.points < it.cost}>🎟️ Redeem</button>
                {state.points < it.cost && <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Need {it.cost - state.points} pts</span>}
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="rounded-md p-3 bg-amber-50 text-amber-800 text-sm">No items match your search.</div>
        )}
      </section>

      {/* Owned */}
      {owned.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Your Redemptions</h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {owned.map((it, i) => (
              <li key={`${it.id}-${i}`} className="rounded-md p-3 border-l-4 border-emerald-300 bg-emerald-50/50">
                <p className="font-medium text-emerald-800 flex items-center gap-2"><span className="text-xl" aria-hidden>{it.emoji || '🎁'}</span>{it.name}</p>
                <p className="text-sm text-emerald-900/80">Redeemed • Cost {it.cost} pts</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {/* Partners strip */}
      <section className="rounded-xl p-4 bg-white border shadow-sm">
        <h4 className="font-semibold">🤝 Partner Network</h4>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 border">🌾 AgriCo</span>
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 border">🧪 SoilLab</span>
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 border">🛰️ DroneWorks</span>
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 border">🏛️ GovConnect</span>
        </div>
      </section>
      <Legend />
    </div>
  )
}
