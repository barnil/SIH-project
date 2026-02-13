import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getToken as getAuthToken, login as authLogin, register as authRegister, me as authMe, linkDevice as authLinkDevice } from '../services/auth.js'

const ProfileContext = createContext(null)
const STORAGE_KEY = 'fa_profile_v1'
const DEVICE_KEY = 'fa_device_id_v1'

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    const gen = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36))
    id = gen
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

async function apiPost(path, body) {
  try {
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    return await res.json()
  } catch (e) {
    console.warn('API POST failed', path, e)
    return null
  }
}

async function apiGet(path, params) {
  const qs = params ? ('?' + new URLSearchParams(params).toString()) : ''
  try {
    const res = await fetch(`/api${path}${qs}`)
    if (!res.ok) throw new Error(await res.text())
    return await res.json()
  } catch (e) {
    console.warn('API GET failed', path, e)
    return null
  }
}

function todayISO() {
  const d = new Date()
  d.setHours(0,0,0,0)
  return d.toISOString()
}

export function ProfileProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {
      name: 'Farmer',
      points: 0,
      badges: [], // e.g. ['Starter', '1-Week Streak']
      lastCheckDate: null, // ISO midnight
      streakDays: 0,
      lastClaimISO: null, // date string for daily check-in points claim
      userName: '',
      deviceId: '',
      authUser: null,
      simpleMode: (localStorage.getItem('fa_simple_mode') === '1')
    }
  })

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    try { localStorage.setItem('fa_simple_mode', state.simpleMode ? '1' : '0') } catch (_) {}
  }, [state])

  // On mount: ensure deviceId and init profile with backend
  useEffect(() => {
    const id = getDeviceId()
    setState((s) => ({ ...s, deviceId: id }))
    ;(async () => {
      const res = await apiPost('/profile/init', { device_id: id, user_name: state.userName || undefined })
      if (res) {
        setState((s) => ({
          ...s,
          userName: res.user_name ?? s.userName,
          points: typeof res.points === 'number' ? res.points : s.points,
          badges: Array.isArray(res.badges) ? res.badges : s.badges,
        }))
      }
      // If authenticated, link device and fetch user
      try {
        if (getAuthToken()) {
          const u = await authMe()
          setState((s) => ({ ...s, authUser: u }))
          await authLinkDevice(id)
          // If no local name, use full_name or email local part
          if (!state.userName || !state.userName.trim()) {
            const name = u.full_name || (u.email ? u.email.split('@')[0] : 'Farmer')
            setState((s) => ({ ...s, userName: name }))
            await apiPost('/profile/name', { device_id: id, user_name: name })
          }
        }
      } catch (e) {
        // ignore auth errors
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Daily streak tick on mount
  useEffect(() => {
    const last = state.lastCheckDate ? new Date(state.lastCheckDate) : null
    const nowISO = todayISO()
    if (!last) {
      setState((s) => ({ ...s, lastCheckDate: nowISO, streakDays: 1 }))
      return
    }
    const today = new Date(nowISO)
    const diffDays = Math.round((today - last) / (24*3600*1000))
    if (diffDays === 0) return
    if (diffDays === 1) {
      setState((s) => ({ ...s, lastCheckDate: nowISO, streakDays: s.streakDays + 1 }))
    } else if (diffDays > 1) {
      setState((s) => ({ ...s, lastCheckDate: nowISO, streakDays: 1 }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addPoints = (n, reason = 'Activity') => {
    setState((s) => ({ ...s, points: s.points + n })) // optimistic
    const id = state.deviceId || getDeviceId()
    apiPost('/profile/add-points', { device_id: id, delta: n, reason }).then((res) => {
      if (res && typeof res.points === 'number') {
        setState((s) => ({ ...s, points: res.points, badges: Array.isArray(res.badges) ? res.badges : s.badges }))
      }
    })
  }

  const awardBadge = (name) => {
    setState((s) => s.badges.includes(name) ? s : { ...s, badges: [...s.badges, name] }) // optimistic
    const id = state.deviceId || getDeviceId()
    apiPost('/profile/award-badge', { device_id: id, badge: name }).then((res) => {
      if (res && Array.isArray(res.badges)) {
        setState((s) => ({ ...s, badges: res.badges }))
      }
    })
  }

  // Simple level system: 100 pts per level
  const level = useMemo(() => Math.floor(state.points / 100) + 1, [state.points])

  // Auto-award streak badges
  useEffect(() => {
    if (state.streakDays >= 1) awardBadge('Starter')
    if (state.streakDays >= 3) awardBadge('3-Day Streak')
    if (state.streakDays >= 7) awardBadge('1-Week Streak')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.streakDays])

  // Auto-award point milestone badges
  useEffect(() => {
    const p = state.points
    if (p >= 100) awardBadge('Rising Farmer (100 pts)')
    if (p >= 250) awardBadge('Skilled Cultivator (250 pts)')
    if (p >= 500) awardBadge('Expert Agronomist (500 pts)')
    if (p >= 1000) awardBadge('Master of Fields (1000 pts)')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.points])

  async function refreshProfile() {
    const id = state.deviceId || getDeviceId()
    const res = await apiGet('/profile', { deviceId: id })
    if (res) {
      setState((s) => ({
        ...s,
        userName: res.user_name ?? s.userName,
        points: typeof res.points === 'number' ? res.points : s.points,
        badges: Array.isArray(res.badges) ? res.badges : s.badges,
      }))
    }
  }

  const value = {
    state,
    level,
    addPoints,
    awardBadge,
    refreshProfile,
    setSimpleMode: (on) => {
      setState((s) => ({ ...s, simpleMode: !!on }))
      try { localStorage.setItem('fa_simple_mode', on ? '1' : '0') } catch (_) {}
    },
    authRegister: async (email, password, fullName) => {
      const data = await authRegister(email, password, fullName)
      const u = await authMe()
      setState((s) => ({ ...s, authUser: u }))
      const id = state.deviceId || getDeviceId()
      await authLinkDevice(id)
      const name = fullName || (u.email ? u.email.split('@')[0] : 'Farmer')
      setState((s) => ({ ...s, userName: name }))
      await apiPost('/profile/name', { device_id: id, user_name: name })
    },
    authLogin: async (email, password) => {
      const data = await authLogin(email, password)
      const u = await authMe()
      setState((s) => ({ ...s, authUser: u }))
      const id = state.deviceId || getDeviceId()
      await authLinkDevice(id)
      // keep existing name if present
      if (!state.userName || !state.userName.trim()) {
        const name = u.full_name || (u.email ? u.email.split('@')[0] : 'Farmer')
        setState((s) => ({ ...s, userName: name }))
        await apiPost('/profile/name', { device_id: id, user_name: name })
      }
    },
    setUserName: (name) => {
      setState((s) => ({ ...s, userName: name }))
      const id = state.deviceId || getDeviceId()
      apiPost('/profile/name', { device_id: id, user_name: name })
    },
    dailyCheckIn: () => {
      const today = todayISO()
      if (state.lastClaimISO === today) return false
      // optimistic local increment
      setState((s) => ({ ...s, lastClaimISO: today, points: s.points + 5 }))
      // persist to backend without double-increment locally
      const id = state.deviceId || getDeviceId()
      apiPost('/profile/add-points', { device_id: id, delta: 5, reason: 'Daily Check-in' }).then((res) => {
        if (res && typeof res.points === 'number') {
          setState((s) => ({ ...s, points: res.points, badges: Array.isArray(res.badges) ? res.badges : s.badges }))
        }
      })
      return true
    },
  }

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
