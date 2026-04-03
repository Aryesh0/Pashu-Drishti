import { useEffect, useState } from 'react'
import { BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { adminAPI, amrAPI, animalAPI, farmAPI, mrlAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { humanizeEnum } from '../../utils/formatters'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

const chartColors = ['#D97706', '#F59E0B', '#16A34A', '#0284C7', '#DC2626', '#7C3AED']

export default function AnalyticsPage() {
  const { isAdmin, isVet, isOfficer } = useAuth()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    title: 'Operational Analytics',
    cards: [],
    farmTypes: [],
    species: [],
    compliance: [],
  })

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      try {
        if (isAdmin()) {
          const response = await adminAPI.getDashboard()
          const dashboard = response.data.data
          setSummary({
            title: 'Administrator Analytics',
            cards: [
              { label: 'Total Farms', value: dashboard.totalFarms },
              { label: 'Total Animals', value: dashboard.totalAnimals },
              { label: 'MRL Pass Rate', value: `${dashboard.mrlPassRate}%` },
              { label: 'Critical Antibiotic Cases', value: dashboard.criticalAntibioticUsages },
            ],
            farmTypes: Object.entries(dashboard.farmsByType || {}).map(([name, value]) => ({ name: humanizeEnum(name), value })),
            species: Object.entries(dashboard.animalsBySpecies || {}).map(([name, value]) => ({ name: humanizeEnum(name), value })),
            compliance: [
              { name: 'Passed', value: dashboard.passedMrlTests },
              { name: 'Failed', value: dashboard.failedMrlTests },
              { name: 'Pending', value: dashboard.pendingMrlTests },
            ],
          })
          return
        }

        if (isVet() || isOfficer()) {
          const [farmsRes, animalsRes, mrlRes, amrRes] = await Promise.all([
            farmAPI.getAll(0, 100),
            animalAPI.getAll(0, 100),
            mrlAPI.getAll(0),
            amrAPI.getAll(0),
          ])

          const farms = farmsRes.data.data?.content || []
          const animals = animalsRes.data.data?.content || []
          const mrl = mrlRes.data.data?.content || []
          const amr = amrRes.data.data?.content || []

          const farmTypeCounts = farms.reduce((acc, farm) => {
            acc[farm.farmType] = (acc[farm.farmType] || 0) + 1
            return acc
          }, {})

          const speciesCounts = animals.reduce((acc, animal) => {
            acc[animal.species] = (acc[animal.species] || 0) + 1
            return acc
          }, {})

          setSummary({
            title: isVet() ? 'Veterinary Analytics' : 'District Analytics',
            cards: [
              { label: 'Farms', value: farms.length },
              { label: 'Animals', value: animals.length },
              { label: 'MRL Records', value: mrl.length },
              { label: 'AMR Records', value: amr.length },
            ],
            farmTypes: Object.entries(farmTypeCounts).map(([name, value]) => ({ name: humanizeEnum(name), value })),
            species: Object.entries(speciesCounts).map(([name, value]) => ({ name: humanizeEnum(name), value })),
            compliance: [
              { name: 'MRL Failures', value: mrl.filter((item) => item.overallResult === 'FAIL').length },
              { name: 'Critical AMR', value: amr.filter((item) => item.drugsUsed?.some((drug) => drug.criticallyImportantAntibiotic)).length },
              { name: 'Active Withdrawal', value: amr.filter((item) => !item.withdrawalPeriodComplete).length },
            ],
          })
          return
        }

        const farmsRes = await farmAPI.getMyFarms(0, 100)
        const farms = farmsRes.data.data?.content || []
        const animalResponses = await Promise.all(farms.map((farm) => animalAPI.getByFarm(farm.id, 0)))
        const mrlResponses = await Promise.all(farms.map((farm) => mrlAPI.getByFarm(farm.id, 0)))
        const amrResponses = await Promise.all(farms.map((farm) => amrAPI.getByFarm(farm.id, 0)))

        const animals = animalResponses.flatMap((response) => response.data.data?.content || [])
        const mrl = mrlResponses.flatMap((response) => response.data.data?.content || [])
        const amr = amrResponses.flatMap((response) => response.data.data?.content || [])

        const speciesCounts = animals.reduce((acc, animal) => {
          acc[animal.species] = (acc[animal.species] || 0) + 1
          return acc
        }, {})

        setSummary({
          title: 'Producer Analytics',
          cards: [
            { label: 'My Farms', value: farms.length },
            { label: 'My Animals', value: animals.length },
            { label: 'MRL Records', value: mrl.length },
            { label: 'AMR Records', value: amr.length },
          ],
          farmTypes: farms.reduce((list, farm) => {
            const name = humanizeEnum(farm.farmType)
            const existing = list.find((item) => item.name === name)
            if (existing) existing.value += 1
            else list.push({ name, value: 1 })
            return list
          }, []),
          species: Object.entries(speciesCounts).map(([name, value]) => ({ name: humanizeEnum(name), value })),
          compliance: [
            { name: 'Healthy', value: animals.filter((animal) => animal.healthStatus === 'HEALTHY').length },
            { name: 'Under Treatment', value: animals.filter((animal) => animal.healthStatus === 'UNDER_TREATMENT').length },
            { name: 'Sick', value: animals.filter((animal) => animal.healthStatus === 'SICK').length },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [isAdmin, isOfficer, isVet])

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">{summary.title}</h1>
          <p className="font-body text-sm text-earth-500 mt-1">Role-aware analytics built from the current live records in the platform.</p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summary.cards.map((card) => (
            <div key={card.label} className="stat-card">
              <div>
                <p className="font-display text-3xl font-bold text-earth-900">{card.value}</p>
                <p className="font-body text-sm text-earth-500 mt-1">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-1">
            <h2 className="font-display text-xl font-semibold text-earth-900">Farm Mix</h2>
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.farmTypes}>
                  <CartesianGrid vertical={false} stroke="#F3E8D8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#D97706" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card lg:col-span-1">
            <h2 className="font-display text-xl font-semibold text-earth-900">Animal Species</h2>
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.species} dataKey="value" cx="50%" cy="50%" outerRadius={92} label>
                    {summary.species.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card lg:col-span-1">
            <h2 className="font-display text-xl font-semibold text-earth-900">Compliance Snapshot</h2>
            <div className="space-y-4 mt-5">
              {summary.compliance.map((item, index) => (
                <div key={item.name} className="rounded-2xl bg-earth-50 p-4">
                  <div className="flex items-center justify-between text-sm font-body text-earth-600 mb-2">
                    <span>{item.name}</span>
                    <span className="font-semibold text-earth-800">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (item.value / Math.max(1, summary.compliance.reduce((total, entry) => total + entry.value, 0))) * 100)}%`,
                        backgroundColor: chartColors[index % chartColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
