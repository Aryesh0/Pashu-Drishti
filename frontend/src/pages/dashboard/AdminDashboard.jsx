import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Beef, MapPin, FlaskConical, Pill, Users, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

const COLORS = ['#d97706', '#b45309', '#fbbf24', '#92400e', '#fcd34d', '#78350f']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-mustard-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  const statCards = [
    { label: 'Total Farms', value: stats?.totalFarms ?? 0, sub: `${stats?.activeFarms ?? 0} active`, icon: <MapPin size={20} />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Animals', value: stats?.totalAnimals ?? 0, sub: `${stats?.healthyAnimals ?? 0} healthy`, icon: <Beef size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'MRL Tests', value: stats?.totalMrlTests ?? 0, sub: `${stats?.mrlPassRate ?? 0}% pass rate`, icon: <FlaskConical size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'AMR Records', value: stats?.totalAntimicrobialUsages ?? 0, sub: `${stats?.criticalAntibioticUsages ?? 0} critical`, icon: <Pill size={20} />, color: 'bg-red-50 text-red-600' },
    { label: 'Total Users', value: stats?.totalUsers ?? 0, sub: `${stats?.activeUsers ?? 0} active`, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Withdrawals', value: stats?.activeWithdrawalPeriods ?? 0, sub: 'withdrawal periods', icon: <Clock size={20} />, color: 'bg-mustard-50 text-mustard-600' },
  ]

  const farmTypeData = stats?.farmsByType
    ? Object.entries(stats.farmsByType).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: v }))
    : []

  const animalSpeciesData = stats?.animalsBySpecies
    ? Object.entries(stats.animalsBySpecies).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: v }))
    : []

  const mrlData = [
    { name: 'Passed', value: stats?.passedMrlTests ?? 0, fill: '#16a34a' },
    { name: 'Failed', value: stats?.failedMrlTests ?? 0, fill: '#dc2626' },
    { name: 'Pending', value: stats?.pendingMrlTests ?? 0, fill: '#d97706' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">Admin Dashboard</h1>
          <p className="font-body text-sm text-earth-500 mt-1">System-wide overview — PASHU-DRISHTI Portal</p>
        </div>

        {/* Alert Banner */}
        {(stats?.failedMrlTests > 0 || stats?.criticalAntibioticUsages > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-body font-semibold text-red-700 text-sm">Attention Required</p>
              <p className="font-body text-red-600 text-sm mt-0.5">
                {stats?.failedMrlTests > 0 && `${stats.failedMrlTests} MRL test(s) failed. `}
                {stats?.criticalAntibioticUsages > 0 && `${stats.criticalAntibioticUsages} critical antibiotic usage(s) recorded.`}
              </p>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-earth-900 text-xl leading-none">{s.value.toLocaleString()}</p>
                <p className="font-body text-xs text-earth-500 mt-0.5 truncate">{s.label}</p>
                <p className="font-body text-xs text-mustard-600 font-medium mt-0.5 truncate">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MRL Results */}
          <div className="card">
            <h3 className="font-display font-semibold text-earth-900 mb-4">MRL Test Results</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={mrlData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {mrlData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Tests']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {mrlData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.fill }} />
                  <span className="text-xs font-body text-earth-500">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Farm Types */}
          <div className="card">
            <h3 className="font-display font-semibold text-earth-900 mb-4">Farms by Type</h3>
            {farmTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={farmTypeData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'DM Sans' }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-earth-400 font-body text-sm">No farm data yet</div>
            )}
          </div>

          {/* Animal Species */}
          <div className="card">
            <h3 className="font-display font-semibold text-earth-900 mb-4">Animals by Species</h3>
            {animalSpeciesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={animalSpeciesData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {animalSpeciesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-earth-400 font-body text-sm">No animal data yet</div>
            )}
          </div>
        </div>

        {/* Animal Health Status */}
        <div className="card">
          <h3 className="font-display font-semibold text-earth-900 mb-5">Animal Health Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Healthy', value: stats?.healthyAnimals ?? 0, color: 'bg-green-100 text-green-700', icon: <CheckCircle size={18} /> },
              { label: 'Sick', value: stats?.sickAnimals ?? 0, color: 'bg-red-100 text-red-700', icon: <AlertTriangle size={18} /> },
              { label: 'Under Treatment', value: stats?.underTreatmentAnimals ?? 0, color: 'bg-blue-100 text-blue-700', icon: <TrendingUp size={18} /> },
              { label: 'Withdrawal Period', value: stats?.activeWithdrawalPeriods ?? 0, color: 'bg-mustard-100 text-mustard-700', icon: <Clock size={18} /> },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-xl p-4 flex items-center gap-3`}>
                {s.icon}
                <div>
                  <p className="font-display font-bold text-2xl leading-none">{s.value}</p>
                  <p className="font-body text-xs mt-1 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}