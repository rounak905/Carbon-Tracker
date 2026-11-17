import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

const STATIC_FALLBACK_TIPS = [
  { text: 'Switch home and workspace lighting to high-efficiency LEDs to cut lighting power draw by 75%.', category: 'electricity', impact: 'Moderate Impact' },
  { text: 'Incorporate 2-3 plant-based meals per week to slash dietary carbon emissions by up to 35%.', category: 'food', impact: 'High Impact' },
  { text: 'Carpool, use public bus or electric rail for routine weekly commutes rather than driving alone.', category: 'transport', impact: 'High Impact' },
  { text: 'Wash clothes in cold water (30°C) instead of hot water to save 90% of washing machine energy.', category: 'electricity', impact: 'Easy Daily Habit' },
  { text: 'Install low-flow showerheads and reduce shower time by 2 minutes to conserve thousands of liters annually.', category: 'water', impact: 'Moderate Impact' },
  { text: 'Air dry dishes and laundry whenever possible to eliminate heavy appliance heating cycles.', category: 'electricity', impact: 'Easy Daily Habit' },
  { text: 'Compost organic vegetable scraps and food leftovers to prevent methane production in landfills.', category: 'waste', impact: 'High Impact' },
]

const CATEGORY_MAP = {
  transport: { label: 'Transport', icon: '🚗', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  electricity: { label: 'Energy & Power', icon: '⚡', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  food: { label: 'Food & Diet', icon: '🍽️', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  waste: { label: 'Waste & Recycling', icon: '🗑️', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  water: { label: 'Water Conservation', icon: '💧', color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
}

export default function Suggestions({ token }) {
  const [tips, setTips]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [filterCat, setFilterCat]   = useState('all')
  const [completedTips, setCompletedTips] = useState({})

  useEffect(() => {
    (async () => {
      try {
        const res = await api.authed(token).get('/suggestions')
        const rawTips = res.tips || []
        if (rawTips.length > 0) {
          // Format into structured items
          const formatted = rawTips.map((t, idx) => {
            const lower = t.toLowerCase()
            let cat = 'electricity'
            if (lower.includes('transit') || lower.includes('bus') || lower.includes('car') || lower.includes('train') || lower.includes('bike') || lower.includes('flight')) cat = 'transport'
            else if (lower.includes('plant') || lower.includes('meat') || lower.includes('meal') || lower.includes('food') || lower.includes('diet')) cat = 'food'
            else if (lower.includes('waste') || lower.includes('compost') || lower.includes('recycle') || lower.includes('bag')) cat = 'waste'
            else if (lower.includes('water') || lower.includes('shower') || lower.includes('leak')) cat = 'water'
            return {
              text: t,
              category: cat,
              impact: idx % 3 === 0 ? 'High Impact' : idx % 3 === 1 ? 'Moderate Impact' : 'Easy Daily Habit'
            }
          })
          setTips(formatted)
        } else {
          setTips(STATIC_FALLBACK_TIPS)
        }
      } catch (e) {
        setTips(STATIC_FALLBACK_TIPS)
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const toggleComplete = (idx) => {
    setCompletedTips(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const filtered = tips.filter(t => filterCat === 'all' || t.category === filterCat)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Eco Recommendations & Action Tips
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          High-yield sustainability habits customized to help reduce your personal footprint.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
            filterCat === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All Recommendations
        </button>
        {Object.keys(CATEGORY_MAP).map(key => {
          const cat = CATEGORY_MAP[key]
          return (
            <button
              key={key}
              onClick={() => setFilterCat(key)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                filterCat === key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Responsive Grid of Tip Cards (Full screen breadth) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-9 h-9 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Curating sustainability recommendations…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((tip, idx) => {
            const cat = CATEGORY_MAP[tip.category] || CATEGORY_MAP.electricity
            const isDone = !!completedTips[idx]

            return (
              <div
                key={idx}
                className={`glass-card rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                  isDone 
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md' 
                    : 'border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${cat.color}`}>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>

                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      tip.impact === 'High Impact'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : tip.impact === 'Moderate Impact'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {tip.impact}
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                    {tip.text}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {isDone ? 'Marked complete' : 'Action step'}
                  </span>
                  <button
                    onClick={() => toggleComplete(idx)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{isDone ? '✓ Completed' : 'Mark as Done'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
