// Live government schemes service via backend
export async function fetchGovtSchemes(query = '', limit = 8) {
  const qs = new URLSearchParams({ q: query, limit: String(limit) })
  const res = await fetch(`/api/updates/schemes?${qs.toString()}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
