import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Beef, FlaskConical, MapPin, Pill } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { amrAPI, animalAPI, farmAPI, mrlAPI } from '../../services/api'
import { formatShortDate, humanizeEnum } from '../../utils/formatters'

export default function DistrictDashboard() {
  const [loading, setLoading] = useState(true)
  const [farms, setFarms] = useState([])
  const [animals, setAnimals] = useState([])
  const [failedTests, setFailedTests] = useState([])
  const [criticalUsages, setCriticalUsages] = useState([])

  useEffect(() => {
    Promise.all([
      farmAPI.getAll(0, 100),
      animalAPI.getAll(0, 100),
      mrlAPI.getFailed(0, 20),
      amrAPI.getCritical(0, 20),
    ]).then(([farmsResponse, animalsResponse, testsResponse, amrResponse]) => {
      setFarms(farmsResponse.data?.data?.content || [])
      setAnimals(animalsResponse.data?.data?.content || [])
      setFailedTests(testsResponse.data?.data?.content || [])
      setCriticalUsages(amrResponse.data?.data?.content || [])
    }).catch(() => toast.error('Failed to load district dashboard'))
      .finally(() => setLoading(false))
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
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">District Officer Workspace</h1>
          <p className="font-body text-sm text-earth-500 mt-1">Monitor farm operations, failed residue cases, and critical antibiotic exposure.</p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Farms in Scope', value: farms.length, href: '/farms', icon: <MapPin size={18} /> },
            { label: 'Animals in Scope', value: animals.length, href: '/animals', icon: <Beef size={18} /> },
            { label: 'Failed MRL Tests', value: failedTests.length, href: '/mrl-tests', icon: <FlaskConical size={18} /> },
            { label: 'Critical AMR Records', value: criticalUsages.length, href: '/antimicrobial', icon: <Pill size={18} /> },
          ].map((card) => (
            <Link key={card.label} to={card.href} className="stat-card group">
              <div className="w-11 h-11 rounded-2xl bg-mustard-50 text-mustard-700 flex items-center justify-center">{card.icon}</div>
              <div>
                <p className="font-display text-3xl font-bold text-earth-900">{card.value}</p>
                <p className="font-body text-sm text-earth-500">{card.label}</p>
              </div>
              <ArrowRight size={15} className="ml-auto text-earth-300 group-hover:text-mustard-600" />
            </Link>
          ))}
        </div>

        {(failedTests.length > 0 || criticalUsages.length > 0) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-body text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} />
              Compliance intervention needed in your district
            </p>
            <p className="font-body text-sm text-red-600 mt-2">
              {failedTests.length} failed MRL results and {criticalUsages.length} critical antibiotic usage records are currently visible.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">Failed MRL queue</h2>
              <Link to="/mrl-tests" className="text-sm text-mustard-600 hover:underline">Open registry</Link>
            </div>
            <div className="space-y-3">
              {!failedTests.length ? (
                <p className="font-body text-sm text-earth-400">No failed tests are currently visible.</p>
              ) : failedTests.slice(0, 5).map((test) => (
                <div key={test.id} className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="font-body text-sm font-semibold text-earth-900">{test.farmName}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">{humanizeEnum(test.sampleType)} sample • {formatShortDate(test.sampleCollectionDate)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">Critical AMR usage</h2>
              <Link to="/antimicrobial" className="text-sm text-mustard-600 hover:underline">Open tracker</Link>
            </div>
            <div className="space-y-3">
              {!criticalUsages.length ? (
                <p className="font-body text-sm text-earth-400">No critical antibiotic records are currently flagged.</p>
              ) : criticalUsages.slice(0, 5).map((record) => (
                <div key={record.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-body text-sm font-semibold text-earth-900">{record.diagnosis}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">{record.farmName} • {record.prescribingVetName}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">Recent farms</h2>
              <Link to="/farms" className="text-sm text-mustard-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {!farms.length ? (
                <p className="font-body text-sm text-earth-400">No farms found in scope.</p>
              ) : farms.slice(0, 5).map((farm) => (
                <Link key={farm.id} to={`/farms/${farm.id}`} className="block rounded-2xl border border-earth-200 bg-earth-50 p-4">
                  <p className="font-body text-sm font-semibold text-earth-900">{farm.farmName}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">{farm.districtName}, {farm.stateName}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
