const TOKEN_KEY = 'fa_auth_token_v1'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function register(email, password, fullName) {
  const data = await api('/auth/register', { method: 'POST', body: { email, password, full_name: fullName }})
  setToken(data.access_token)
  return data
}

export async function login(email, password) {
  const data = await api('/auth/login', { method: 'POST', body: { email, password }})
  setToken(data.access_token)
  return data
}

export async function me() {
  return api('/auth/me')
}

export async function linkDevice(deviceId) {
  return api('/auth/link-device', { method: 'POST', body: { device_id: deviceId }})
}
