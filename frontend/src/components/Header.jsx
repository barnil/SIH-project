import { useProfile } from '../state/ProfileContext.jsx'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { speak } from '../shared/speech.js'

export default function Header({ onToggleSidebar, showMenuToggle = true }) 
{
  const { state, level, setSimpleMode } = useProfile()
  const location = useLocation()
  const [voiceLang, setVoiceLang] = useState(() => localStorage.getItem('fa_voice_lang') || 'en-IN')

  useEffect(() => {
    localStorage.setItem('fa_voice_lang', voiceLang)
  }, [voiceLang])

  function getGuideText(path, s) {
    const pts = typeof s.points === 'number' ? s.points : 0
    const isHindi = (voiceLang || 'en-IN').toLowerCase().startsWith('hi')
    if (isHindi) {
      const base = `KrishiYukti mein swagat hai. Aapke ${pts} points aur level ${level} hain. `
      switch (path) {
        case '/':
          return base + "Yah mukhya parda hai. Shuru karne ke liye 'Log In' dabayen."
        case '/learning':
          return base + "Yah Learning hai. Rang-birange cards par 'Start' ya 'Complete' dabayen, points aur badges milenge."
        case '/updates':
          return base + 'Yah Real-time Updates hai. Pehle weather, fir forecast, alerts aur schemes.'
        case '/ai':
          return base + 'Yah AI Suggestions hai. Baen taraf chatbot, daen taraf crop sujhav. Prashn likhen aur Send dabayen.'
        case '/special-certifications':
          return base + "Yah Special Certificate Course hai. Module kholen, 'Start' ya 'Complete' se adhik points milenge."
        case '/badges':
          return base + 'Yah Badges hai. Rangin badges mil chuke, dhundhle abhi paane hain.'
        case '/marketplace':
          return base + 'Yah Marketplace hai. Apne points se labh aur chhoot paayen.'
        case '/profile':
          return base + 'Yah Profile hai. Naam, level, points aur badges dekhen.'
        default:
          return base + 'Baen waley menu se Learning, Updates, AI, Badges, Marketplace aur Profile dekhen.'
      }
    }
    const base = `Welcome to KrishiYukti. You have ${pts} points and level ${level}. `
    switch (path) {
      case '/':
        return base + 'This is the home screen. Tap the big Log In button to start.'
      case '/learning':
        return base + 'This is Learning. Tap a colorful card to start or complete a module to earn points and badges.'
      case '/updates':
        return base + 'This is Real-time Updates. First card is the weather. Then forecast, alerts, and government schemes.'
      case '/ai':
        return base + 'This is AI Suggestions. Left side is the chat bot. Right side gives crop suggestions. Type and press Send.'
      case '/special-certifications':
        return base + 'This is Special Certificate Course. Open a module, then press Start or Mark Complete to earn big points.'
      case '/badges':
        return base + 'This is Badges. Bright badges are earned. Grey badges can be earned by learning and check-ins.'
      case '/marketplace':
        return base + 'This is Marketplace. Use your points to redeem rewards like discounts and demos.'
      case '/profile':
        return base + 'This is Profile. See your name, level, points and recent badges. Use Log Out to switch user.'
      default:
        return base + 'Use the left menu to explore Learning, Updates, AI, Badges, Marketplace and Profile.'
    }
  }

  function handleListen() {
    try {
      const synth = window.speechSynthesis
      if (!synth) { alert('Audio guide is not supported in this browser.'); return }
      const text = getGuideText(location.pathname, state)
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = voiceLang || 'en-IN'
      u.rate = 0.95
      u.pitch = 1
      const voices = synth.getVoices()
      if (voices && voices.length) {
        const langPrefix = (voiceLang || 'en-IN').slice(0,2).toLowerCase()
        const v = voices.find(v => (v.lang||'').toLowerCase().startsWith(langPrefix))
        if (v) u.voice = v
      }
      synth.speak(u)
    } catch (e) {
      console.warn('Speech failed', e)
      alert('Unable to play the audio guide.')
    }
  }
  return (
    <header className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger / three-line button to toggle sidebar */}
          {showMenuToggle && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-white/70 hover:bg-white px-2 py-2 text-emerald-700 shadow-sm"
            >
              {/* three lines icon */}
              <span className="text-lg">☰</span>
            </button>
          )}
          <img src="/krishiyukti-logo.png" alt="KrishiYukti" className="h-9 w-9 rounded-lg shadow object-cover" />
          <div>
            <img src="/brand-hero.png" alt="Krishi Yukti Yojna" className="h-8 md:h-10 object-contain" />
            <p className="text-xs text-gray-500">Learning • Real-time Updates • AI Suggestions</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <img src="/ashoka-stambh.png" alt="Ashoka Stambh" title="Ashoka Stambh" className="h-8 md:h-10 object-contain" />
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 border px-3 py-1.5 rounded-md">
            <span className="font-medium">Lvl {level}</span>
            <span className="text-gray-500">•</span>
            <span title="Total points">{state.points} pts</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border px-3 py-1.5 rounded-md" title="Daily streak">
            🔥 <span className="font-medium">{state.streakDays} day{state.streakDays===1?'':'s'}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border px-3 py-1.5 rounded-md" title="Badges">
            🏅 <span className="font-medium">{state.badges.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 hidden md:block" htmlFor="voice-select">Voice</label>
            <select
              id="voice-select"
              className="border rounded-md px-2 py-1 text-sm bg-white"
              value={voiceLang}
              onChange={(e)=>setVoiceLang(e.target.value)}
              title="Choose voice language"
            >
              <option value="en-IN">English</option>
              <option value="hi-IN">हिन्दी</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !state.simpleMode
              setSimpleMode(next)
              const isHindi = (voiceLang||'en-IN').toLowerCase().startsWith('hi')
              if (next) speak(isHindi ? 'Easy Mode chalu. Neeche bade buttons ka upyog karein.' : 'Easy Mode on. Use the big buttons at the bottom.', { lang: voiceLang })
              else speak(isHindi ? 'Easy Mode band.' : 'Easy Mode off.', { lang: voiceLang })
            }}
            aria-pressed={state.simpleMode}
            aria-label="Toggle Easy Mode"
            title="Easy Mode: big buttons, pictorial navigation"
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 shadow-sm border ${state.simpleMode ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-gray-800 border-gray-200'}`}
          >
            <span aria-hidden>🖐️</span>
            <span className="hidden sm:inline">Easy Mode</span>
          </button>
          <button
            type="button"
            onClick={handleListen}
            aria-label="Listen to page instructions"
            title="Listen to page instructions"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 shadow-sm"
          >
            <span aria-hidden>🔊</span>
            <span className="hidden sm:inline">Listen</span>
          </button>
        </div>
      </div>
    </header>
  )
}
