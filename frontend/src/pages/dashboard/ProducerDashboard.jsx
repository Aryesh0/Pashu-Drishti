import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Beef, FlaskConical, MapPin, Pill, Plus, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import LiveFarmInsights from '../../components/common/LiveFarmInsights'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { amrAPI, animalAPI, farmAPI, mrlAPI } from '../../services/api'
import { formatShortDate, humanizeEnum } from '../../utils/formatters'

const getFarmId = (farm) => farm?.id || farm?.farmId || ''

export default function ProducerDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [farms, setFarms] = useState([])
  const [animals, setAnimals] = useState([])
  const [failedTests, setFailedTests] = useState([])
  const [withdrawals, setWithdrawals] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const farmsResponse = await farmAPI.getMyFarms(0, 100)
        const myFarms = farmsResponse.data?.data?.content || []
        setFarms(myFarms)

        const animalResponses = await Promise.all(myFarms.map((farm) => animalAPI.getByFarm(getFarmId(farm), 0, 100)))
        const mrlResponses = await Promise.all(myFarms.map((farm) => mrlAPI.getByFarm(getFarmId(farm), 0, 100)))
        const amrResponses = await Promise.all(myFarms.map((farm) => amrAPI.getByFarm(getFarmId(farm), 0, 100)))

        const nextAnimals = animalResponses.flatMap((response) => response.data?.data?.content || [])
        const nextMrl = mrlResponses.flatMap((response) => response.data?.data?.content || [])
        const nextAmr = amrResponses.flatMap((response) => response.data?.data?.content || [])

        setAnimals(nextAnimals)
        setFailedTests(nextMrl.filter((item) => item.overallResult === 'FAIL'))
        setWithdrawals(nextAmr.filter((item) => !item.withdrawalPeriodComplete))
      } catch {
        toast.error('Failed to load producer dashboard')
        setFarms([])
        setAnimals([])
        setFailedTests([])
        setWithdrawals([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage />
      </DashboardLayout>
    )
  }

  const primaryFarm = farms[0]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-hero rounded-3xl p-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <p className="font-body text-sm text-white/75">Producer workspace</p>
            <h1 className="font-display text-3xl font-bold mt-2">{user?.fullName || 'Farmer / Producer'}</h1>
            <p className="font-body text-sm text-white/75 mt-2">Track your farms, animals, tests, and treatments from one connected dashboard.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'My Farms', value: farms.length, href: '/farms', icon: <MapPin size={18} /> },
            { label: 'My Animals', value: animals.length, href: '/animals', icon: <Beef size={18} /> },
            { label: 'Failed MRL Tests', value: failedTests.length, href: '/mrl-tests', icon: <FlaskConical size={18} /> },
            { label: 'Active Withdrawals', value: withdrawals.length, href: '/antimicrobial', icon: <Pill size={18} /> },
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

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Register Farm', href: '/farms/new', icon: <MapPin size={18} /> },
            { label: 'Add Animal', href: '/animals/new', icon: <Plus size={18} /> },
            { label: 'Open Animal Records', href: '/animals', icon: <Beef size={18} /> },
            { label: 'Scan QR / RFID', href: '/scan', icon: <QrCode size={18} /> },
          ].map((item) => (
            <Link key={item.label} to={item.href} className="card hover:-translate-y-0.5 transition-transform flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-earth-100 text-earth-700 flex items-center justify-center">{item.icon}</div>
              <span className="font-body text-sm font-semibold text-earth-800">{item.label}</span>
            </Link>
          ))}
        </div>

        {primaryFarm && (
          <LiveFarmInsights
            latitude={primaryFarm.latitude}
            longitude={primaryFarm.longitude}
            subtitle={`${primaryFarm.farmName} • ${primaryFarm.districtName}, ${primaryFarm.stateName}`}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">My farms</h2>
              <Link to="/farms" className="text-sm text-mustard-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {!farms.length ? (
                <p className="font-body text-sm text-earth-400">Register your first farm to start tracking livestock.</p>
              ) : farms.slice(0, 4).map((farm) => (
                <Link key={getFarmId(farm)} to={`/farms/${getFarmId(farm)}`} className="block rounded-2xl border border-earth-200 bg-earth-50 p-4">
                  <p className="font-body text-sm font-semibold text-earth-900">{farm.farmName}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">{farm.districtName}, {farm.stateName}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">Recent animals</h2>
              <Link to="/animals" className="text-sm text-mustard-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {!animals.length ? (
                <p className="font-body text-sm text-earth-400">No animals registered yet.</p>
              ) : animals.slice(0, 4).map((animal) => (
                <Link key={animal.id} to={`/animals/${animal.id}`} className="block rounded-2xl border border-earth-200 bg-earth-50 p-4">
                  <p className="font-body text-sm font-semibold text-earth-900">{animal.name || animal.tagNumber}</p>
                  <p className="font-body text-xs text-earth-500 mt-1">{animal.farmName} • {humanizeEnum(animal.healthStatus)}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-earth-900">Compliance watch</h2>
              <Link to="/mrl-tests" className="text-sm text-mustard-600 hover:underline">Open records</Link>
            </div>
            <div className="space-y-3">
              {!failedTests.length && !withdrawals.length ? (
                <p className="font-body text-sm text-earth-400">No failed tests or active withdrawals are visible across your farms.</p>
              ) : (
                <>
                  {failedTests.slice(0, 2).map((test) => (
                    <div key={test.id} className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="font-body text-sm font-semibold text-earth-900">{test.farmName}</p>
                      <p className="font-body text-xs text-earth-500 mt-1">{humanizeEnum(test.sampleType)} sample • {formatShortDate(test.sampleCollectionDate)}</p>
                    </div>
                  ))}
                  {withdrawals.slice(0, 2).map((record) => (
                    <div key={record.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="font-body text-sm font-semibold text-earth-900">{record.diagnosis}</p>
                      <p className="font-body text-xs text-earth-500 mt-1">Milk: {formatShortDate(record.milkWithdrawalEndDate)} • Meat: {formatShortDate(record.meatWithdrawalEndDate)}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
