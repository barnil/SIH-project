// AI services wired to backend FastAPI
export async function getCropSuggestions({ region, season, soil, marketDemand, cropType }) {
  try {
    const res = await fetch('/api/ai/crops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region, season, soil, marketDemand, cropType })
    })
    if (!res.ok) throw new Error(await res.text())
    return await res.json()
  } catch (e) {
    console.warn('getCropSuggestions failed, falling back to local rules', e)
    const base = [
      { crop: 'Wheat', reason: 'Favorable winter temperatures and good market demand.' },
      { crop: 'Paddy', reason: 'Sufficient water availability and traditional region fit.' },
      { crop: 'Millets', reason: 'Climate-resilient and high nutritional demand.' },
    ]
    return base.filter((_, i) => (marketDemand ? i !== 1 : true))
  }
}

export async function chatWithBot(message) {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data.reply || ''
  } catch (e) {
    console.warn('chatWithBot failed, using fallback', e)
    return `AI: For your query "${message}", consider soil testing and local mandi prices.`
  }
}
