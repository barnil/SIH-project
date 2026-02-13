import { NavLink } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext.jsx'
import { speak } from '../shared/speech.js'

const items = [
  { to: '/learning', icon: '📚', label: 'Learning' },
  { to: '/updates', icon: '🌤️', label: 'Updates' },
  { to: '/ai', icon: '🤖', label: 'AI' },
  { to: '/marketplace', icon: '🛍️', label: 'Market' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

export default function BottomNav() {
  const { state } = useProfile()
  const voiceLang = (typeof localStorage !== 'undefined' && localStorage.getItem('fa_voice_lang')) || 'en-IN'
  const isHindi = (voiceLang || 'en-IN').toLowerCase().startsWith('hi')

  const announce = (label) => {
    const text = isHindi ? `${label} khol rahe hain.` : `Opening ${label}.`
    speak(text, { lang: voiceLang })
  }

  return (
    <nav className="easy-bottom-nav" role="navigation" aria-label="Main">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => `easy-bottom-item ${isActive ? 'active' : ''}`}
          onClick={() => announce(it.label)}
          aria-label={it.label}
        >
          <span className="easy-bottom-icon" aria-hidden>{it.icon}</span>
          <span className="easy-bottom-text">{it.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
