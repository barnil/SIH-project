import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import LearningPlatform from './pages/learning/LearningPlatform.jsx'
import RealTimeUpdates from './pages/updates/RealTimeUpdates.jsx'
import AISuggestions from './pages/ai/AISuggestions.jsx'
import Badges from './pages/badges/Badges.jsx'
import SpecialCertificateCourse from './pages/learning/SpecialCertificateCourse.jsx'
import Marketplace from './pages/marketplace/Marketplace.jsx'
import Login from './pages/auth/Login.jsx'
import Profile from './pages/auth/Profile.jsx'
import { useProfile } from './state/ProfileContext.jsx'
import AdminLoading from './pages/admin/AdminLoading.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import BottomNav from './components/BottomNav.jsx'

function App() {
  const { state } = useProfile()
  const location = useLocation()
  const isLoginRoute = location.pathname === '/'
  const isLoggedIn = !!(state.userName && state.userName.trim())
  const showSidebar = !isLoginRoute && isLoggedIn
  const showMenuToggle = showSidebar // show toggle only when sidebar is applicable
  const showBottomNav = isLoggedIn && !isLoginRoute && state.simpleMode

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen((v) => !v)
  // Ensure sidebar is closed whenever we are on login or not logged in
  useEffect(() => {
    if (!showSidebar) setSidebarOpen(false)
  }, [showSidebar])
  return (
    <div className="container-app">
      <Header onToggleSidebar={toggleSidebar} showMenuToggle={showMenuToggle} />
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-12 gap-6 ${showBottomNav ? 'pb-24' : ''}`}>
        {showSidebar && sidebarOpen && (
        <aside className="col-span-12 md:col-span-3">
          <Sidebar />
          <nav className="mt-4 card">
            <ul className="space-y-2">
              <li>
                <NavLink
                  className={({isActive})=>`block px-3 py-2 rounded-md ${isActive? 'bg-emerald-100 text-emerald-700':'hover:bg-gray-100'}`}
                  to="/learning"
                  title="Learning Platform"
                >
                  <span className="mr-2" aria-hidden>📚</span>
                  <span>Learning</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({isActive})=>`block px-3 py-2 rounded-md ${isActive? 'bg-emerald-100 text-emerald-700':'hover:bg-gray-100'}`}
                  to="/updates"
                  title="Real-time Updates"
                >
                  <span className="mr-2" aria-hidden>🌤️</span>
                  <span>Updates</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({isActive})=>`block px-3 py-2 rounded-md ${isActive? 'bg-emerald-100 text-emerald-700':'hover:bg-gray-100'}`}
                  to="/ai"
                  title="AI Suggestions"
                >
                  <span className="mr-2" aria-hidden>🤖</span>
                  <span>AI</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({isActive})=>`block px-3 py-2 rounded-md ${isActive? 'bg-emerald-100 text-emerald-700':'hover:bg-gray-100'}`}
                  to="/special-certifications"
                  title="Special Certificate Course"
                >
                  <span className="mr-2" aria-hidden>🎓</span>
                  <span>Certificates</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({isActive})=>`block px-3 py-2 rounded-md ${isActive? 'bg-emerald-100 text-emerald-700':'hover:bg-gray-100'}`}
                  to="/badges"
                  title="Badges"
                >
                  <span className="mr-2" aria-hidden>🏅</span>
                  <span>Badges</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({isActive})=>`block px-3 py-2 rounded-md ${isActive? 'bg-emerald-100 text-emerald-700':'hover:bg-gray-100'}`}
                  to="/marketplace"
                  title="Marketplace"
                >
                  <span className="mr-2" aria-hidden>🛍️</span>
                  <span>Marketplace</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({isActive})=>`block px-3 py-2 rounded-md ${isActive? 'bg-emerald-100 text-emerald-700':'hover:bg-gray-100'}`}
                  to="/profile"
                  title="Profile"
                >
                  <span className="mr-2" aria-hidden>👤</span>
                  <span>Profile</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        )}
        <main className={`col-span-12 ${showSidebar && sidebarOpen ? 'md:col-span-9' : 'md:col-span-12'}`}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/learning" element={<LearningPlatform />} />
            <Route path="/updates" element={<RealTimeUpdates />} />
            <Route path="/ai" element={<AISuggestions />} />
            <Route path="/special-certifications" element={<SpecialCertificateCourse />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/loading" element={<AdminLoading />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default App
