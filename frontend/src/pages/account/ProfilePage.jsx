import { useEffect, useState } from 'react'
import { User, Shield, MapPin, Beef, FlaskConical, Pill } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { adminAPI, amrAPI, animalAPI, farmAPI, mrlAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatRoleLabel } from '../../utils/formatters'

export default function ProfilePage() {
  const { user, isAdmin, isVet, isOfficer } = useAuth()
  const [stats, setStats] = useState([
    { label: 'Accessible Farms', value: 0, icon: <MapPin size={18} /> },
    { label: 'Accessible Animals', value: 0, icon: <Beef size={18} /> },
    { label: 'MRL Records', value: 0, icon: <FlaskConical size={18} /> },
    { label: 'AMR Records', value: 0, icon: <Pill size={18} /> },
  ])

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (isAdmin()) {
          const response = await adminAPI.getDashboard()
          const dashboard = response.data.data
          setStats([
            { label: 'Accessible Farms', value: dashboard.totalFarms, icon: <MapPin size={18} /> },
            { label: 'Accessible Animals', value: dashboard.totalAnimals, icon: <Beef size={18} /> },
            { label: 'MRL Records', value: dashboard.totalMrlTests, icon: <FlaskConical size={18} /> },
            { label: 'AMR Records', value: dashboard.totalAntimicrobialUsages, icon: <Pill size={18} /> },
          ])
          return
        }

        if (isVet() || isOfficer()) {
          const [farmsRes, animalsRes, mrlRes, amrRes] = await Promise.all([
            farmAPI.getAll(0, 100),
            animalAPI.getAll(0, 100),
            mrlAPI.getAll(0),
            amrAPI.getAll(0),
          ])

          setStats([
            { label: 'Accessible Farms', value: farmsRes.data.data?.totalElements || farmsRes.data.data?.content?.length || 0, icon: <MapPin size={18} /> },
            { label: 'Accessible Animals', value: animalsRes.data.data?.totalElements || animalsRes.data.data?.content?.length || 0, icon: <Beef size={18} /> },
            { label: 'MRL Records', value: mrlRes.data.data?.totalElements || mrlRes.data.data?.content?.length || 0, icon: <FlaskConical size={18} /> },
            { label: 'AMR Records', value: amrRes.data.data?.totalElements || amrRes.data.data?.content?.length || 0, icon: <Pill size={18} /> },
          ])
          return
        }

        const farmsRes = await farmAPI.getMyFarms(0, 100)
        const farms = farmsRes.data.data?.content || []

        const results = await Promise.all(
          farms.map(async (farm) => {
            const [animalsRes, mrlRes, amrRes] = await Promise.all([
              animalAPI.getByFarm(farm.id, 0),
              mrlAPI.getByFarm(farm.id, 0),
              amrAPI.getByFarm(farm.id, 0),
            ])

            return {
              animals: animalsRes.data.data?.content?.length || 0,
              mrl: mrlRes.data.data?.content?.length || 0,
              amr: amrRes.data.data?.content?.length || 0,
            }
          })
        )

        setStats([
          { label: 'Accessible Farms', value: farms.length, icon: <MapPin size={18} /> },
          { label: 'Accessible Animals', value: results.reduce((sum, item) => sum + item.animals, 0), icon: <Beef size={18} /> },
          { label: 'MRL Records', value: results.reduce((sum, item) => sum + item.mrl, 0), icon: <FlaskConical size={18} /> },
          { label: 'AMR Records', value: results.reduce((sum, item) => sum + item.amr, 0), icon: <Pill size={18} /> },
        ])
      } catch {
        // keep defaults
      }
    }

    loadStats()
  }, [isAdmin, isOfficer, isVet])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">My Profile</h1>
          <p className="font-body text-sm text-earth-500 mt-1">Current access, role coverage, and workspace summary.</p>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-mustard-100 text-mustard-700 flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-earth-900">{user?.fullName}</h2>
                <p className="font-body text-sm text-earth-500">@{user?.username}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-earth-50 px-4 py-3">
                <p className="font-body text-xs text-earth-500">Email</p>
                <p className="font-body text-sm font-semibold text-earth-800">{user?.email}</p>
              </div>
              <div className="rounded-2xl bg-earth-50 px-4 py-3">
                <p className="font-body text-xs text-earth-500">Assigned roles</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user?.roles?.map((role) => (
                    <span key={role} className="badge badge-blue">
                      {formatRoleLabel(role)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-earth-50 px-4 py-3">
                <p className="font-body text-xs text-earth-500">Access model</p>
                <p className="mt-1 font-body text-sm text-earth-700">
                  Your workspace surfaces only the records and actions available to the role sets attached to this account.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-earth-900">Workspace footprint</h2>
                <p className="font-body text-sm text-earth-500">A snapshot of what this account can currently operate on.</p>
              </div>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-earth-50 p-5">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-mustard-600 shadow-sm">
                    {item.icon}
                  </div>
                  <p className="mt-4 font-display text-3xl font-bold text-earth-900">{item.value}</p>
                  <p className="font-body text-sm text-earth-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
