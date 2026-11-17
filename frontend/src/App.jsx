// Main App Component
import { useEffect, useState } from 'react'
import { api } from './lib/api.js'
import LandingPage from './components/LandingPage.jsx'
import Login from './components/Login.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ActivityForm from './components/ActivityForm.jsx'
import Suggestions from './components/Suggestions.jsx'
import Achievements from './components/Achievements.jsx'
import Charts from './components/Charts.jsx'
import Settings from './components/Settings.jsx'

function App() {
  const [token,    setToken]    = useState(localStorage.getItem('token') || '')
  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [view,     setView]     = useState('landing') // Default: Landing Page introduces the problem & solution
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'dark')

  // Handle expired/invalid session event
  useEffect(() => {
    const onAuthExpired = () => {
      onLogout()
    }
    window.addEventListener('auth:expired', onAuthExpired)
    return () => window.removeEventListener('auth:expired', onAuthExpired)
  }, [])

  // Validate stored token with backend
  useEffect(() => {
    if (token) {
      api.authed(token).get('/auth/me').catch(err => {
        console.warn('Stored token is invalid or expired:', err)
        onLogout()
      })
    }
  }, [token])

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleDark = () => setDarkMode(d => !d)

  const onLogin = (t, u) => {
    setToken(t); setUsername(u)
    localStorage.setItem('token', t)
    localStorage.setItem('username', u)
    setView('dashboard')
  }

  const onLogout = () => {
    setToken(''); setUsername('')
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setView('landing')
  }

  // ── 1. Landing Page View ──────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <LandingPage
        token={token}
        username={username}
        setView={setView}
        darkMode={darkMode}
        toggleDark={toggleDark}
        onLogin={onLogin}
      />
    )
  }

  // ── 2. Login View (Shown when unauthenticated or navigating to login) ──
  if (view === 'login' || !token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Ambient gradient blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setView('landing')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>

            <button 
              onClick={toggleDark} 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-all"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-500/25 mb-4 text-3xl">
              🌿
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Carbon <span className="text-emerald-500">Tracker</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
              Measure your daily impact. Act sustainably.
            </p>
          </div>

          <Login onLogin={onLogin} />
        </div>
      </div>
    )
  }

  // ── 3. Authenticated App Layout (Dashboard, Log, Analytics, Milestones) ─
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar
        username={username}
        setView={setView}
        onLogout={onLogout}
        currentView={view}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />

      <main className="flex-1 app-container py-8">
        {view === 'dashboard'    && <Dashboard    token={token} setView={setView} />}
        {view === 'log'          && <ActivityForm token={token} onLogged={() => setView('dashboard')} />}
        {view === 'charts'       && <Charts       token={token} />}
        {view === 'suggestions'  && <Suggestions  token={token} />}
        {view === 'achievements' && <Achievements token={token} />}
        {view === 'settings'     && <Settings     token={token} />}
      </main>
    </div>
  )
}

export default App
