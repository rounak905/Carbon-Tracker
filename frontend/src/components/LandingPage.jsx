import { useState, useMemo } from 'react'

export default function LandingPage({ token, username, setView, darkMode, toggleDark, onLogin }) {
  // Interactive mini calculator state
  const [commuteKm, setCommuteKm] = useState(15)
  const [transitMode, setTransitMode] = useState('car') // 'car', 'bus', 'train'

  // Emission calculation for interactive widget
  // Car: 0.192 kg/km, Bus: 0.105 kg/km, Train: 0.041 kg/km
  const factors = { car: 0.192, bus: 0.105, train: 0.041 }
  const dailyCarKg = (commuteKm * factors.car).toFixed(2)
  const selectedModeKg = (commuteKm * factors[transitMode]).toFixed(2)
  const annualSavingsKg = Math.max(0, ((factors.car - factors[transitMode]) * commuteKm * 250)).toFixed(0)
  const treesSaved = (annualSavingsKg / 21.77).toFixed(1)

  const quickDemoLogin = () => {
    setView('login')
  }

  const navigateToApp = () => {
    if (token) {
      setView('dashboard')
    } else {
      setView('login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
      {/* ── Background Ambient Glowing Blobs ───────────────────────────────── */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[450px] h-[450px] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Landing Header / Nav ─────────────────────────────────────────── */}
      <header className="glass-nav sticky top-0 z-50 w-full">
        <div className="app-container flex items-center justify-between py-3.5">
          
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25">
              🌿
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Carbon<span className="text-emerald-500">Tracker</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                Eco Platform
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#problem" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">The Problem</a>
            <a href="#solution" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Why It Matters</a>
            <a href="#how-to-use" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">How to Use</a>
            <a href="#calculator" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Commute Tool</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700/80 transition"
              title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {token ? (
              <button
                onClick={() => setView('dashboard')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 text-xs sm:text-sm transition transform hover:scale-105 active:scale-95"
              >
                <span>Dashboard</span>
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={() => setView('login')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 text-xs sm:text-sm transition transform hover:scale-105 active:scale-95"
              >
                <span>🚀 Sign In / Demo</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
      <section className="app-container pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <span>🌱</span>
              <span>Empowering Individual Climate Action</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Turn Invisible <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">Carbon Footprints</span> Into Measurable Change.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Every kilometer you travel, every watt of electricity you consume, and every meal on your plate shapes our global climate. CarbonTracker makes your daily footprint transparent, measurable, and delightfully rewarding to reduce.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={navigateToApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-600/35 text-base transition-all transform hover:scale-105 active:scale-95"
              >
                <span>{token ? 'Enter Your Dashboard' : 'Explore Live Dashboard'}</span>
                <span className="text-xl leading-none">→</span>
              </button>

              <a
                href="#how-to-use"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-7 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-base transition"
              >
                <span>📖 How It Works</span>
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> IPCC Standard Emission Factors
              </span>
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Community Leaderboard
              </span>
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Real-World Equivalents
              </span>
            </div>
          </div>

          {/* Right Hero Interactive Mock Card (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 rounded-t-3xl" />
              
              {/* Header preview */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-400 ml-1">Live Impact Tracker</span>
                </div>
                <span className="text-[10px] uppercase font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                  6-Day Streak 🔥
                </span>
              </div>

              {/* Metrics preview */}
              <div className="pt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Footprint</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">40.1</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">kg CO₂e Total</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Target: 20 kg reduction</span>
                    <span className="font-bold text-emerald-600">On Track ✓</span>
                  </div>
                </div>

                {/* Sample breakdown items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <span>🚇</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Metro Train (20 km)</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+0.82 kg</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <span>🥗</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Plant-Based Meals (2)</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+2.00 kg</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <span>⚡</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Clean Power (6 kWh)</span>
                    </div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">+2.85 kg</span>
                  </div>
                </div>

                {/* Offset Equivalent */}
                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-800 dark:text-teal-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🌳</span>
                    <div>
                      <div className="font-bold">1.8 Trees Required</div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400">To absorb this month's emissions</div>
                    </div>
                  </div>
                  <span className="font-bold text-sm">Offset</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 2. The Problem Section ────────────────────────────────────────── */}
      <section id="problem" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="app-container space-y-12">
          
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              We Cannot Fix What We Cannot Measure.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Every day, each of us generates carbon emissions through mundane routines. But because greenhouse gases are invisible and weightless to the naked eye, the true climate cost of our daily choices remains completely hidden.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Problem Card 1 */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rose-200/60 dark:border-rose-900/40 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center text-2xl shadow-sm">
                🚗
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Unseen Commute Emissions
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                A single solo 20 km car commute emits nearly 4 kg of CO₂ every single day. Over a working year, that's over 1,000 kg of greenhouse gas released into the atmosphere from travel alone.
              </p>
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 pt-2">
                ⚠️ Petrol car: ~192g CO₂e per km
              </div>
            </div>

            {/* Problem Card 2 */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-amber-200/60 dark:border-amber-900/40 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center text-2xl shadow-sm">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Phantom Grid Power
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Electricity feels clean at the wall socket, but conventional regional power grids burn coal and natural gas 24/7. Water heaters, AC units, and high-draw workstations quietly compound emissions.
              </p>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 pt-2">
                ⚠️ Average grid: ~475g CO₂e per kWh
              </div>
            </div>

            {/* Problem Card 3 */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-blue-200/60 dark:border-blue-900/40 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center text-2xl shadow-sm">
                🍽️
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dietary & Shopping Blindspots
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Meat-intensive diets and rapid consumer goods embody huge amounts of agricultural methane, packaging, and supply chain fuel that never appear on itemized store receipts.
              </p>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 pt-2">
                ⚠️ Meat meal: 2.0 kg CO₂e vs Veg meal: 1.0 kg
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Why It Matters / The Solution ─────────────────────────────── */}
      <section id="solution" className="app-container py-20 lg:py-24 space-y-16">
        
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            The Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How CarbonTracker Solves It
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            By transforming abstract numbers into concrete, real-time insights, CarbonTracker turns sustainability from a vague intention into a clear, satisfying daily habit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3 hover:border-emerald-500/50 transition">
            <span className="text-3xl p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 inline-block">🔬</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Precision IPCC Factors</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every recorded commute, meal, or kilowatt hour uses scientific emission coefficients for verified, reliable calculations.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3 hover:border-blue-500/50 transition">
            <span className="text-3xl p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 inline-block">🎯</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Monthly Reduction Goals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Set personal reduction targets (e.g. reduce 20 kg CO₂e) with visual milestone checkpoints and progress bars.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3 hover:border-amber-500/50 transition">
            <span className="text-3xl p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 inline-block">🌳</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Tangible Equivalents</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Instantly converts kilograms of CO₂ into trees needed to offset, smartphone battery recharges, and car driving miles.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3 hover:border-purple-500/50 transition">
            <span className="text-3xl p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 inline-block">🏆</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Community Leaderboard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              See how you compare with fellow participants like Rohan Verma, Priya Patel, and Aarav Sharma in friendly eco competition.
            </p>
          </div>

        </div>

      </section>

      {/* ── 4. How To Use The Website ────────────────────────────────────── */}
      <section id="how-to-use" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="app-container space-y-16">
          
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              User Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              How To Use CarbonTracker
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Getting started takes less than 30 seconds. Follow these 4 simple steps to take charge of your climate impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-600/30">
                1
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Log An Activity
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Click <strong>"Record Emission"</strong> or use 1-click presets on your dashboard. Choose whether it was a car commute, bus ride, electricity use, or meal.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                👉 Takes under 10 seconds
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-600/30">
                2
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                View Instant Calculations
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Our calculation engine immediately computes the exact kg CO₂e emitted, updates your daily average, and calculates tree offset equivalents.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                👉 Real-time data visualization
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-600/30">
                3
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Maintain Your Streak
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Log daily to build a streak (3-Day, 7-Day, 30-Day Master). Keep your total emissions below your monthly target to stay on track.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                👉 Build consistent eco habits
              </div>
            </div>

            {/* Step 4 */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-600/30">
                4
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Compete & Learn
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Check the <strong>Milestones</strong> tab to see your rank on the Community Leaderboard and browse curated <strong>Eco Tips</strong> to cut your impact.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                👉 Join top eco savers
              </div>
            </div>

          </div>

          {/* Quick interactive link */}
          <div className="text-center pt-4">
            <button
              onClick={navigateToApp}
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg text-sm transition hover:scale-105 active:scale-95"
            >
              <span>{token ? 'Go to Your Dashboard' : 'Try Demo as Aditya Sen (13 Activities Pre-Loaded)'}</span>
              <span>→</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── 5. Interactive Commute Calculator Widget ──────────────────────── */}
      <section id="calculator" className="app-container py-20 lg:py-24">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl space-y-8">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Interactive Tool
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Estimate Your Commute Impact Right Now
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Drag the slider to see how much carbon dioxide your daily commute produces and how much you could save by switching to public transit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            
            {/* Slider & Mode Selection (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Daily Round-Trip Distance
                  </label>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {commuteKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="80"
                  step="1"
                  value={commuteKm}
                  onChange={e => setCommuteKm(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                  <span>2 km (Local)</span>
                  <span>40 km (Suburban)</span>
                  <span>80 km (Intercity)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Compare Modes of Transit
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTransitMode('car')}
                    className={`p-3 rounded-2xl border text-center transition ${
                      transitMode === 'car'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">🚗</div>
                    <div className="text-xs font-bold">Petrol Car</div>
                    <div className="text-[10px] opacity-70">192 g/km</div>
                  </button>

                  <button
                    onClick={() => setTransitMode('bus')}
                    className={`p-3 rounded-2xl border text-center transition ${
                      transitMode === 'bus'
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">🚌</div>
                    <div className="text-xs font-bold">City Bus</div>
                    <div className="text-[10px] opacity-70">105 g/km</div>
                  </button>

                  <button
                    onClick={() => setTransitMode('train')}
                    className={`p-3 rounded-2xl border text-center transition ${
                      transitMode === 'train'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">🚆</div>
                    <div className="text-xs font-bold">Metro / Train</div>
                    <div className="text-[10px] opacity-70">41 g/km</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Results Callout (lg:col-span-5) */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-100/90 dark:bg-slate-900/90 p-6 border border-slate-200 dark:border-slate-800 space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-400">Daily Footprint for {commuteKm} km</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{selectedModeKg}</span>
                  <span className="text-sm font-bold text-slate-500">kg CO₂e / day</span>
                </div>
              </div>

              {transitMode !== 'car' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                  <div className="font-extrabold text-emerald-800 dark:text-emerald-300">
                    Annual Carbon Savings: {annualSavingsKg} kg CO₂e!
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-400">
                    That is equivalent to planting and growing <strong>{treesSaved} mature trees</strong> for an entire year!
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  Switching this commute to electric metro or train saves up to <strong>78% of your emissions</strong>!
                </div>
              )}

              <button
                onClick={navigateToApp}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold text-xs shadow-md transition"
              >
                Track Your Commutes on Dashboard →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. Final Call to Action ───────────────────────────────────────── */}
      <section className="app-container py-16">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full">
              Get Started In Seconds
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Start Tracking Your Environmental Impact Today
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Join eco-conscious citizens actively reducing their carbon footprint. Check your streak, log activities, and take charge of your climate journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
            <button
              onClick={navigateToApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-emerald-900 hover:bg-emerald-50 font-black px-8 py-4 rounded-2xl shadow-2xl text-base sm:text-lg transition transform hover:scale-105 active:scale-95"
            >
              <span>{token ? 'Go to Your Dashboard' : '⚡ 1-Click Demo Access'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 7. Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 text-xs text-slate-500 dark:text-slate-400">
        <div className="app-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🌿</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">CarbonTracker</span>
            <span>— Personal Eco & Carbon Accounting</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-600 transition">
              Back to Top ↑
            </button>
            <button onClick={navigateToApp} className="hover:text-emerald-600 font-bold transition">
              Dashboard
            </button>
          </div>
        </div>
      </footer>

    </div>
  )
}
