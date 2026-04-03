import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { farmAPI, animalAPI } from '../../services/api'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { MapPin, Phone, Mail, Beef, Plus, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FarmDetailPage() {
  const { id } = useParams()
  const [farm, setFarm] = useState(null)
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      farmAPI.getById(id),
      animalAPI.getByFarm(id),
    ]).then(([f, a]) => {
      setFarm(f.data.data)
      setAnimals(a.data.data?.content || [])
    }).catch(() => toast.error('Failed to load farm details'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <DashboardLayout><LoadingSpinner fullPage /></DashboardLayout>
  if (!farm) return <DashboardLayout><p className="font-body text-earth-500">Farm not found</p></DashboardLayout>

  const InfoRow = ({ label, value }) => value ? (
    <div className="flex justify-between py-2 border-b border-earth-50 last:border-0">
      <span className="font-body text-sm text-earth-500">{label}</span>
      <span className="font-body text-sm font-medium text-earth-800">{value}</span>
    </div>
  ) : null

  const Bool = ({ val }) => val
    ? <CheckCircle size={15} className="text-green-500" />
    : <XCircle size={15} className="text-earth-300" />

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <Link to="/farms" className="inline-flex items-center gap-1.5 text-sm text-earth-500 hover:text-mustard-600 font-body mb-4">
            <ArrowLeft size={15} /> Back to Farms
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-earth-900">{farm.farmName}</h1>
              <p className="font-mono text-sm text-earth-400 mt-0.5">{farm.farmRegistrationNumber}</p>
            </div>
            <div className="flex gap-3">
              <span className={`badge ${farm.status === 'ACTIVE' ? 'badge-green' : 'badge-red'} text-sm px-3 py-1`}>{farm.status}</span>
              <span className="badge badge-blue text-sm px-3 py-1">{farm.farmType}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card">
              <h3 className="font-display font-semibold text-earth-900 mb-3">Owner & Contact</h3>
              <InfoRow label="Owner Name" value={farm.ownerName} />
              <InfoRow label="Contact" value={farm.contactNumber} />
              <InfoRow label="Email" value={farm.email} />
            </div>
            <div className="card">
              <h3 className="font-display font-semibold text-earth-900 mb-3">Location</h3>
              <InfoRow label="Address" value={farm.address} />
              <InfoRow label="Village" value={farm.villageName} />
              <InfoRow label="Taluk" value={farm.talukName} />
              <InfoRow label="District" value={farm.districtName} />
              <InfoRow label="State" value={farm.stateName} />
              <InfoRow label="Pincode" value={farm.pincode} />
              {farm.latitude && <InfoRow label="Coordinates" value={`${farm.latitude}, ${farm.longitude}`} />}
            </div>
            <div className="card">
              <h3 className="font-display font-semibold text-earth-900 mb-3">Infrastructure</h3>
              <InfoRow label="Total Land" value={farm.totalLandAreaAcres ? `${farm.totalLandAreaAcres} acres` : null} />
              <InfoRow label="Irrigated Area" value={farm.irrigatedAreaAcres ? `${farm.irrigatedAreaAcres} acres` : null} />
              <InfoRow label="Water Source" value={farm.waterSource} />
              <InfoRow label="Waste Management" value={farm.wasteManagementMethod} />
              <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-1.5 text-sm font-body text-earth-600">
                  <Bool val={farm.hasBiogas} /> Biogas
                </div>
                <div className="flex items-center gap-1.5 text-sm font-body text-earth-600">
                  <Bool val={farm.hasVeterinaryFacility} /> Vet Facility
                </div>
                <div className="flex items-center gap-1.5 text-sm font-body text-earth-600">
                  <Bool val={farm.hasInsurance} /> Insurance
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="space-y-5">
            <div className="card bg-mustard-50 border-mustard-200">
              <p className="font-body text-sm text-mustard-600 mb-1">Total Animals</p>
              <p className="font-display font-bold text-4xl text-mustard-700">{animals.length}</p>
            </div>
            <div className="card">
              <p className="font-body text-xs text-earth-400 mb-1">Registered On</p>
              <p className="font-body text-sm font-medium text-earth-700">
                {farm.registeredAt ? new Date(farm.registeredAt).toLocaleDateString('en-IN') : '—'}
              </p>
            </div>
            <Link to={`/animals/new?farmId=${id}`} className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus size={15} /> Add Animal
            </Link>
          </div>
        </div>

        {/* Animals Table */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-earth-100">
            <h3 className="font-display font-semibold text-earth-900">Animals on this Farm</h3>
            <Link to={`/animals/new?farmId=${id}`} className="btn-primary text-sm flex items-center gap-1.5 py-2">
              <Plus size={14} /> Add Animal
            </Link>
          </div>
          {animals.length === 0 ? (
            <div className="text-center py-10">
              <Beef size={28} className="text-earth-300 mx-auto mb-2" />
              <p className="font-body text-earth-400 text-sm">No animals registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50">
                  <tr>
                    {['Tag No.', 'Name', 'Species', 'Breed', 'Gender', 'Health', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 font-body uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {animals.map(a => (
                    <tr key={a.id} className="hover:bg-earth-50">
                      <td className="px-4 py-3 font-mono text-xs text-earth-600">{a.tagNumber}</td>
                      <td className="px-4 py-3 font-body text-sm font-medium text-earth-900">{a.name || '—'}</td>
                      <td className="px-4 py-3"><span className="badge badge-blue">{a.species}</span></td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{a.breed}</td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{a.gender}</td>
                      <td className="px-4 py-3">
                        <span className={a.healthStatus === 'HEALTHY' ? 'badge-green' : a.healthStatus === 'SICK' ? 'badge-red' : 'badge-yellow'}>{a.healthStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/animals/${a.id}`} className="text-xs text-mustard-600 hover:underline font-body">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}