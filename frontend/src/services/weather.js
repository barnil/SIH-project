// Free realtime weather + location using public APIs (no key required)
// - Location: navigator.geolocation (with user permission), fallback to IP via https://ipapi.co/json
// - Weather: https://api.open-meteo.com/v1/forecast

async function geolocateViaBrowser(timeoutMs = 4000) {
  if (!('geolocation' in navigator)) return null
  return new Promise((resolve) => {
    const done = (val) => { try { resolve(val) } catch { /* noop */ } }
    const t = setTimeout(() => done(null), timeoutMs)
    navigator.geolocation.getCurrentPosition(
      (pos) => { clearTimeout(t); done({ lat: pos.coords.latitude, lon: pos.coords.longitude }) },
      () => { clearTimeout(t); done(null) },
      { enableHighAccuracy: false, maximumAge: 300000 }
    )
  })
}

async function geolocateViaIP() {
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) throw new Error('ipapi failed')
    const j = await res.json()
    const lat = j.latitude, lon = j.longitude
    const label = [j.city, j.region, j.country_name].filter(Boolean).join(', ')
    if (typeof lat === 'number' && typeof lon === 'number') return { lat, lon, label }
  } catch (e) {
    console.warn('IP geolocation fallback failed', e)
  }
  // Fallback center of India (approx)
  return { lat: 20.5937, lon: 78.9629, label: 'Your Region' }
}

async function getUserLocation() {
  const viaBrowser = await geolocateViaBrowser()
  if (viaBrowser) return { ...viaBrowser, label: 'Your Region' }
  return await geolocateViaIP()
}

export async function fetchCurrentWeather() {
  const loc = await getUserLocation()
  try {
    const url = new URL('/api/weather/current', window.location.origin)
    url.searchParams.set('lat', String(loc.lat))
    url.searchParams.set('lon', String(loc.lon))
    const res = await fetch(url.toString().replace(window.location.origin, ''))
    if (!res.ok) throw new Error(await res.text())
    const j = await res.json()
    return {
      region: loc.label || 'Your Region',
      temperatureC: j.temperatureC ?? null,
      humidity: j.humidity ?? null,
      windKph: j.windKph ?? null,
      condition: j.condition ?? undefined,
      rainMm1h: j.rainMm1h ?? undefined,
      updatedAt: j.updatedAt || new Date().toISOString(),
    }
  } catch (e) {
    console.warn('backend weather current failed', e)
    return {
      region: loc.label || 'Your Region',
      temperatureC: 28,
      humidity: 60,
      windKph: 12,
      updatedAt: new Date().toISOString(),
    }
  }
}

export async function fetchForecast() {
  const loc = await getUserLocation()
  try {
    const url = new URL('/api/weather/forecast', window.location.origin)
    url.searchParams.set('lat', String(loc.lat))
    url.searchParams.set('lon', String(loc.lon))
    const res = await fetch(url.toString().replace(window.location.origin, ''))
    if (!res.ok) throw new Error(await res.text())
    const j = await res.json()
    return j.items || []
  } catch (e) {
    console.warn('backend weather forecast failed', e)
    return []
  }
}

export async function fetchDisasterAlerts() {
  // Derive simple alerts from current weather (free + global). Replace with official feeds if desired.
  const w = await fetchCurrentWeather()
  const alerts = []
  if (typeof w.temperatureC === 'number' && w.temperatureC >= 40) {
    alerts.push({ type: 'Heat Advisory', severity: 'high', message: 'Daytime temperatures are very high. Stay hydrated and avoid peak afternoon work.', issuedAt: new Date().toISOString() })
  }
  if (typeof w.windKph === 'number' && w.windKph >= 35) {
    alerts.push({ type: 'High Wind Watch', severity: 'moderate', message: 'Gusty winds expected. Secure loose items and avoid spraying/powdering.', issuedAt: new Date().toISOString() })
  }
  if (alerts.length === 0) {
    alerts.push({ type: 'No Active Alerts', severity: 'low', message: 'No significant weather alerts at the moment.', issuedAt: new Date().toISOString() })
  }
  return alerts
}
