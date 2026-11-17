import { useEffect, useState, useMemo } from 'react'
import { api } from '../lib/api.js'

const TYPE_ICONS = {
  transport: '🚗', 
  electricity: '⚡', 
  food: '🍽️',
  waste: '🗑️', 
  water: '💧', 
  natural_gas: '🔥', 
  shopping: '🛍️'
}

const TYPE_NAMES = {
  transport: 'Transport',
  electricity: 'Electricity',
  food: 'Food & Dining',
  waste: 'Waste',
  water: 'Water Use',
  natural_gas: 'Natural Gas',
  shopping: 'Shopping'
}

const TYPE_COLORS = {
  transport: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  electricity: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  food: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  waste: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  water: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  natural_gas: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  shopping: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800',
}

const QUICK_PRESETS = [
  { label: '10km Car Commute', icon: '🚗', type: 'transport', subtype: 'car_km', amount: 10, note: 'Quick add: Car ride' },
  { label: '15km Public Bus', icon: '🚌', type: 'transport', subtype: 'bus_km', amount: 15, note: 'Quick add: Bus transit' },
  { label: 'Plant-Based Meal', icon: '🥗', type: 'food', subtype: 'vegetarian_meal', amount: 1, note: 'Quick add: Veg meal' },
  { label: '5 kWh Electricity', icon: '⚡', type: 'electricity', subtype: 'kwh', amount: 5, note: 'Quick add: Daily power' },
]

// Inline edit modal
const ELECTRONIC_DEVICE_OPTIONS = [
  ['Smartphone', '📱 Smartphone (55 kg CO₂e)'],
  ['Tablet',     '📟 Tablet (100 kg CO₂e)'],
  ['Laptop',     '💻 Laptop (150 kg CO₂e)'],
  ['Desktop PC', '🖥️ Desktop PC (350 kg CO₂e)'],
  ['Monitor',    '🖥️ Monitor (100 kg CO₂e)'],
  ['Other',      '🔌 Other (70 kg CO₂e)'],
]

function EditModal({ activity, token, onSave, onClose }) {
  const SUBTYPES = {
    transport:   [['car_km','🚗 Car (km)'],['bus_km','🚌 Bus (km)'],['train_km','🚆 Train (km)'],['flight_km','✈️ Flight (km)']],
    electricity: [['kwh','⚡ Electricity (kWh)']],
    food:        [['chicken_meal','🍗 Chicken meal'],['vegetarian_meal','🥗 Vegetarian meal'],['dairy_serving','🥛 Dairy serving']],
    waste:       [['bag_kg','🗑️ Waste (kg)']],
    water:       [['liters','💧 Water (liters)']],
    natural_gas: [['cubic_meter','🔥 Natural Gas (m³)']],
    shopping:    [['clothing_item','👕 Clothing item'],['electronics_item','📱 Electronics item']]
  }

  const [type, setType]             = useState(activity.type)
  const [subtype, setSubtype]       = useState(activity.subtype)
  const [deviceType, setDeviceType] = useState(activity.deviceType || 'Smartphone')
  const [amount, setAmount]         = useState(String(activity.amount))
  const [note, setNote]             = useState(activity.note || '')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const inputCls = "w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium transition"

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = { 
        type, 
        subtype, 
        amount: Number(amount), 
        note 
      }
      if (type === 'shopping' && subtype === 'electronics_item') {
        payload.deviceType = deviceType
      }
      await api.authed(token).put(`/activities/${activity._id}`, payload)
      onSave()
    } catch (err) { setError(err?.error || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={e => e.stopPropagation()}
        className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">✏️</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update emission activity records</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">✕</button>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-sm font-medium border border-rose-200 dark:border-rose-900">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Category</label>
            <select value={type} onChange={e => { setType(e.target.value); setSubtype(SUBTYPES[e.target.value]?.[0]?.[0] || '') }} className={inputCls}>
              {Object.keys(SUBTYPES).map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t.replace('_',' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Subtype</label>
            <select value={subtype} onChange={e => setSubtype(e.target.value)} className={inputCls}>
              {(SUBTYPES[type] || []).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          {type === 'shopping' && subtype === 'electronics_item' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Electronic Device Type
              </label>
              <select value={deviceType} onChange={e => setDeviceType(e.target.value)} className={inputCls}>
                {ELECTRONIC_DEVICE_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Amount / Units</label>
            <input type="number" step="any" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Note</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)…" className={inputCls} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
          <button disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold shadow-md shadow-emerald-600/30 transition">
            {saving ? 'Updating…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Dashboard({ token, setView }) {
  const [data, setData]             = useState({ activities: [], totalKg: 0 })
  const [me, setMe]                 = useState({ goals: { monthlyReductionKg: 10 }, streak: { current: 0 } })
  const [loading, setLoading]       = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [editActivity, setEditActivity] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [quickLogging, setQuickLogging] = useState(false)
  const [quickNotice, setQuickNotice] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      if (token) {
        const [res, meRes] = await Promise.allSettled([
          api.authed(token).get('/activities'),
          api.authed(token).get('/auth/me')
        ])
        if (res.status === 'fulfilled' && res.value) {
          setData(res.value)
        }
        if (meRes.status === 'fulfilled' && meRes.value) {
          setMe(meRes.value)
        }
      }
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity entry?')) return
    setDeletingId(id)
    try { 
      await api.authed(token).delete(`/activities/${id}`)
      await load() 
    } catch (e) { 
      alert(e?.error || 'Delete failed') 
    } finally { 
      setDeletingId(null) 
    }
  }

  const handleQuickLog = async (preset) => {
    setQuickLogging(true)
    try {
      await api.authed(token).post('/activities', {
        type: preset.type,
        subtype: preset.subtype,
        amount: preset.amount,
        date: new Date().toISOString().split('T')[0],
        note: preset.note
      })
      setQuickNotice(`Added ${preset.label}!`)
      setTimeout(() => setQuickNotice(''), 3000)
      await load()
    } catch (e) {
      alert(e?.error || 'Quick log failed')
    } finally {
      setQuickLogging(false)
    }
  }

  // ── Computations ──────────────────────────────────────────────────────────
  const totalKg    = data.totalKg || 0
  const acts       = data.activities || []
  const uniqueDays = new Set(acts.map(a => new Date(a.date).toISOString().split('T')[0])).size
  const dailyAvg   = uniqueDays > 0 ? (totalKg / uniqueDays).toFixed(2) : '0.00'
  const trees      = (totalKg / 21.77).toFixed(1)   // avg tree absorbs ~21.77 kg CO₂/yr
  const streak     = me?.streak?.current || 0
  const goal       = me?.goals?.monthlyReductionKg || 10

  // Goal progress: compare this month's total vs goal
  const thisMonth  = acts.filter(a => {
    const d = new Date(a.date); const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  }).reduce((s, a) => s + a.kgCO2e, 0)
  
  const progressPct = Math.min(100, Math.round((thisMonth / (goal + thisMonth || 1)) * 100))

  // Real world equivalents
  const milesDriven = Math.round(totalKg * 2.5) // ~2.5 miles of gas car per kg
  const phonesCharged = Math.round(totalKg * 122) // ~122 smartphone charges per kg

  // Filtered activities
  const filteredActs = useMemo(() => {
    return acts.slice().reverse().filter(a => {
      const matchType = filterType === 'all' || a.type === filterType
      const matchSearch = !searchQuery || 
        a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subtype.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.deviceType && a.deviceType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.note && a.note.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchType && matchSearch
    })
  }, [acts, filterType, searchQuery])

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* ── Welcome Banner / Quick Action Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sustainability Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time environmental footprint, tracking metrics & carbon reduction insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {quickNotice && (
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3.5 py-2 rounded-full border border-emerald-300 dark:border-emerald-700 animate-pulse">
              ✓ {quickNotice}
            </span>
          )}
          {/* Bigger, High-Visibility Record Emission Button */}
          <button
            onClick={() => setView?.('log')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl shadow-xl shadow-emerald-600/35 text-base sm:text-lg transition-all transform hover:scale-105 active:scale-95 ring-4 ring-emerald-400/20 whitespace-nowrap"
          >
            <span className="text-xl sm:text-2xl leading-none">➕</span>
            <span>Record Emission</span>
          </button>
        </div>
      </div>

      {/* ── High-Visibility "Record Emission" Hero Banner ──────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-6 sm:p-8 text-white shadow-2xl shadow-emerald-600/20 border border-emerald-400/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl sm:text-4xl shadow-inner border border-white/20 flex-shrink-0">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Record Your Carbon Emission</h2>
                <span className="bg-white/20 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                  Quick Log
                </span>
              </div>
              <p className="text-emerald-100 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
                Log your commute, meals, electricity, or gas in seconds. Keep your daily streak alive and stay within your monthly reduction target!
              </p>
            </div>
          </div>

          <button
            onClick={() => setView?.('log')}
            className="inline-flex items-center justify-center gap-3 bg-white text-emerald-900 hover:bg-emerald-50 font-black px-8 py-4 sm:py-5 rounded-2xl shadow-2xl hover:shadow-emerald-950/40 text-base sm:text-xl transition-all transform hover:scale-105 active:scale-95 group flex-shrink-0 whitespace-nowrap"
          >
            <span className="text-2xl sm:text-3xl group-hover:rotate-90 transition-transform duration-200">➕</span>
            <span>Record Emission Now</span>
          </button>
        </div>
      </div>

      {/* ── 4 Main Metric Cards (Full screen breadth) ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Card 1: Total Footprint */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Carbon</span>
            <span className="text-2xl p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">🌍</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {totalKg.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">kg CO₂e</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All recorded emissions</span>
          </div>
        </div>

        {/* Card 2: Daily Average */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily Average</span>
            <span className="text-2xl p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">📅</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {dailyAvg}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">kg / active day</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Across {uniqueDays} active tracking day{uniqueDays !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Card 3: Streak */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Streak</span>
            <span className="text-2xl p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {streak >= 3 ? '🔥' : '⏳'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {streak}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">day{streak !== 1 ? 's' : ''} in a row</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{streak === 0 ? 'Log today to kickstart streak' : 'Streak milestone on track'}</span>
          </div>
        </div>

        {/* Card 4: Trees Needed */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Offset Required</span>
            <span className="text-2xl p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">🌳</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {trees}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">mature trees</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
            <span>Absorbs ~21.8 kg CO₂/tree/yr</span>
          </div>
        </div>

      </div>

      {/* ── Responsive Wide Dashboard Layout (Main 8-cols, Side 4-cols) ──── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Left / Main Content Column (xl:col-span-8) ──────────────────── */}
        <div className="xl:col-span-8 space-y-8">

          {/* Monthly Reduction Goal Widget */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                    Monthly Reduction Progress
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Current month target: reduce <span className="font-semibold text-emerald-600 dark:text-emerald-400">{goal} kg CO₂e</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {thisMonth.toFixed(1)} kg logged this month
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {progressPct}% capacity
                </span>
              </div>
            </div>

            {/* Gradient progress meter with milestone markers */}
            <div className="relative pt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    progressPct > 80 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-md shadow-rose-500/20' 
                      : progressPct > 50 
                      ? 'bg-gradient-to-r from-emerald-500 to-amber-500' 
                      : 'bg-gradient-to-r from-teal-400 to-emerald-500 shadow-md shadow-emerald-500/20'
                  }`}
                  style={{ width: `${Math.max(4, progressPct)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2 px-1">
                <span>0 kg (Target Start)</span>
                <span>Milestone: {(goal * 0.5).toFixed(1)} kg</span>
                <span>Goal Ceiling: {goal} kg</span>
              </div>
            </div>
          </div>

          {/* Recent Activities Section with Filters & Search */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Activity Log</span>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                    {filteredActs.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  All emissions logged with emission factors applied
                </p>
              </div>

              {/* Search input */}
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by note or category..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                )}
              </div>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  filterType === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Activities
              </button>
              {Object.keys(TYPE_ICONS).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    filterType === t
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{TYPE_ICONS[t]}</span>
                  <span>{TYPE_NAMES[t] || t}</span>
                </button>
              ))}
            </div>

            {/* Activities Table / List */}
            {loading ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium">Loading activity entries…</p>
              </div>
            ) : filteredActs.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
                <div className="text-5xl mb-3">🌱</div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No activities match criteria</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {acts.length === 0 
                    ? 'Start tracking your environmental impact by logging your first commute, meal, or utility usage!' 
                    : 'Try adjusting your search query or category filters above.'}
                </p>
                {acts.length === 0 && (
                  <button
                    onClick={() => setView?.('log')}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                  >
                    + Record First Activity
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredActs.map(a => {
                  const dateStr = new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  const isHighImpact = a.kgCO2e >= 5.0
                  const isMedImpact = a.kgCO2e >= 1.5 && a.kgCO2e < 5.0

                  return (
                    <div 
                      key={a._id} 
                      className="py-3.5 px-3 rounded-2xl flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border ${TYPE_COLORS[a.type] || 'bg-slate-100 text-slate-600'}`}>
                          {TYPE_ICONS[a.type] || '📌'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white capitalize truncate">
                              {a.subtype ? a.subtype.replaceAll('_', ' ') : a.type}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {a.type}
                            </span>
                            {a.deviceType && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-800/80 flex items-center gap-1 shadow-xs">
                                <span>📱</span>
                                <span>{a.deviceType}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                            <span>{dateStr}</span>
                            <span>•</span>
                            <span>
                              {a.amount} {a.type === 'shopping' && a.subtype === 'electronics_item' ? (a.deviceType ? `${a.deviceType}${a.amount > 1 ? 's' : ''}` : 'devices') : 'units'}
                            </span>
                            {a.note && (
                              <>
                                <span>•</span>
                                <span className="italic text-slate-600 dark:text-slate-300 truncate font-normal">"{a.note}"</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Footprint Score & Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className={`font-extrabold text-base leading-none ${
                            isHighImpact 
                              ? 'text-rose-600 dark:text-rose-400' 
                              : isMedImpact 
                              ? 'text-amber-600 dark:text-amber-400' 
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            +{a.kgCO2e.toFixed(2)}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">kg CO₂e</span>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditActivity(a)}
                            title="Edit activity"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            disabled={deletingId === a._id}
                            title="Delete activity"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 transition text-sm"
                          >
                            {deletingId === a._id ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── Right Column / Sidebar Widgets (xl:col-span-4) ──────────────── */}
        <div className="xl:col-span-4 space-y-6">

          {/* Quick Presets Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">One-Click Quick Presets</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                Fast Add
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tap any common daily action to log immediately with default emission factors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5">
              {QUICK_PRESETS.map((p, i) => (
                <button
                  key={i}
                  disabled={quickLogging}
                  onClick={() => handleQuickLog(p)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800 text-left transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">{p.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Auto-calculated entry</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-60 group-hover:opacity-100">
                    + Add
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Real World Equivalencies */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Impact Equivalents</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualizing what your total emitted {totalKg.toFixed(1)} kg CO₂e translates into in everyday terms:
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-2xl">🚗</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{milesDriven} miles</div>
                  <div className="text-[11px] text-slate-400">Driven in an average gas vehicle</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-2xl">📱</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{phonesCharged.toLocaleString()} times</div>
                  <div className="text-[11px] text-slate-400">Full smartphone battery recharges</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-2xl">🌳</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{trees} Trees Needed</div>
                  <div className="text-[11px] text-slate-400">Growing for a full year to offset</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sustainable Habit Card */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-3 py-1 rounded-full">
              Tip of the Day
            </span>
            <h4 className="font-extrabold text-base mt-3 mb-2">Switching to Public Transit</h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Taking a bus or train instead of a solo car commute cuts your travel emissions by up to 65% per kilometer!
            </p>
            <button
              onClick={() => setView?.('suggestions')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-800 px-3.5 py-1.5 rounded-xl hover:bg-emerald-50 transition shadow-sm"
            >
              <span>Explore All Eco Tips</span>
              <span>→</span>
            </button>
          </div>

        </div>

      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      {editActivity && (
        <EditModal
          activity={editActivity}
          token={token}
          onSave={() => { setEditActivity(null); load() }}
          onClose={() => setEditActivity(null)}
        />
      )}
    </div>
  )
}
