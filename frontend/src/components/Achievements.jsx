import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

const BADGE_META = {
  'first-log':      { icon: '🌱', label: 'First Seed', desc: 'Recorded your very first activity', color: 'from-emerald-400 to-green-600' },
  'ten-logs':       { icon: '📊', label: 'Consistent Logger', desc: 'Recorded 10 activity entries', color: 'from-blue-400 to-indigo-600' },
  'fifty-logs':     { icon: '🏅', label: 'Climate Hero', desc: 'Reached 50 tracked activities', color: 'from-purple-400 to-purple-600' },
  'eco-explorer':   { icon: '🌍', label: 'Eco Explorer', desc: 'Logged transport, food & electricity', color: 'from-teal-400 to-cyan-600' },
  'green-commuter': { icon: '🚌', label: 'Green Commuter', desc: 'Took bus or train 5+ times', color: 'from-cyan-400 to-blue-600' },
  'streak-7':       { icon: '🔥', label: '7-Day Streak', desc: 'Maintained a 7-day daily logging streak', color: 'from-orange-400 to-red-500' },
  'streak-30':      { icon: '🌟', label: '30-Day Master', desc: 'Maintained a full month daily streak', color: 'from-amber-400 to-yellow-500' },
}

const ALL_AVAILABLE_BADGES = [
  'first-log', 'ten-logs', 'fifty-logs', 'eco-explorer', 'green-commuter', 'streak-7', 'streak-30'
]

export default function Achievements({ token }) {
  const [me, setMe]                   = useState({ achievements: [], goals: {}, streak: { current: 0 } })
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    let active = true;

    // 1. Fetch public leaderboard independently
    api.get('/leaderboard')
      .then(res => {
        if (active && res?.leaderboard) {
          setLeaderboard(res.leaderboard)
        }
      })
      .catch(err => {
        console.error('Failed to load leaderboard:', err)
      });

    // 2. Fetch current user milestone achievements
    if (token) {
      api.authed(token).get('/auth/me')
        .then(m => {
          if (active && m) setMe(m)
        })
        .catch(err => {
          console.error('Failed to load user achievements:', err)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    } else {
      setLoading(false)
    }

    return () => { active = false }
  }, [token])

  const streak  = me.streak?.current || 0
  const goal    = me.goals?.monthlyReductionKg || 10
  const badges  = me.achievements || []
  const badgeIds = new Set(badges.map(b => b.id))

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
      <div className="text-5xl mb-3 animate-bounce">🏆</div>
      <p className="text-sm font-semibold">Loading achievements & leaderboard…</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Achievements & Rankings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Track your milestone badges, active streak status, and see where you rank on the eco leaderboard.
        </p>
      </div>

      {/* Streak Hero Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
        streak >= 3 
          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/20' 
          : 'bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-900/20'
      }`}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
            {streak >= 3 ? '🔥' : '⏳'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black">{streak}-Day Daily Streak</h2>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                {streak >= 7 ? 'On Fire' : streak >= 3 ? 'Building Momentum' : 'Get Started'}
              </span>
            </div>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              {streak === 0 
                ? 'Log your environmental activities daily to unlock consistency badges and build long-term sustainable habits.' 
                : streak >= 7 
                ? 'Incredible consistency! You are well on your way to hitting your monthly reduction target.' 
                : 'Keep logging every day to reach the 7-Day Streak badge!'}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 text-center md:text-right bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3.5 border border-white/10">
          <div className="text-xs font-semibold text-white/70">Next Milestone</div>
          <div className="text-xl font-extrabold mt-0.5">
            {streak < 7 ? `${7 - streak} days to 7-Day 🔥` : streak < 30 ? `${30 - streak} days to 30-Day 🌟` : 'All streak badges unlocked!'}
          </div>
        </div>
      </div>

      {/* 2-Column Wide Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Badges Showcase (xl:col-span-7) ────────────────────────────── */}
        <div className="xl:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Badge Showcase</span>
                  <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                    {badges.length} / {ALL_AVAILABLE_BADGES.length} Unlocked
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Milestone tokens awarded for sustainable achievements
                </p>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ALL_AVAILABLE_BADGES.map(id => {
                const isUnlocked = badgeIds.has(id)
                const meta = BADGE_META[id] || { icon: '⭐', label: id, desc: 'Eco accomplishment', color: 'from-amber-400 to-yellow-500' }

                return (
                  <div
                    key={id}
                    className={`rounded-2xl p-4 border transition-all flex items-center gap-3.5 ${
                      isUnlocked
                        ? 'glass-card border-emerald-500/30 hover:border-emerald-500 shadow-md'
                        : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                      isUnlocked 
                        ? `bg-gradient-to-br ${meta.color} text-white` 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {isUnlocked ? meta.icon : '🔒'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                          {meta.label}
                        </span>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                        {meta.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Active Monthly Goal Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-white dark:bg-emerald-900 text-emerald-600">🎯</span>
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Current Monthly Target</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Reduce <span className="font-bold">{goal} kg CO₂e</span> emissions this month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Leaderboard Table (xl:col-span-5) ───────────────────────────── */}
        <div className="xl:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Community Leaderboard</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                  Top Savers
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lowest total carbon footprint takes the crown 🌿
              </p>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No ranking data available yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {leaderboard.map((user, i) => {
                  const isTop1 = i === 0
                  const isTop2 = i === 1
                  const isTop3 = i === 2

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isTop1
                          ? 'bg-amber-500/10 border-amber-300 dark:border-amber-700/60 shadow-sm'
                          : isTop2
                          ? 'bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700'
                          : isTop3
                          ? 'bg-orange-500/10 border-orange-300 dark:border-orange-800/60'
                          : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold w-6 text-center">
                          {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `${i + 1}`}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {user.username}
                            </span>
                            {(user.username === 'Aditya Sen' || user.username === me?.name || user.username === me?.username) && (
                              <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">Eco Participant</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {user.totalKg.toFixed(1)} <span className="font-normal text-slate-400">kg</span>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                          Total emitted
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
