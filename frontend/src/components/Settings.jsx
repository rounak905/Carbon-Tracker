import { useState } from 'react'
import { api } from '../lib/api.js'

export default function Settings({ token }) {
  // ── Goal state ──────────────────────────────────────────────────────────
  const [goal, setGoal]             = useState('')
  const [goalLoading, setGoalLoading] = useState(false)
  const [goalMsg, setGoalMsg]       = useState({ text: '', ok: true })

  // ── Password state ──────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwMsg, setPwMsg]           = useState({ text: '', ok: true })

  // ── Update goal ─────────────────────────────────────────────────────────
  const saveGoal = async (e, customVal) => {
    if (e) e.preventDefault()
    const val = customVal !== undefined ? customVal : Number(goal)
    if (!val || val <= 0) return setGoalMsg({ text: 'Please enter a positive number.', ok: false })
    
    setGoalLoading(true)
    setGoalMsg({ text: '', ok: true })
    try {
      await api.authed(token).put('/auth/goal', { monthlyReductionKg: val })
      setGoalMsg({ text: `Monthly goal successfully set to ${val} kg CO₂e!`, ok: true })
      setGoal('')
    } catch (err) {
      setGoalMsg({ text: err?.error || 'Failed to update goal.', ok: false })
    } finally {
      setGoalLoading(false)
    }
  }

  // ── Change password ─────────────────────────────────────────────────────
  const changePassword = async (e) => {
    e.preventDefault()
    if (newPw !== confirmPw) return setPwMsg({ text: 'New passwords do not match.', ok: false })
    if (newPw.length < 6) return setPwMsg({ text: 'New password must be at least 6 characters.', ok: false })
    
    setPwLoading(true)
    setPwMsg({ text: '', ok: true })
    try {
      await api.authed(token).put('/auth/password', { currentPassword: currentPw, newPassword: newPw })
      setPwMsg({ text: 'Account password updated successfully!', ok: true })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwMsg({ text: err?.error || 'Failed to change password.', ok: false })
    } finally {
      setPwLoading(false)
    }
  }

  const InputClass = "w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account & Preferences
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your monthly sustainability targets, account credentials, and platform settings.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Left Column: Monthly Goal Setting (xl:col-span-6) */}
        <div className="xl:col-span-6 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">🎯</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Reduction Goal</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Set how many kg CO₂e you aim to reduce each month.
                </p>
              </div>
            </div>

            {/* Quick Goal Presets */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Target Presets
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 35, 50].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => saveGoal(null, val)}
                    disabled={goalLoading}
                    className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                  >
                    {val} kg
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={saveGoal} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Custom Target (kg CO₂e)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    placeholder="Enter custom kg target (e.g. 25)"
                    className={InputClass}
                    required
                  />
                  <button
                    disabled={goalLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition whitespace-nowrap"
                  >
                    {goalLoading ? 'Saving…' : 'Save Goal'}
                  </button>
                </div>
              </div>

              {goalMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold border ${
                  goalMsg.ok 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}>
                  {goalMsg.text}
                </div>
              )}
            </form>
          </div>

          {/* Privacy & App Information */}
          <div className="p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🛡️</span>
              <span>Data Protection & Privacy</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your carbon metrics and activity history are stored securely in your private database. All calculations use IPCC standard emission factors to deliver accurate environmental insights.
            </p>
          </div>
        </div>

        {/* Right Column: Security & Password (xl:col-span-6) */}
        <div className="xl:col-span-6 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">🔒</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your authentication credentials
                </p>
              </div>
            </div>

            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="Enter existing password"
                  className={InputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={InputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  className={InputClass}
                  required
                />
              </div>

              {pwMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold border ${
                  pwMsg.ok 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}>
                  {pwMsg.text}
                </div>
              )}

              <button
                disabled={pwLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-xs shadow-md transition"
              >
                {pwLoading ? 'Updating credentials…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  )
}
