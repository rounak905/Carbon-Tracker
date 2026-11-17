import { useState } from 'react'

const NAV_ITEMS = [
  { key: 'landing',      label: 'Home',         icon: '🏡' },
  { key: 'dashboard',    label: 'Dashboard',    icon: '📊' },
  { key: 'log',          label: 'Log Activity', icon: '➕' },
  { key: 'charts',       label: 'Analytics',    icon: '📈' },
  { key: 'suggestions',  label: 'Eco Tips',     icon: '💡' },
  { key: 'achievements', label: 'Milestones',   icon: '🏆' },
  { key: 'settings',     label: 'Settings',     icon: '⚙️' },
]

export default function Navbar({ username, setView, onLogout, currentView, darkMode, toggleDark }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const NavBtn = ({ item }) => {
    const isActive = currentView === item.key
    return (
      <button
        onClick={() => { setView(item.key); setMenuOpen(false) }}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
          isActive
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-1 ring-emerald-500/50'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
        }`}
      >
        <span className="text-base leading-none">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    )
  }

  // Initials avatar
  const initials = username ? username.slice(0, 2).toUpperCase() : '?'

  return (
    <header className="glass-nav sticky top-0 z-40 w-full transition-all duration-200">
      <div className="app-container flex items-center justify-between py-3">

        {/* Brand Logo (routes to Landing Page) */}
        <div 
          onClick={() => setView('landing')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xl shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
            🌿
          </div>
          <div>
            <div className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
              Carbon<span className="text-emerald-500">Tracker</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Eco Dashboard
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/70 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {NAV_ITEMS.map(item => <NavBtn key={item.key} item={item} />)}
        </nav>

        {/* Right side: quick log + dark mode + user + logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Record Emission button */}
          <button
            onClick={() => setView('log')}
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/30 ring-1 ring-emerald-500/40 transition-all transform hover:scale-105 active:scale-95"
            title="Record new carbon emission"
          >
            <span className="text-base leading-none">➕</span>
            <span>Record Emission</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-base border border-slate-200 dark:border-slate-700/70"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* User profile capsule */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/20 shadow-sm">
              {initials}
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden md:inline">
              {username}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Log out"
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 transition-colors"
          >
            Logout
          </button>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            aria-label="Toggle menu"
          >
            <span className={`block w-4 h-0.5 bg-current transition-transform duration-200 ${menuOpen ? 'translate-y-1 rotate-45' : ''}`} />
            <span className={`block w-4 h-0.5 bg-current my-0.5 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-4 h-0.5 bg-current transition-transform duration-200 ${menuOpen ? '-translate-y-1 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1.5 shadow-xl">
          {NAV_ITEMS.map(item => <NavBtn key={item.key} item={item} />)}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">{initials}</div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{username}</span>
            </div>
            <button onClick={() => { onLogout(); setMenuOpen(false) }} className="text-xs text-rose-500 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
