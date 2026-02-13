export function speak(text, opts = {}) {
  try {
    if (!text) return
    const synth = window.speechSynthesis
    if (!synth) return
    const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('fa_voice_lang')) || 'en-IN'
    const lang = opts.lang || stored || 'en-IN'
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = typeof opts.rate === 'number' ? opts.rate : 0.95
    u.pitch = typeof opts.pitch === 'number' ? opts.pitch : 1
    const voices = synth.getVoices()
    if (voices && voices.length) {
      const prefix = (lang || '').slice(0, 2).toLowerCase()
      const v = voices.find(v => (v.lang || '').toLowerCase().startsWith(prefix))
      if (v) u.voice = v
    }
    synth.speak(u)
  } catch (_) {
    // ignore
  }
}
