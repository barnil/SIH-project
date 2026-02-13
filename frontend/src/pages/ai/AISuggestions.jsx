import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { chatWithBot, getCropSuggestions } from '../../services/ai.js'
import Legend from '../../shared/Legend.jsx'

function ChatPanel() {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('How to improve soil health for wheat?')
  const { mutate, isPending } = useMutation({
    mutationFn: chatWithBot,
    onSuccess: (reply) => setHistory((h) => [...h, { role: 'ai', text: reply }]),
  })

  // Voice: Speech Synthesis (output)
  const speak = (text) => {
    try {
      if (!window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-IN'
      window.speechSynthesis.speak(u)
    } catch {}
  }
  const speakLastAI = () => {
    const last = [...history].reverse().find(m => m.role === 'ai')
    if (last && last.text) speak(last.text)
  }

  // Voice: Speech Recognition (input)
  const startVoice = () => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) return
      const rec = new SR()
      rec.lang = 'en-IN'
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.onresult = (e) => {
        const transcript = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : ''
        if (transcript) setInput(transcript)
      }
      rec.start()
    } catch {}
  }

  const send = () => {
    if (!input.trim()) return
    setHistory((h) => [...h, { role: 'user', text: input }])
    mutate(input)
    setInput('')
  }

  return (
    <div className="h-full flex flex-col rounded-xl p-[1px] bg-gradient-to-br from-emerald-500 to-teal-500">
      <div className="rounded-xl bg-white p-5 flex-1 flex flex-col">
        <h3 className="font-semibold flex items-center gap-2">🤖 AI Chatbot</h3>
        <div className="mt-3 flex-1 overflow-auto space-y-2">
        {history.length === 0 && (
          <p className="text-sm text-gray-600">Ask anything about crops, climate, or market trends.</p>
        )}
        {history.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={`inline-block px-3 py-2 rounded-lg text-sm ${m.role==='user' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'}`}>{m.text}</span>
          </div>
        ))}
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type your question..." className="flex-1 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"/>
          <button className="btn-light" type="button" title="Voice input" onClick={startVoice}>🎙️</button>
          <button className="btn-light" type="button" title="Read last AI reply" onClick={speakLastAI}>🔈</button>
          <button className="btn-primary" onClick={send} disabled={isPending}>📩 Send</button>
        </div>
      </div>
      <Legend />
    </div>
  )
}

function CropSuggestForm() {
  const [form, setForm] = useState({ region: 'Punjab', season: 'Rabi', soil: 'Loamy', cropType: 'Cereal', marketDemand: true })
  const { mutate, data, isPending } = useMutation({ mutationFn: getCropSuggestions })

  const onSubmit = (e) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <div className="rounded-xl p-[1px] bg-gradient-to-br from-emerald-500 to-teal-500">
      <div className="rounded-xl bg-white p-5">
        <h3 className="font-semibold">🌱 AI-based Crop Suggestions</h3>
        <p className="text-sm text-gray-600">Takes region, season, soil, realtime weather and market demand into account (mocked).</p>
        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-3 mt-3">
          <input className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.region} onChange={e=>setForm({...form, region:e.target.value})} placeholder="Region"/>
          <select className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.season} onChange={e=>setForm({...form, season:e.target.value})}>
            <option value="Rabi">Rabi</option>
            <option value="Kharif">Kharif</option>
            <option value="Zaid">Zaid</option>
          </select>
          <select className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.soil} onChange={e=>setForm({...form, soil:e.target.value})}>
            <option>Loamy</option>
            <option>Clay</option>
            <option>Sandy</option>
            <option>Silty</option>
            <option>Peaty</option>
            <option>Chalky</option>
            <option>Black</option>
            <option>Alluvial</option>
            <option>Red</option>
          </select>
          <select className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.cropType} onChange={e=>setForm({...form, cropType:e.target.value})}>
            <option value="Cereal">Cereal</option>
            <option value="Pulse">Pulse</option>
            <option value="Oilseed">Oilseed</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Fruit">Fruit</option>
            <option value="Fibre">Fibre</option>
            <option value="Spice">Spice</option>
            <option value="Cash">Cash</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.marketDemand} onChange={e=>setForm({...form, marketDemand:e.target.checked})}/>
            Consider market demand
          </label>
          <div className="sm:col-span-2">
            <button className="btn-primary" type="submit" disabled={isPending}>🔍 Get Suggestions</button>
          </div>
        </form>
        {Array.isArray(data) && data.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((s, i) => {
              const score = typeof s.score === 'number' ? Math.max(0, Math.min(100, s.score)) : null
              const reasons = Array.isArray(s.reasons) ? s.reasons : (s.reason ? [s.reason] : [])
              return (
                <div key={i} className="rounded-xl p-4 border bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" aria-hidden>{s.emoji || '🌾'}</span>
                      <h4 className="font-semibold text-emerald-800">{s.crop || 'Suggested Crop'}</h4>
                    </div>
                    {score !== null && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{score}/100</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {s.category && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">{s.category}</span>}
                    {s.sowing_window && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">🗓 {s.sowing_window}</span>}
                    {s.water_need && <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700">💧 {s.water_need}</span>}
                    {s.yield_range && <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800">📈 {s.yield_range}</span>}
                  </div>
                  {score !== null && (
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  )}
                  {reasons.length > 0 && (
                    <ul className="mt-3 list-disc ml-5 text-sm text-gray-700 space-y-1">
                      {reasons.map((r, idx) => <li key={idx}>{r}</li>)}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AISuggestions() {
  const [tab, setTab] = useState('chat') // 'chat' | 'crops'
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-emerald-600 via-lime-500 to-cyan-500 shadow-sm">
        <h2 className="text-2xl font-semibold flex items-center gap-2">🤖 AI Suggestions</h2>
        <p className="mt-1 text-white/90">Unified chat and crop recommendations with voice input/output.</p>
        <div className="mt-4 inline-flex bg-white/20 rounded-lg overflow-hidden">
          <button onClick={()=>setTab('chat')} className={`px-4 py-2 text-sm ${tab==='chat' ? 'bg-white text-emerald-700' : 'text-white/90'}`}>💬 Chat</button>
          <button onClick={()=>setTab('crops')} className={`px-4 py-2 text-sm ${tab==='crops' ? 'bg-white text-emerald-700' : 'text-white/90'}`}>🌱 Crop Suggestions</button>
        </div>
      </div>
      {tab === 'chat' ? (
        <ChatPanel />
      ) : (
        <CropSuggestForm />
      )}
    </div>
  )
}
