import { Link } from 'react-router-dom'
import { useProfile } from '../../state/ProfileContext.jsx'
import SectionGrid from '../../shared/SectionGrid.jsx'
import Legend from '../../shared/Legend.jsx'

export default function LearningPlatform() {
  const { addPoints, awardBadge } = useProfile()
  const startModule = (title) => () => {
    addPoints(5, `Start module: ${title}`)
  }
  const completeModule = (title) => () => {
    addPoints(30, `Complete module: ${title}`)
    awardBadge(`Module: ${title}`)
  }
  const gamifiedModules = [
    { title: 'Quest-1', icon: '①', color: 'from-emerald-500 to-teal-500', desc: 'Complete this Quest to move to next.', start: startModule('Quest-1'), complete: completeModule('Quest Completed') },
    { title: 'Quest-2', icon: '②', color: 'from-fuchsia-500 to-pink-500', desc: 'Complete this Quest to move to next.', start: startModule('Quest-2'), complete: completeModule('Quest Completed') },
    { title: 'Quest-3', icon: '③', color: 'from-sky-500 to-indigo-500', desc: 'Complete this Quest to move to next..', start: startModule('Quest-3'), complete: completeModule('Quest Completed') },
    { title: 'Quest-4', icon: '④', color: 'from-sky-500 to-emerald-500', desc: 'Complete this Quest to move to next..', start: startModule('Quest-4'), complete: completeModule('Quest Completed') },
  ]

  const specialPlatform = [
    { 
      title: 'Structured Assessment Courses', 
      desc: 'Complete courses with certificates. No skipping; assessment at the end.', 
      className: 'rounded-xl p-5 bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200',
      titleClass: 'font-semibold text-emerald-900',
      descClass: 'text-emerald-800 text-sm mt-1',
      extra: (
        <div className="mt-3">
          <Link to="/special-certifications" className="btn-primary">Open Special Certificate Course</Link>
        </div>
      ) 
    },
  ]

  return (
    <div className="space-y-6">

      {/* Vivid cards for modules */}
      <section id="gamified" className="space-y-3">
        <h3 className="text-lg font-semibold"> Learning</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {gamifiedModules.map((m, i) => (
            <article key={i} className={`rounded-xl p-5 text-white shadow-sm bg-gradient-to-br ${m.color}`}>
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-semibold flex items-center gap-2"><span className="text-2xl">{m.icon}</span>{m.title}</h4>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">⭐ Lvl 0</span>
              </div>
              <p className="mt-1 text-white/90 text-sm">{m.desc}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-light" onClick={m.start}>▶️ Start (+5)</button>
                <button className="btn-outline-white" onClick={m.complete}>✅ Complete (+30, 🏅)</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SectionGrid title="Special Learning" items={specialPlatform} />
      <section className="space-y-3">
        <h3 className="sr-only">Special Learning</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <article className="rounded-xl p-5 bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 flex items-center justify-between">
            <span className="text-3xl" aria-hidden>🎓</span>
            <Link to="/special-certifications" className="btn-primary" aria-label="Open Certificates" title="Open Certificates">➡️</Link>
          </article>
        </div>
      </section>
      <Legend />
    </div>
  )
}
