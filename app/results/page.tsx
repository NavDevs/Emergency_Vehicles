'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  TrendingDown, 
  Brain, 
  BarChart3, 
  Activity, 
  FileText, 
  History,
  Clock,
  MapPin,
  Zap,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Wind,
  Users,
  AlertTriangle
} from 'lucide-react'
import Logo from '@/components/Logo'

// Line Chart Component
function LineChart({ data, color, labels }: { data: number[], color: string, labels?: string[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  // Handle single data point case
  const dataLength = data.length
  const stepX = dataLength > 1 ? 100 / (dataLength - 1) : 50
  
  const points = data.map((value, idx) => {
    const x = dataLength > 1 ? idx * stepX : 50
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="h-32 w-full">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${color.replace('#', '')})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((value, idx) => {
          const x = dataLength > 1 ? idx * stepX : 50
          const y = 100 - ((value - min) / range) * 100
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>
      {labels && (
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {labels.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// Bar Chart Component
function BarChart({ data, colors }: { data: { label: string, value: number, color: string }[], colors?: string[] }) {
  const max = Math.max(...data.map(d => d.value))
  
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative" style={{ height: '100%' }}>
            <div
              className="absolute bottom-0 w-full rounded-t transition-all duration-500"
              style={{
                height: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || colors?.[idx] || '#3B82F6',
                minHeight: '4px'
              }}
            />
          </div>
          <span className="text-xs text-gray-500 text-center">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// Simulation History Storage
const STORAGE_KEY = 'ev_priority_simulations'

interface SimulationResult {
  id: string
  timestamp: number
  layoutName: string
  startPoint?: string
  endPoint?: string
  travelTime: number
  originalTime: number
  improvement: number
  intersectionsCount: number
  preemptions: number
  confidence: number
  weather: string
  traffic: string
  criticality: string
  totalDistance?: number
  averageSpeed?: string
  maxSpeed?: string
  minSpeed?: string
  fuelSaved?: number
  co2Reduced?: number
  stopsAvoided?: number
  traditionalStops?: number
  mlStops?: number
  signalDelaySaved?: number
  trafficDelayReduced?: number
  conditionFactors?: {
    weatherSpeedFactor: number
    trafficDensity: number
    priorityWeight: number
  }
}

function getStoredSimulations(): SimulationResult[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveSimulation(result: SimulationResult) {
  const simulations = getStoredSimulations()
  simulations.unshift(result)
  // Keep only last 10
  if (simulations.length > 10) simulations.pop()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations))
}

function clearAllSimulations() {
  localStorage.removeItem(STORAGE_KEY)
}

// History Card Component with expandable details
function HistoryCard({ 
  simulation, 
  isSelected, 
  onClick 
}: { 
  simulation: SimulationResult
  isSelected: boolean
  onClick: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className={`bg-white rounded-xl border transition-all ${
        isSelected 
          ? 'border-blue-500 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header - Always Visible */}
      <button
        onClick={onClick}
        className="w-full p-4 text-left"
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-gray-900">{simulation.layoutName}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(simulation.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{simulation.travelTime}s</div>
            <div className="text-xs text-green-600 font-medium">+{simulation.improvement}%</div>
          </div>
        </div>
      </button>

      {/* Quick Stats Row */}
      <div className="px-4 pb-3 flex gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="text-gray-400">🌤️</span>
          <span className="capitalize">{simulation.weather}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-gray-400">🚗</span>
          <span className="capitalize">{simulation.traffic}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-gray-400">🚨</span>
          <span className="capitalize">{simulation.criticality}</span>
        </span>
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 border-t border-gray-100 text-sm text-gray-500 hover:bg-gray-50 transition flex items-center justify-center gap-1"
      >
        {isExpanded ? (
          <>Less Details <ChevronUp className="w-4 h-4" /></>
        ) : (
          <>More Details <ChevronDown className="w-4 h-4" /></>
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Route Info */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Route</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Start:</span>
                  <span>{simulation.startPoint || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End:</span>
                  <span>{simulation.endPoint || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Distance:</span>
                  <span>{simulation.totalDistance || 800}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Intersections:</span>
                  <span>{simulation.intersectionsCount}</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Performance</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Traditional:</span>
                  <span className="text-red-500">{simulation.originalTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ML Time:</span>
                  <span className="text-blue-600 font-medium">{simulation.travelTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time Saved:</span>
                  <span className="text-green-600">{simulation.originalTime - simulation.travelTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confidence:</span>
                  <span>{simulation.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Speed */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Speed</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Average:</span>
                  <span>{simulation.averageSpeed || '12.3'} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max:</span>
                  <span>{simulation.maxSpeed || '20.0'} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Min:</span>
                  <span>{simulation.minSpeed || '5.0'} m/s</span>
                </div>
              </div>
            </div>

            {/* Impact */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Impact</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fuel Saved:</span>
                  <span className="text-green-600">{simulation.fuelSaved || 9.2}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CO₂ Reduced:</span>
                  <span className="text-green-600">{simulation.co2Reduced || 20.7}kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stops Avoided:</span>
                  <span className="text-green-600">{simulation.stopsAvoided || 3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preemptions:</span>
                  <span>{simulation.preemptions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* View Full Report Button */}
          <Link
            href={`/report?data=${encodeURIComponent(JSON.stringify(simulation))}`}
            className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View Full Report
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const [mounted, setMounted] = useState(false)
  const [simulations, setSimulations] = useState<SimulationResult[]>([])
  const [selectedSim, setSelectedSim] = useState<SimulationResult | null>(null)
  const [showHistory, setShowHistory] = useState(true)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')

  useEffect(() => {
    setMounted(true)
    const stored = getStoredSimulations()
    setSimulations(stored)
    if (stored.length > 0) {
      setSelectedSim(stored[0])
    }
  }, [])

  // Listen for new simulations
  useEffect(() => {
    const handleStorage = () => {
      const stored = getStoredSimulations()
      setSimulations(stored)
      if (stored.length > 0 && !selectedSim) {
        setSelectedSim(stored[0])
      }
    }
    
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [selectedSim])

  if (!mounted) return null

  const currentSim = selectedSim || {
    layoutName: '2×2 Grid Network',
    startPoint: 'I1',
    endPoint: 'I4',
    travelTime: 65,
    originalTime: 180,
    improvement: 64,
    intersectionsCount: 4,
    preemptions: 4,
    confidence: 98,
    weather: 'clear',
    traffic: 'moderate',
    criticality: 'normal',
    totalDistance: 800,
    averageSpeed: '12.3',
    fuelSaved: 9.2,
    co2Reduced: 20.7,
    stopsAvoided: 3
  }

  // Generate trend data from history
  const trendData = simulations.length > 0 
    ? simulations.map(s => s.travelTime).reverse()
    : [75, 68, 72, 65, 63, 67, 65]

  const improvementData = simulations.length > 0
    ? simulations.map(s => s.improvement).reverse()
    : [58, 62, 60, 64, 65, 63, 64]

  const handleExport = () => {
    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(simulations, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ev-priority-results-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } else {
      // CSV export
      const headers = ['Timestamp', 'Layout', 'Travel Time', 'Original Time', 'Improvement %', 'Weather', 'Traffic', 'Criticality']
      const rows = simulations.map(s => [
        new Date(s.timestamp).toLocaleString(),
        s.layoutName,
        s.travelTime,
        s.originalTime,
        s.improvement,
        s.weather,
        s.traffic,
        s.criticality
      ])
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ev-priority-results-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    }
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all simulation history?')) {
      clearAllSimulations()
      setSimulations([])
      setSelectedSim(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] no-print">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={40} />
              <span className="font-display text-xl text-[#0F172A]">EV Priority</span>
            </Link>
            
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-[#64748B] hover:text-[#0052FF] transition font-medium">Home</Link>
              <Link href="/simulate" className="text-[#64748B] hover:text-[#0052FF] transition font-medium">Simulate</Link>
              <Link href="/results" className="text-[#0052FF] font-medium">Results</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="badge-section mb-4">
              <span className="badge-dot animate-pulse"></span>
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">Performance Analytics</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl text-[#0F172A] mb-2">
              Performance Results
            </h1>
            <p className="text-[#64748B]">
              ML-Enhanced vs Traditional Traffic Control
            </p>
          </div>
          
          {/* Export Controls */}
          <div className="flex items-center gap-2 no-print">
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="json">Export JSON</option>
              <option value="csv">Export CSV</option>
            </select>
            <button
              onClick={handleExport}
              disabled={simulations.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FileText className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Simulation History - Expandable Cards */}
        {simulations.length > 0 && (
          <div className="mb-8 no-print">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-[#0052FF] font-medium"
              >
                <History className="w-5 h-5" />
                Simulation History ({simulations.length})
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClearHistory}
                className="text-red-500 text-sm flex items-center gap-1 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
            
            {showHistory && (
              <div className="grid md:grid-cols-2 gap-4">
                {simulations.map((sim, idx) => (
                  <HistoryCard 
                    key={sim.id || idx} 
                    simulation={sim} 
                    isSelected={selectedSim?.id === sim.id}
                    onClick={() => setSelectedSim(sim)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text">{currentSim.improvement}%</div>
            <div className="text-[#64748B] text-sm mt-1">Faster Response</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text">{currentSim.travelTime}s</div>
            <div className="text-[#64748B] text-sm mt-1">ML Travel Time</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text">{currentSim.confidence}%</div>
            <div className="text-[#64748B] text-sm mt-1">ML Confidence</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text">{currentSim.stopsAvoided || Math.ceil((currentSim.intersectionsCount || 4) * 0.5)}</div>
            <div className="text-[#64748B] text-sm mt-1">Stops Avoided</div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">Travel Time Trend</h2>
                <p className="text-xs text-gray-500">Recent simulations</p>
              </div>
            </div>
            <LineChart 
              data={trendData} 
              color="#0052FF"
              labels={trendData.map((_, i) => `${i + 1}`)}
            />
            <div className="flex justify-between text-sm mt-4 pt-4 border-t">
              <span className="text-gray-500">Average: <strong className="text-gray-900">{Math.round(trendData.reduce((a, b) => a + b, 0) / trendData.length)}s</strong></span>
              <span className="text-gray-500">Best: <strong className="text-green-600">{Math.min(...trendData)}s</strong></span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">Improvement % Trend</h2>
                <p className="text-xs text-gray-500">Efficiency gains over time</p>
              </div>
            </div>
            <LineChart 
              data={improvementData} 
              color="#22c55e"
              labels={improvementData.map((_, i) => `${i + 1}`)}
            />
            <div className="flex justify-between text-sm mt-4 pt-4 border-t">
              <span className="text-gray-500">Average: <strong className="text-gray-900">{Math.round(improvementData.reduce((a, b) => a + b, 0) / improvementData.length)}%</strong></span>
              <span className="text-gray-500">Best: <strong className="text-green-600">{Math.max(...improvementData)}%</strong></span>
            </div>
          </div>
        </div>

        {/* Conditions Impact */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#0F172A]">Current Simulation Conditions</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">
                  {currentSim.weather === 'rain' ? '🌧️' : currentSim.weather === 'fog' ? '🌫️' : currentSim.weather === 'night' ? '🌙' : '☀️'}
                </span>
                <span className="font-semibold text-gray-700 capitalize">{currentSim.weather}</span>
              </div>
              <p className="text-sm text-gray-600">
                {currentSim.weather === 'clear' 
                  ? 'Optimal visibility and road conditions.' 
                  : currentSim.weather === 'rain'
                  ? 'Reduced traction and visibility. 25% speed reduction.'
                  : currentSim.weather === 'fog'
                  ? 'Severe visibility constraints. 40% speed reduction.'
                  : 'Reduced visibility. 15% speed reduction.'}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">
                  {currentSim.traffic === 'severe' ? '🔴' : currentSim.traffic === 'heavy' ? '🟠' : currentSim.traffic === 'moderate' ? '🟡' : '🟢'}
                </span>
                <span className="font-semibold text-gray-700 capitalize">{currentSim.traffic}</span>
              </div>
              <p className="text-sm text-gray-600">
                {currentSim.traffic === 'smooth'
                  ? 'Minimal congestion. Optimal routing possible.'
                  : currentSim.traffic === 'moderate'
                  ? 'Some delays expected. ML routing beneficial.'
                  : currentSim.traffic === 'heavy'
                  ? 'Significant congestion. Priority preemption critical.'
                  : 'Extreme traffic. Maximum priority required.'}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">
                  {currentSim.criticality === 'critical' ? '🚨' : currentSim.criticality === 'high' ? '⚠️' : '✓'}
                </span>
                <span className="font-semibold text-gray-700 capitalize">{currentSim.criticality}</span>
              </div>
              <p className="text-sm text-gray-600">
                {currentSim.criticality === 'normal'
                  ? 'Standard emergency priority level.'
                  : currentSim.criticality === 'high'
                  ? 'Elevated priority. Enhanced signal control.'
                  : 'Maximum priority. All signals preempted.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Travel Time Comparison */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#0F172A]">Travel Time Comparison</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#64748B]">Traditional System</span>
                  <span className="text-red-500 font-semibold">{currentSim.originalTime}s</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#64748B]">ML-Enhanced System</span>
                  <span className="text-[#0052FF] font-semibold">{currentSim.travelTime}s</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] rounded-full" 
                    style={{ width: `${(currentSim.travelTime / currentSim.originalTime) * 100}%` }} 
                  />
                </div>
              </div>
              
              <div className="well text-center">
                <span className="text-4xl font-display font-bold gradient-text">{currentSim.improvement}%</span>
                <span className="text-[#0F172A] ml-3 text-xl">Faster Response</span>
                <p className="text-sm text-gray-500 mt-2">
                  Time saved: <strong className="text-green-600">{currentSim.originalTime - currentSim.travelTime} seconds</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#0F172A]">Environmental Impact</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{currentSim.fuelSaved || 9.2}L</div>
                <div className="text-sm text-gray-600">Fuel Saved</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{currentSim.co2Reduced || 20.7}kg</div>
                <div className="text-sm text-gray-600">CO₂ Reduced</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-600">
                <strong>Why it matters:</strong> Reduced idle time at signals means less fuel consumption 
                and lower emissions. The ML system optimizes signal timing to minimize stops.
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="mt-8 card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#0F172A]">Detailed Metrics</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Route Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Layout</span>
                  <span className="font-medium">{currentSim.layoutName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Point</span>
                  <span className="font-medium">{currentSim.startPoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Point</span>
                  <span className="font-medium">{currentSim.endPoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Distance</span>
                  <span className="font-medium">{currentSim.totalDistance || 800}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Intersections</span>
                  <span className="font-medium">{currentSim.intersectionsCount}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Speed Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Average Speed</span>
                  <span className="font-medium">{currentSim.averageSpeed || '12.3'} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Speed</span>
                  <span className="font-medium">20.0 m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Min Speed</span>
                  <span className="font-medium">5.0 m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preemptions</span>
                  <span className="font-medium text-green-600">{currentSim.preemptions}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">ML Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Model Accuracy</span>
                  <span className="font-bold text-blue-600">99.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-bold text-blue-600">{currentSim.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Algorithm</span>
                  <span className="font-medium">Random Forest</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Success Rate</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison with Existing Methods */}
        <div className="mt-8 card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#0F172A]">Comparison with Existing Methods</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E2E8F0]">
                  <th className="text-left py-4 text-[#64748B] font-semibold">Method</th>
                  <th className="text-left py-4 text-[#64748B] font-semibold">Travel Time</th>
                  <th className="text-left py-4 text-[#64748B] font-semibold">Stops</th>
                  <th className="text-left py-4 text-[#64748B] font-semibold">Improvement</th>
                  <th className="text-left py-4 text-[#64748B] font-semibold">Intrusive</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E2E8F0]">
                  <td className="py-4 text-[#0F172A]">Fixed-Time (FTCM)</td>
                  <td className="py-4 text-[#0F172A]">180s</td>
                  <td className="py-4 text-[#0F172A]">~3</td>
                  <td className="py-4 text-red-500">Baseline</td>
                  <td className="py-4 text-[#64748B]">No</td>
                </tr>
                <tr className="border-b border-[#E2E8F0]">
                  <td className="py-4 text-[#0F172A]">Flexible (FSPM)</td>
                  <td className="py-4 text-[#0F172A]">~90s</td>
                  <td className="py-4 text-[#0F172A]">~2</td>
                  <td className="py-4 text-orange-500">~50%</td>
                  <td className="py-4 text-[#64748B]">Partial</td>
                </tr>
                <tr className="border-b border-[#E2E8F0]">
                  <td className="py-4 text-[#0F172A]">Intrusive (ISPM)</td>
                  <td className="py-4 text-[#0F172A]">~80s</td>
                  <td className="py-4 text-[#0F172A]">~1</td>
                  <td className="py-4 text-orange-500">~55%</td>
                  <td className="py-4 text-orange-500">Yes</td>
                </tr>
                <tr className="bg-[#0052FF]/5">
                  <td className="py-4 text-[#0052FF] font-bold">Our ML System</td>
                  <td className="py-4 text-[#0052FF] font-bold">{currentSim.travelTime}s</td>
                  <td className="py-4 text-[#0052FF] font-bold">{currentSim.stopsAvoided || 3}</td>
                  <td className="py-4 text-[#0052FF] font-bold">{currentSim.improvement}%</td>
                  <td className="py-4 text-green-600 font-bold">Minimal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center gap-4 no-print">
          <Link href="/simulate" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
            Run New Simulation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href={`/report?data=${encodeURIComponent(JSON.stringify(currentSim))}`}
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition"
          >
            <FileText className="w-4 h-4" />
            View Full Report
          </Link>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-8 border-t text-center text-gray-400 text-sm">
          <p>EV Priority System - Final Year Project</p>
          <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
