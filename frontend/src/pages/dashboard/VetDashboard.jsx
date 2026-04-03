import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, Pill, QrCode, Stethoscope } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { amrAPI, animalAPI, mrlAPI } from '../../services/api'
import { formatShortDate, humanizeEnum } from '../../utils/formatters'

export default function VetDashboard() {
  const [loading, setLoading] = useState(true)
  const [sickAnimals, setSickAnimals] = useState([])
  const [failedTests, setFailedTests] = useState([])
  const [withdrawals, setWithdrawals] = useState([])

  useEffect(() => {
    Promise.all([
      animalAPI.getSick(0, 8),
      mrlAPI.getFailed(0, 8),
      amrAPI.getActiveWithdrawals(0, 8),
    ]).then(([animalsResponse, testsResponse, withdrawalResponse]) => {
      setSickAnimals(animalsResponse.data?.data?.content || [])
      setFailedTests(testsResponse.data?.data?.content || [])
      setWithdrawals(withdrawalResponse.data?.data?.content || [])
    }).catch(() => {
      setSickAnimals([])
      setFailedTests([])
      setWithdrawals([])
    }).finally(() => setLoading(false))
  }, [])

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
        <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-earth-900">Veterinarian Workspace</h1>
            <p className="font-body text-sm text-earth-500 mt-1">Focus on clinical follow-up, failed residue results, and withdrawal risk.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/mrl-tests" className="btn-secondary inline-flex items-center gap-2"><FlaskConical size={15} /> Manage MRL</Link>
            <Link to="/antimicrobial" className="btn-primary inline-flex items-center gap-2"><Pill size={15} /> Manage AMR</Link>
            <Link to="/scan" className="btn-secondary inline-flex items-center gap-2"><QrCode size={15} /> Scan Animal</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Sick Animals', value: sickAnimals.length, href: '/animals', icon: <Stethoscope size={18} />, color: 'bg-red-50 text-red-600' },
            { label: 'Failed MRL Tests', value: failedTests.length, href: '/mrl-tests', icon: <FlaskConical size={18} />, color: 'bg-amber-50 text-amber-700' },
            { label: 'Active Withdrawals', value: withdrawals.length, href: '/antimicrobial', icon: <Pill size={18} />, color: 'bg-blue-50 text-blue-600' },
          ].map((card) => (
            <Link key={card.label} to={card.href} className="stat-card group">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}>{card.icon}</div>
              <div>
                <p className="font-display text-3xl font-bold text-earth-900">{card.value}</p>
                <p className="font-body text-sm text-earth-500">{card.label}</p>
              </div>
              <ArrowRight size={15} className="ml-auto text-earth-300 group-hover:text-mustard-600" />
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">Animals needing attention</h2>
              <Link to="/animals" className="text-sm text-mustard-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {!sickAnimals.length ? (
                <p className="font-body text-sm text-earth-400">No sick animals are currently flagged.</p>
              ) : sickAnimals.map((animal) => (
                <div key={animal.id} className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="font-body text-sm font-semibold text-earth-900">{animal.name || animal.tagNumber}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">{animal.farmName} • {humanizeEnum(animal.species)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">Failed MRL results</h2>
              <Link to="/mrl-tests" className="text-sm text-mustard-600 hover:underline">Open registry</Link>
            </div>
            <div className="space-y-3">
              {!failedTests.length ? (
                <p className="font-body text-sm text-earth-400">No failed MRL results are visible right now.</p>
              ) : failedTests.map((test) => (
                <div key={test.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-body text-sm font-semibold text-earth-900">{test.farmName}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">{humanizeEnum(test.sampleType)} • {test.sampleId}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">Withdrawal watchlist</h2>
              <Link to="/antimicrobial" className="text-sm text-mustard-600 hover:underline">Open tracker</Link>
            </div>
            <div className="space-y-3">
              {!withdrawals.length ? (
                <p className="font-body text-sm text-earth-400">No active withdrawals need follow-up.</p>
              ) : withdrawals.map((record) => (
                <div key={record.id} className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="font-body text-sm font-semibold text-earth-900">{record.diagnosis}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">{record.farmName}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">Milk: {formatShortDate(record.milkWithdrawalEndDate)} • Meat: {formatShortDate(record.meatWithdrawalEndDate)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
