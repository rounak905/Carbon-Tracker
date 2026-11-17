import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'

// Emission factors (mirrored from backend for live preview)
const EMISSION_FACTORS = {
  transport:   { car_km: 0.192, bus_km: 0.105, train_km: 0.041, flight_km: 0.255 },
  electricity: { kwh: 0.475 },
  food:        { chicken_meal: 2.0, vegetarian_meal: 1.0, dairy_serving: 0.8 },
  waste:       { bag_kg: 0.021 },
  water:       { liters: 0.000298 },
  natural_gas: { cubic_meter: 2.204 },
  shopping:    { clothing_item: 20.0, electronics_item: 70.0 }
}

// Device-specific emission factors for electronics (kg CO2e per item)
// Lifecycle assessment representative estimates; configurable for future updates
const ELECTRONIC_DEVICE_FACTORS = {
  'Smartphone': 55.0,
  'Tablet': 100.0,
  'Laptop': 150.0,
  'Desktop PC': 350.0,
  'Monitor': 100.0,
  'Other': 70.0
}

const ELECTRONIC_DEVICES = [
  { key: 'Smartphone', label: 'Smartphone', factor: 55.0, icon: '📱' },
  { key: 'Tablet',     label: 'Tablet',     factor: 100.0, icon: '📟' },
  { key: 'Laptop',     label: 'Laptop',     factor: 150.0, icon: '💻' },
  { key: 'Desktop PC', label: 'Desktop PC', factor: 350.0, icon: '🖥️' },
  { key: 'Monitor',    label: 'Monitor',    factor: 100.0, icon: '🖥️' },
  { key: 'Other',      label: 'Other',      factor: 70.0,  icon: '🔌' },
]

const CATEGORIES = [
  { key: 'transport',   label: 'Transport',   icon: '🚗', desc: 'Vehicles, flights & commutes' },
  { key: 'electricity', label: 'Electricity', icon: '⚡', desc: 'Home & office power (kWh)' },
  { key: 'food',        label: 'Food',        icon: '🍽️', desc: 'Meals & dietary choices' },
  { key: 'waste',       label: 'Waste',       icon: '🗑️', desc: 'Trash & recycling (kg)' },
  { key: 'water',       label: 'Water',       icon: '💧', desc: 'Household water use' },
  { key: 'natural_gas', label: 'Gas',         icon: '🔥', desc: 'Heating & cooking (m³)' },
  { key: 'shopping',    label: 'Shopping',    icon: '🛍️', desc: 'Consumer goods & tech' },
]

const SUBTYPE_OPTIONS = {
  transport:   [
    { key: 'car_km',    label: 'Car Drive',        unit: 'kilometers', icon: '🚗', factor: 0.192 },
    { key: 'bus_km',    label: 'Public Bus',       unit: 'kilometers', icon: '🚌', factor: 0.105 },
    { key: 'train_km',  label: 'Train / Metro',    unit: 'kilometers', icon: '🚆', factor: 0.041 },
    { key: 'flight_km', label: 'Commercial Flight', unit: 'kilometers', icon: '✈️', factor: 0.255 },
  ],
  electricity: [
    { key: 'kwh', label: 'Electricity Consumption', unit: 'kWh', icon: '⚡', factor: 0.475 }
  ],
  food: [
    { key: 'chicken_meal',     label: 'Poultry / Meat Meal', unit: 'meals',    icon: '🍗', factor: 2.0 },
    { key: 'vegetarian_meal',  label: 'Vegetarian Meal',     unit: 'meals',    icon: '🥗', factor: 1.0 },
    { key: 'dairy_serving',    label: 'Dairy Serving',       unit: 'servings', icon: '🥛', factor: 0.8 },
  ],
  waste: [
    { key: 'bag_kg', label: 'Landfill Waste Bag', unit: 'kg', icon: '🗑️', factor: 0.021 }
  ],
  water: [
    { key: 'liters', label: 'Municipal Water', unit: 'liters', icon: '💧', factor: 0.000298 }
  ],
  natural_gas: [
    { key: 'cubic_meter', label: 'Natural Gas', unit: 'm³', icon: '🔥', factor: 2.204 }
  ],
  shopping: [
    { key: 'clothing_item',    label: 'Apparel / Clothing', unit: 'items', icon: '👕', factor: 20.0 },
    { key: 'electronics_item', label: 'Electronics Gadget', unit: 'items', icon: '📱', factor: 70.0 },
  ]
}

export default function ActivityForm({ token, onLogged }) {
  const [type,       setType]       = useState('transport')
  const [subtype,    setSubtype]    = useState('car_km')
  const [deviceType, setDeviceType] = useState('Smartphone')
  const [amount,     setAmount]     = useState('15')
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0])
  const [note,       setNote]       = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const isElectronics = type === 'shopping' && subtype === 'electronics_item'
  const currentSubOptions = useMemo(() => SUBTYPE_OPTIONS[type] || [], [type])
  const currentSubtypeObj = useMemo(() => currentSubOptions.find(s => s.key === subtype) || currentSubOptions[0], [currentSubOptions, subtype])
  const currentDeviceFactor = ELECTRONIC_DEVICE_FACTORS[deviceType] || 70.0
  const activeFactor = isElectronics ? currentDeviceFactor : (currentSubtypeObj?.factor || 0)

  useEffect(() => {
    if (SUBTYPE_OPTIONS[type]?.[0]) {
      setSubtype(SUBTYPE_OPTIONS[type][0].key)
    }
  }, [type])

  // Live CO₂e preview
  const preview = useMemo(() => {
    const factor = isElectronics 
      ? (ELECTRONIC_DEVICE_FACTORS[deviceType] || 70.0) 
      : (EMISSION_FACTORS[type]?.[subtype] || 0)
    const val = parseFloat(amount) || 0
    return (factor * val).toFixed(2)
  }, [type, subtype, amount, deviceType, isElectronics])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = { 
        type, 
        subtype, 
        amount: Number(amount), 
        date, 
        note: note.trim() 
      }
      if (isElectronics) {
        payload.deviceType = deviceType
      }
      await api.authed(token).post('/activities', payload)
      onLogged?.()
    } catch (err) { 
      setError(err?.error || 'Failed to record activity') 
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Record Emission Activity
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Select an environmental category, specify the measurement, and log your footprint in real time.
        </p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left Side: Interactive Selectors & Inputs (lg:col-span-8) ───── */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Category Selection Cards */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 1: Choose Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5">
              {CATEGORIES.map(cat => {
                const isSelected = type === cat.key
                return (
                  <button
                    type="button"
                    key={cat.key}
                    onClick={() => setType(cat.key)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                        : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-bold leading-tight">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Specific Activity Pill Selector */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 2: Activity Subtype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentSubOptions.map(sub => {
                const isSelected = subtype === sub.key
                return (
                  <button
                    type="button"
                    key={sub.key}
                    onClick={() => setSubtype(sub.key)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500'
                        : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">{sub.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs">{sub.label}</div>
                      <div className="text-[11px] text-slate-400">
                        {sub.key === 'electronics_item' ? 'Device-specific rates' : `Unit: ${sub.unit}`}
                      </div>
                    </div>
                    {isSelected && <span className="text-emerald-600 font-bold text-sm">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2b. Device Selection Dropdown (Only for Electronics) */}
          {isElectronics && (
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 to-slate-50/20 dark:from-indigo-950/20 dark:to-slate-900/40 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor="device-type-select" className="block text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Step 2b: Select Electronic Device
                </label>
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 w-fit">
                  Factor: {currentDeviceFactor} kg CO₂e / item
                </span>
              </div>

              <div>
                <select
                  id="device-type-select"
                  value={deviceType}
                  onChange={e => setDeviceType(e.target.value)}
                  className="w-full border border-indigo-200 dark:border-indigo-800 rounded-2xl px-4 py-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition cursor-pointer"
                >
                  {ELECTRONIC_DEVICES.map(dev => (
                    <option key={dev.key} value={dev.key}>
                      {dev.icon} {dev.label} — {dev.factor} kg CO₂e
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Device-specific lifecycle assessment (LCA) estimates based on manufacturing, component fabrication, transport, and initial use.
                </p>
              </div>
            </div>
          )}

          {/* 3. Measurement & Date Input Fields */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 3: Details & Quantity
            </label>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount / Quantity ({isElectronics ? `${deviceType} devices` : (currentSubtypeObj?.unit || 'Units')})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder="e.g. 15"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date of Activity
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Note / Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g., Highway drive to downtown, vegan dinner with colleagues..."
                maxLength={200}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

        </div>

        {/* ── Right Side: Live Emission Preview & Submission (lg:col-span-4) ─ */}
        <div className="lg:col-span-4 space-y-6">

          {/* Real-time Calculation Panel */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              Live Impact Calculator
            </span>

            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Estimated Emissions</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                  {preview}
                </span>
                <span className="text-lg font-bold text-slate-500">kg CO₂e</span>
              </div>
            </div>

            {/* Impact Scale Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Impact Level</span>
                <span className={parseFloat(preview) > 5 ? 'text-rose-500' : parseFloat(preview) > 1.5 ? 'text-amber-500' : 'text-emerald-500'}>
                  {parseFloat(preview) > 5 ? 'High Footprint' : parseFloat(preview) > 1.5 ? 'Moderate' : 'Low / Efficient'}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    parseFloat(preview) > 5 ? 'bg-rose-500' : parseFloat(preview) > 1.5 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, (parseFloat(preview) / 15) * 100))}%` }}
                />
              </div>
            </div>

            {/* Factor breakdown details */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Factor rate:</span>
                <span className="font-semibold">{activeFactor} kg / {isElectronics ? 'device' : 'unit'}</span>
              </div>
              <div className="flex justify-between">
                <span>Input quantity:</span>
                <span className="font-semibold">{amount || 0} {isElectronics ? `${deviceType}s` : (currentSubtypeObj?.unit || 'units')}</span>
              </div>
              {isElectronics && (
                <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span>Device:</span>
                  <span>{deviceType} ({currentDeviceFactor} kg CO₂e)</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-black text-base sm:text-lg shadow-2xl shadow-emerald-600/35 transition-all transform hover:scale-[1.02] active:scale-[0.98] ring-4 ring-emerald-500/20 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span className="text-xl sm:text-2xl leading-none">➕</span>
              <span>{loading ? 'Recording Emission…' : 'Record Emission'}</span>
            </button>
          </div>

          {/* Quick Eco Tip */}
          <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💡</span>
              <span>Did you know?</span>
            </div>
            <p>
              Short flights produce disproportionate takeoff emissions. For journeys under 500 km, modern electric trains emit up to 85% less carbon dioxide than regional flights.
            </p>
          </div>

        </div>

      </form>

    </div>
  )
}
