import { Link } from 'react-router-dom'
import { useProfile } from '../../state/ProfileContext.jsx'
import Legend from '../../shared/Legend.jsx'

export default function SpecialCertificateCourse() {
  const { addPoints, awardBadge } = useProfile()

  const specialModules = [
    {
      title: 'AI Crop Health (Structured) ',
      desc: 'Syllabus-driven lessons with quizzes. No skipping; assessment at the end.',
      onStart: () => addPoints(10, 'Start Special: AI Crop Health'),
      onComplete: () => { addPoints(120, 'Complete Special: AI Crop Health'); awardBadge('Certified: AI Crop Health (Special)') },
      color: 'from-rose-500 to-orange-500', icon: '🧬'
    },
    {
      title: 'Drone Technology in Farming (Structured)',
      desc: 'Drone safety, regulations, spraying, mapping and maintenance.',
      onStart: () => addPoints(10, 'Start Special: Drone'),
      onComplete: () => { addPoints(120, 'Complete Special: Drone'); awardBadge('Certified: Drone Tech (Special)') },
      color: 'from-indigo-500 to-purple-500', icon: '🚁'
    },
    {
      title: 'Water/Flood & Drought (Structured)',
      desc: 'Irrigation planning, flood preparedness and drought resilience.',
      onStart: () => addPoints(10, 'Start Special: Water'),
      onComplete: () => { addPoints(120, 'Complete Special: Water'); awardBadge('Certified: Water Mgmt (Special)') },
      color: 'from-emerald-500 to-cyan-500', icon: '💧'
    },
    {
      title: 'Soil Health (Structured)',
      desc: 'Soil testing, pH management, organic matter and micronutrients.',
      onStart: () => addPoints(10, 'Start Special: Soil Health'),
      onComplete: () => { addPoints(120, 'Complete Special: Soil Health'); awardBadge('Certified: Soil Health (Special)') },
      color: 'from-green-600 to-emerald-700', icon: '🌱'
    },
    {
      title: 'Fertilizer (Structured)',
      desc: 'NPK balance, application timing, slow-release and bio-fertilizers.',
      onStart: () => addPoints(10, 'Start Special: Fertilizer'),
      onComplete: () => { addPoints(120, 'Complete Special: Fertilizer'); awardBadge('Certified: Fertilizer (Special)') },
      color: 'from-lime-500 to-green-600', icon: '🧪'
    },
    {
      title: 'Finances (Structured)',
      desc: 'KCC, insurance, subsidies, budgeting and cost-benefit planning.',
      onStart: () => addPoints(10, 'Start Special: Finances'),
      onComplete: () => { addPoints(120, 'Complete Special: Finances'); awardBadge('Certified: Farm Finance (Special)') },
      color: 'from-teal-500 to-emerald-600', icon: '💰'
    },
    {
      title: 'Seed Development (Structured)',
      desc: 'Seed selection, germination, storage and hybrid development basics.',
      onStart: () => addPoints(10, 'Start Special: Seed Development'),
      onComplete: () => { addPoints(120, 'Complete Special: Seed Development'); awardBadge('Certified: Seed Development (Special)') },
      color: 'from-emerald-500 to-teal-600', icon: '🌾'
    },
    {
      title: 'Pest Control (Structured)',
      desc: 'IPM practices, biological controls, safe pesticide use and timing.',
      onStart: () => addPoints(10, 'Start Special: Pest Control'),
      onComplete: () => { addPoints(120, 'Complete Special: Pest Control'); awardBadge('Certified: Pest Control (Special)') },
      color: 'from-emerald-700 to-green-800', icon: '🐛'
    },
  ]

  // Certification Courses list removed per request, keeping only structured modules

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-amber-600 via-rose-500 to-fuchsia-600 shadow-sm">
        <h2 className="text-2xl font-semibold">🎓 Special Certificate Course</h2>
        <p className="mt-1 text-white/90">A combined view of structured Special Learning modules and Certification Courses. Progress through curated lessons and earn certificates and badges.</p>
        <div className="mt-3 flex gap-2">
          <Link to="/learning" className="btn-light">⬅️ Back to Learning Platform</Link>
          <Link to="/badges" className="btn-outline-white">🏅 View Badges</Link>
        </div>
      </div>

      {/* Special Learning modules (structured) */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Structured Modules</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {specialModules.map((m, i) => (
            <article key={i} className={`rounded-xl p-5 text-white shadow-sm bg-gradient-to-br ${m.color}`}>
              <h4 className="text-lg font-semibold flex items-center gap-2"><span className="text-2xl">{m.icon}</span>{m.title}</h4>
              <p className="text-white/90 text-sm mt-1">{m.desc}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-light" onClick={m.onStart}>▶️ Start (+10)</button>
                <button className="btn-outline-white" onClick={m.onComplete}>✅ Complete (+120, 🏅)</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Certification course list removed */}
      <Legend />
    </div>
  )
}
