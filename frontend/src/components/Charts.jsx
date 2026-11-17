import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts'

const TYPE_COLORS = {
  transport:   '#10b981', // emerald
  electricity: '#f59e0b', // amber
  food:        '#3b82f6', // blue
  waste:       '#8b5cf6', // purple
  water:       '#06b6d4', // cyan
  natural_gas: '#f97316', // orange
  shopping:    '#ec4899'  // pink
}

const TYPE_LABELS = {
  transport: 'Transport', 
  electricity: 'Electricity', 
  food: 'Food & Meals',
  waste: 'Waste Management', 
  water: 'Water Consumption', 
  natural_gas: 'Natural Gas', 
  shopping: 'Consumer Shopping'
}

function ModernBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-2xl px-4 py-3 shadow-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
      <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
        {payload[0].value} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
      </p>
    </div>
  )
}

function ModernPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="glass-card rounded-2xl px-4 py-3 shadow-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
      <p className="font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
        {item.value} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
      </p>
    </div>
  )
}

export default function Charts({ token }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    if (!token) {
      setLoading(false)
      return
    }
    (async () => {
      try {
        const res = await api.authed(token).get('/activities')
        if (mounted) setActivities(res.activities || [])
      } catch (e) {
        console.error('Charts activity load error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [token])

  // Daily bar chart for last 30 days
  const dailyData = (() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })
    return days.map(day => ({
      date: day.slice(5),
      kg: parseFloat(
        activities
          .filter(a => new Date(a.date).toISOString().split('T')[0] === day)
          .reduce((sum, a) => sum + a.kgCO2e, 0)
          .toFixed(2)
      )
    }))
  })()

  // Category breakdown
  const pieData = (() => {
    const grouped = activities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + a.kgCO2e
      return acc
    }, {})
    return Object.entries(grouped)
      .map(([name, value]) => ({ 
        name: TYPE_LABELS[name] || name, 
        key: name, 
        value: parseFloat(value.toFixed(2)) 
      }))
      .sort((a, b) => b.value - a.value)
  })()

  const totalKg = activities.reduce((sum, a) => sum + a.kgCO2e, 0)
  const maxDay = dailyData.reduce((max, d) => d.kg > max.kg ? d : max, { date: 'None', kg: 0 })
  const avgPerActivity = activities.length > 0 ? (totalKg / activities.length).toFixed(2) : '0.00'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Generating visual analytics…</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="text-6xl mb-2">📈</div>
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">No Analytics Data Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
          Once you record your first emission activities, interactive charts, category breakdowns, and historical trends will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Analytics & Trend Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Detailed breakdown of your carbon footprint, time-series emissions, and category distributions.
        </p>
      </div>

      {/* 4 Summary Cards (Full Screen Breadth) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Lifetime Total</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalKg.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">kg CO₂e</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Cumulative emissions</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Peak Day (30d)</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-rose-500">{maxDay.kg}</span>
            <span className="text-xs font-semibold text-slate-500">kg CO₂e</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Recorded on {maxDay.date}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Average / Entry</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-blue-500">{avgPerActivity}</span>
            <span className="text-xs font-semibold text-slate-500">kg CO₂e</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">Mean per recorded activity</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Logs</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{activities.length}</span>
            <span className="text-xs font-semibold text-slate-500">entries</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Verified data points</p>
        </div>
      </div>

      {/* 2-Column Wide Chart Grid (7 cols / 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* 30-Day Bar Chart (xl:col-span-7) */}
        <div className="xl:col-span-7 glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daily Emissions History</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Last 30 Days
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daily carbon footprint tracking trends in kg CO₂e
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={3} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<ModernBarTooltip />} />
                <Bar dataKey="kg" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (xl:col-span-5) */}
        <div className="xl:col-span-5 glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Category Distribution</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Proportion of total emissions generated by category
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <div className="w-full sm:w-1/2 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.key} fill={TYPE_COLORS[entry.key] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip content={<ModernPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="w-full sm:w-1/2 space-y-2.5 max-h-60 overflow-y-auto pr-2">
              {pieData.map(entry => {
                const pct = totalKg > 0 ? ((entry.value / totalKg) * 100).toFixed(0) : 0
                return (
                  <div key={entry.key} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[entry.key] || '#94a3b8' }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">{entry.value} kg</span>
                      <span className="text-[10px] text-slate-400 font-medium">({pct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
