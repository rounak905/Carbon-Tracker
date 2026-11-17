import { useState } from 'react'
import { api } from '../lib/api.js'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]         = useState('login') // 'login' or 'register'
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (mode === 'register' && password.length < 6) {
      setSubmitting(false)
      return setError('Password must be at least 6 characters')
    }

    try {
      if (mode === 'register') {
        await api.post('/auth/register', { username, password })
      }
      const res = await api.post('/auth/login', { username, password })
      onLogin(res.token, res.username)
    } catch (err) {
      setError(err?.error || 'Authentication failed. Please verify credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const loginAsDemo = async (customUser = 'demo') => {
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/auth/login', { username: customUser, password: 'password123' })
      onLogin(res.token, res.username)
    } catch (err) {
      setError(err?.error || 'Quick login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass-card rounded-3xl p-7 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative z-10 w-full">
      
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 mb-6">
        <button
          type="button"
          onClick={() => { setMode('login'); setError('') }}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'login'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('register'); setError('') }}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'register'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Username
          </label>
          <input
            className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. demo"
            minLength={3}
            maxLength={32}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Password
          </label>
          <input
            className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 text-white text-sm font-extrabold shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 pt-3"
        >
          {submitting ? 'Authenticating…' : mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold">Instant Sample Access</span></div>
      </div>

      <button
        type="button"
        disabled={submitting}
        onClick={() => loginAsDemo('demo')}
        className="w-full py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>⚡</span>
        <span>1-Click Sign In as Demo (Aditya Sen - 13 Activities)</span>
      </button>

      <div className="mt-4 text-center text-xs text-slate-400">
        Sample users: <span className="font-semibold text-slate-600 dark:text-slate-300">demo (Aditya Sen), Aarav Sharma, Priya Patel, Rohan Verma</span> · Password: <span className="font-semibold text-slate-600 dark:text-slate-300">password123</span>
      </div>
    </div>
  )
}
