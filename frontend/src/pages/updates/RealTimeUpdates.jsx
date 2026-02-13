import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchCurrentWeather, fetchDisasterAlerts, fetchForecast } from '../../services/weather.js'
import { fetchGovtSchemes } from '../../services/govt.js'
import { validateEshram, rgiVerifyBirth, rgiVerifyDeath } from '../../services/updates.js'
import Legend from '../../shared/Legend.jsx'

function WeatherCard() {
  const { data, isLoading } = useQuery({ queryKey: ['weather'], queryFn: () => fetchCurrentWeather() })
  if (isLoading) return <div className="card">Loading current weather...</div>
  return (
    <div className="rounded-xl p-[1px] bg-gradient-to-r from-emerald-500 to-cyan-500">
      <div className="rounded-xl bg-white p-5">
        <h3 className="font-semibold flex items-center gap-2">🌤️ Realtime Weather</h3>
        <p className="text-sm text-gray-600">⏰ Updated: {new Date(data.updatedAt).toLocaleString()}</p>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2"><span className="text-emerald-700 font-medium">📍 Region</span><span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">{data.region}</span></div>
          <div className="flex items-center gap-2"><span className="text-emerald-700 font-medium">🌡️ Temp</span><span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700">{data.temperatureC}°C</span></div>
          <div className="flex items-center gap-2"><span className="text-emerald-700 font-medium">💧 Humidity</span><span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">{data.humidity}%</span></div>
          <div className="flex items-center gap-2"><span className="text-emerald-700 font-medium">🌬️ Wind</span><span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">{data.windKph} kph</span></div>
        </div>
      </div>
    </div>
  )
}

function fmtDateToDDMMYYYY(val) {
  if (!val) return ''
  // val expected 'YYYY-MM-DD'
  const d = new Date(val)
  if (isNaN(d)) {
    const parts = val.split('-')
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
    return val
  }
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth()+1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

function openBase64(contentType, b64) {
  try {
    const byteChars = atob(b64)
    const byteNumbers = new Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i)
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: contentType || 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch (e) {
    alert('Unable to open file')
  }
}

function RgiBirthCard() {
  const [form, setForm] = useState({ regNo: '', fullName: '', dob: '', gender: 'Male', format: 'pdf' })
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setRes(null)
    try {
      const payload = { ...form, dob: fmtDateToDDMMYYYY(form.dob) }
      const out = await rgiVerifyBirth(payload)
      setRes(out)
    } catch (err) {
      setRes({ ok: false, error: String(err?.message || err) })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="rounded-xl p-[1px] bg-gradient-to-r from-purple-500 to-rose-600">
      <div className="rounded-xl bg-white p-5">
        <h3 className="font-semibold flex items-center gap-2">🧾 RGI Birth Certificate Verification</h3>
        <form onSubmit={submit} className="mt-3 grid md:grid-cols-4 sm:grid-cols-2 gap-3">
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Reg No (B-2015...)" value={form.regNo} onChange={(e)=>setForm({...form, regNo:e.target.value})} required/>
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Full Name" value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})} required/>
          <input type="date" className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.dob} onChange={(e)=>setForm({...form, dob:e.target.value})} required/>
          <select className="border rounded-md px-3 py-2" value={form.gender} onChange={(e)=>setForm({...form, gender:e.target.value})}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <div className="md:col-span-4 flex items-center gap-2">
            <button className="btn-primary" type="submit" disabled={loading}>{loading? 'Verifying…':'Verify Birth'}</button>
            <span className="text-xs text-gray-500">Format: PDF</span>
          </div>
        </form>
        {res && (
          <div className="mt-3">
            {res.ok ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
                ✅ Verified. {res.contentType}
                <div className="mt-2 flex gap-2">
                  <button className="btn-light" onClick={()=>openBase64(res.contentType, res.data)}>Open</button>
                  <a className="btn-primary" download={`birth-certificate.${res.contentType?.includes('pdf')?'pdf':'xml'}`} href={`data:${res.contentType};base64,${res.data}`}>Download</a>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
                ⚠️ Failed {typeof res.status==='number' ? `(status ${res.status})` : ''}
                {res.error && <pre className="mt-2 text-[11px] bg-white p-2 rounded border overflow-auto">{typeof res.error==='string'?res.error:JSON.stringify(res.error,null,2)}</pre>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function RgiDeathCard() {
  const [form, setForm] = useState({ regNo: '', fullName: '', gender_deceased: 'Male', dec_name: '', dod: '', relation: 'Father', format: 'pdf' })
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState(null)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setRes(null)
    try {
      const payload = { ...form, dod: fmtDateToDDMMYYYY(form.dod) }
      const out = await rgiVerifyDeath(payload)
      setRes(out)
    } catch (err) {
      setRes({ ok: false, error: String(err?.message || err) })
    } finally { setLoading(false) }
  }
  return (
    <div className="rounded-xl p-[1px] bg-gradient-to-r from-slate-600 to-gray-700">
      <div className="rounded-xl bg-white p-5">
        <h3 className="font-semibold flex items-center gap-2">🧾 RGI Death Certificate Verification</h3>
        <form onSubmit={submit} className="mt-3 grid md:grid-cols-4 sm:grid-cols-2 gap-3">
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Reg No (D-2015...)" value={form.regNo} onChange={(e)=>setForm({...form, regNo:e.target.value})} required/>
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Applicant Full Name" value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})} required/>
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Deceased Name" value={form.dec_name} onChange={(e)=>setForm({...form, dec_name:e.target.value})} required/>
          <input type="date" className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.dod} onChange={(e)=>setForm({...form, dod:e.target.value})} required/>
          <select className="border rounded-md px-3 py-2" value={form.gender_deceased} onChange={(e)=>setForm({...form, gender_deceased:e.target.value})}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <select className="border rounded-md px-3 py-2" value={form.relation} onChange={(e)=>setForm({...form, relation:e.target.value})}>
            <option>Father</option>
            <option>Mother</option>
            <option>Spouse</option>
            <option>Other</option>
          </select>
          <div className="md:col-span-4">
            <button className="btn-primary" type="submit" disabled={loading}>{loading? 'Verifying…':'Verify Death'}</button>
          </div>
        </form>
        {res && (
          <div className="mt-3">
            {res.ok ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
                ✅ Verified. {res.contentType}
                <div className="mt-2 flex gap-2">
                  <button className="btn-light" onClick={()=>openBase64(res.contentType, res.data)}>Open</button>
                  <a className="btn-primary" download={`death-certificate.${res.contentType?.includes('pdf')?'pdf':'xml'}`} href={`data:${res.contentType};base64,${res.data}`}>Download</a>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
                ⚠️ Failed {typeof res.status==='number' ? `(status ${res.status})` : ''}
                {res.error && <pre className="mt-2 text-[11px] bg-white p-2 rounded border overflow-auto">{typeof res.error==='string'?res.error:JSON.stringify(res.error,null,2)}</pre>}
              </div>
            )}
          </div>
        )}
        <p className="mt-2 text-[11px] text-gray-500">Note: Requires proper API access (x-api-key) configured in backend .env. We do not store inputs.</p>
      </div>
    </div>
  )
}
function EshramCard() {
  const [uan, setUan] = useState('')
  const [dob, setDob] = useState('') // YYYY-MM-DD
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await validateEshram(uan.trim(), dob.trim())
      setResult(res)
    } catch (err) {
      setResult({ ok: false, error: String(err?.message || err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 to-emerald-600">
      <div className="rounded-xl bg-white p-5">
        <h3 className="font-semibold flex items-center gap-2">🪪 e-Shram UAN Validator <span className="text-xs font-normal text-gray-500">(Ministry of Labour & Employment)</span></h3>
        <form onSubmit={onSubmit} className="mt-3 grid md:grid-cols-3 sm:grid-cols-2 gap-3">
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="UAN (12 digits)" value={uan} onChange={(e)=>setUan(e.target.value)} required/>
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" type="date" placeholder="DOB (YYYY-MM-DD)" value={dob} onChange={(e)=>setDob(e.target.value)} required/>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Validating…' : 'Validate'}</button>
        </form>
        {result && (
          <div className="mt-4">
            {result.ok ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center gap-2 text-emerald-800"><span>✅</span><span className="font-medium">Valid UAN</span><span className="text-xs">(status {result.status})</span></div>
                <pre className="mt-2 text-xs overflow-auto bg-white/70 p-2 rounded border border-emerald-100 text-emerald-900">{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            ) : (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-800"><span>⚠️</span><span className="font-medium">Validation failed</span>{typeof result.status==='number' && <span className="text-xs">(status {result.status})</span>}</div>
                {result.error && <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded border border-red-100 text-red-900">{typeof result.error==='string' ? result.error : JSON.stringify(result.error, null, 2)}</pre>}
              </div>
            )}
          </div>
        )}
        <p className="mt-2 text-[11px] text-gray-500">Note: This checks UAN+DOB against official e-Shram API. We do not store UAN/DOB.</p>
      </div>
    </div>
  )
}

function AlertsCard() {
  const { data, isLoading } = useQuery({ queryKey: ['alerts'], queryFn: () => fetchDisasterAlerts() })
  if (isLoading) return <div className="card">Loading alerts...</div>
  const pillClass = (sev='') => {
    const s = sev.toLowerCase()
    if (s.includes('high')) return 'bg-red-100 text-red-700'
    if (s.includes('moderate')) return 'bg-amber-100 text-amber-700'
    if (s.includes('low')) return 'bg-emerald-100 text-emerald-700'
    return 'bg-gray-100 text-gray-700'
  }
  const borderClass = (sev='') => {
    const s = sev.toLowerCase()
    if (s.includes('high')) return 'border-red-300'
    if (s.includes('moderate')) return 'border-amber-300'
    if (s.includes('low')) return 'border-emerald-300'
    return 'border-gray-200'
  }
  return (
    <div className="card">
      <h3 className="font-semibold">⚠️ Disaster and Crop-related Alerts</h3>
      <ul className="mt-3 space-y-2">
        {data.map((a, i) => (
          <li key={i} className={`p-3 rounded-md border-l-4 flex items-start justify-between gap-4 ${borderClass(a.severity)} bg-gray-50`}>
            <div>
              <p className="font-medium">⚠️ {a.type} <span className={`ml-2 text-xs px-2 py-0.5 rounded-full uppercase ${pillClass(a.severity)}`}>{a.severity}</span></p>
              <p className="text-sm text-gray-700">{a.message}</p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(a.issuedAt).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SchemesCard() {
  const [q, setQ] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['schemes', q],
    queryFn: () => fetchGovtSchemes(q, 12),
  })

  return (
    <div className="rounded-xl p-[1px] bg-gradient-to-r from-amber-500 to-fuchsia-600">
      <div className="rounded-xl bg-white p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-semibold flex items-center gap-2">🏛️ Live Govt Schemes</h3>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Search schemes (e.g., insurance, loan, subsidy)"
              className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 border bg-gray-50 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <>
            {Array.isArray(data) && data.length > 0 ? (
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((s, i) => (
                  <a key={i} href={s.link} target="_blank" className="rounded-xl p-4 border bg-white hover:shadow transition-shadow block">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 leading-snug">{s.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">{(s.source || 'live').toUpperCase()}</span>
                    </div>
                    {s.desc && <p className="text-sm text-gray-600 mt-1 line-clamp-3">{s.desc}</p>}
                    <div className="mt-2 text-xs text-gray-500">
                      {s.updated_at ? new Date(s.updated_at).toLocaleString() : 'Updated recently'}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-md p-3 bg-amber-50 text-amber-800 text-sm">No schemes found for “{q}”. Try another search.</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ForecastCard() {
  const { data, isLoading } = useQuery({ queryKey: ['forecast'], queryFn: () => fetchForecast() })
  if (isLoading) return <div className="card">Loading forecast...</div>
  if (!data || data.length === 0) return null
  return (
    <div className="card">
      <h3 className="font-semibold">🕒 Next 24h Forecast (3h steps)</h3>
      <div className="mt-3 grid md:grid-cols-4 sm:grid-cols-2 gap-3 text-sm">
        {data.map((it, i) => (
          <div key={i} className="rounded-md p-3 border bg-gray-50">
            <div className="font-medium text-gray-800">{new Date(it.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-gray-700">🌡️ Temp: <span className="font-medium">{Math.round(it.tempC)}°C</span></div>
            {typeof it.pop === 'number' && <div className="text-gray-700">🌧️ Rain Prob: <span className="font-medium">{Math.round(it.pop * 100)}%</span></div>}
            {typeof it.rainMm === 'number' && <div className="text-gray-700">🌧️ Rain: <span className="font-medium">{it.rainMm} mm</span></div>}
            {typeof it.windKph === 'number' && <div className="text-gray-700">🌬️ Wind: <span className="font-medium">{it.windKph} kph</span></div>}
            {it.condition && <div className="text-gray-700">{it.condition}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RealTimeUpdates() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 shadow-sm">
        <h2 className="text-2xl font-semibold flex items-center gap-2">🛰️ Real-time Updates</h2>
        <p className="mt-1 text-white/90">Weather info, disaster alerts, and latest government schemes and loans.</p>
      </div>
      {/* Quick overview pictorials */}
      <section className="grid md:grid-cols-3 gap-3">
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🌤️</span>
          <div>
            <p className="font-medium">Live Weather</p>
            <p className="text-sm text-gray-600">Temp, humidity, wind</p>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>⚠️</span>
          <div>
            <p className="font-medium">Disaster Alerts</p>
            <p className="text-sm text-gray-600">Severity and time</p>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white border shadow-sm flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🏛️</span>
          <div>
            <p className="font-medium">Govt Schemes</p>
            <p className="text-sm text-gray-600">Search and open links</p>
          </div>
        </div>
      </section>
      <WeatherCard />
      <ForecastCard />
      <AlertsCard />
      <SchemesCard />
      <EshramCard />
      <RgiBirthCard />
      <RgiDeathCard />
      <Legend />
    </div>
  )
}
