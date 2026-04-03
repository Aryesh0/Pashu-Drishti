import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { animalAPI, farmAPI } from '../../services/api'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import Modal from '../../components/common/Modal'
import LiveFarmInsights from '../../components/common/LiveFarmInsights'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { ArrowLeft, Beef, Edit3, MapPin, Plus, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCoordinate, formatShortDate, humanizeEnum } from '../../utils/formatters'

export default function FarmProfilePage() {
  const { id } = useParams()
  const [farm, setFarm] = useState(null)
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)

  const loadFarm = async () => {
    setLoading(true)
    try {
      const [farmRes, animalsRes] = await Promise.all([
        farmAPI.getById(id),
        animalAPI.getByFarm(id),
      ])

      const farmData = farmRes.data.data
      setFarm(farmData)
      setAnimals(animalsRes.data.data?.content || [])
      setForm({
        farmName: farmData.farmName || '',
        ownerName: farmData.ownerName || '',
        ownerMobile: farmData.ownerMobile || '',
        stateCode: farmData.stateCode || '',
        stateName: farmData.stateName || '',
        districtCode: farmData.districtCode || '',
        districtName: farmData.districtName || '',
        blockCode: farmData.blockCode || '',
        blockName: farmData.blockName || '',
        villageName: farmData.villageName || '',
        pincode: farmData.pincode || '',
        latitude: farmData.latitude ?? '',
        longitude: farmData.longitude ?? '',
        farmType: farmData.farmType || 'DAIRY',
        totalAreaAcres: farmData.totalAreaAcres ?? '',
        hasDairyShed: Boolean(farmData.hasDairyShed),
        hasMilkingParlor: Boolean(farmData.hasMilkingParlor),
        hasBiogas: Boolean(farmData.hasBiogas),
        hasColdStorage: Boolean(farmData.hasColdStorage),
        hasFodderStorage: Boolean(farmData.hasFodderStorage),
        certifications: (farmData.certifications || []).join(', '),
        gstNumber: farmData.gstNumber || '',
      })
    } catch {
      toast.error('Failed to load farm details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFarm()
  }, [id])

  const setField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!form) return
    setSaving(true)

    try {
      await farmAPI.update(id, {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        totalAreaAcres: form.totalAreaAcres === '' ? null : Number(form.totalAreaAcres),
        certifications: form.certifications
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      })
      toast.success('Farm details updated')
      setEditOpen(false)
      loadFarm()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update farm')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLayout><LoadingSpinner fullPage /></DashboardLayout>
  if (!farm) return <DashboardLayout><p className="font-body text-earth-500">Farm not found</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <Link to="/farms" className="inline-flex items-center gap-1.5 text-sm text-earth-500 hover:text-mustard-600 font-body mb-4">
            <ArrowLeft size={15} /> Back to Farms
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-earth-900">{farm.farmName}</h1>
              <p className="font-mono text-sm text-earth-400 mt-1">{farm.farmRegistrationNumber}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`badge ${farm.status === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>{humanizeEnum(farm.status)}</span>
                <span className="badge badge-blue">{humanizeEnum(farm.farmType)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setEditOpen(true)} className="btn-secondary inline-flex items-center gap-2">
                <Edit3 size={15} /> Edit Farm
              </button>
              <Link to={`/animals/new?farmId=${id}`} className="btn-primary inline-flex items-center gap-2">
                <Plus size={15} /> Add Animal
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="card bg-mustard-50 border-mustard-200">
            <p className="font-body text-sm text-mustard-700">Animals on Farm</p>
            <p className="font-display text-4xl font-bold text-mustard-800 mt-2">{animals.length}</p>
          </div>
          <div className="card">
            <p className="font-body text-sm text-earth-500">Location</p>
            <p className="font-display text-xl font-semibold text-earth-900 mt-2">{farm.districtName}, {farm.stateName}</p>
            <p className="font-body text-sm text-earth-500 mt-1">{farm.villageName || farm.blockName || 'Location recorded'}</p>
          </div>
          <div className="card">
            <p className="font-body text-sm text-earth-500">Registered On</p>
            <p className="font-display text-xl font-semibold text-earth-900 mt-2">{formatShortDate(farm.registeredAt)}</p>
            <p className="font-body text-sm text-earth-500 mt-1">{farm.ownerName}</p>
          </div>
        </div>

        <LiveFarmInsights
          latitude={farm.latitude}
          longitude={farm.longitude}
          subtitle={`${farm.villageName || farm.blockName || farm.districtName}, ${farm.stateName}`}
        />

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-display text-xl font-semibold text-earth-900 mb-4">Farm profile</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-earth-50 p-4">
                  <p className="font-body text-xs text-earth-500">Owner</p>
                  <p className="font-body text-sm font-semibold text-earth-800 mt-1">{farm.ownerName}</p>
                  <p className="font-body text-sm text-earth-500 mt-1">{farm.ownerMobile}</p>
                </div>
                <div className="rounded-2xl bg-earth-50 p-4">
                  <p className="font-body text-xs text-earth-500">Farm Type</p>
                  <p className="font-body text-sm font-semibold text-earth-800 mt-1">{humanizeEnum(farm.farmType)}</p>
                  <p className="font-body text-sm text-earth-500 mt-1">{farm.totalAreaAcres || 'N/A'} acres</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-display text-xl font-semibold text-earth-900 mb-4">Location details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-earth-50 p-4">
                  <p className="font-body text-xs text-earth-500">Village / Block</p>
                  <p className="font-body text-sm font-semibold text-earth-800 mt-1">{farm.villageName || 'N/A'}</p>
                  <p className="font-body text-sm text-earth-500 mt-1">{farm.blockName || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-earth-50 p-4">
                  <p className="font-body text-xs text-earth-500">District / State</p>
                  <p className="font-body text-sm font-semibold text-earth-800 mt-1">{farm.districtName}</p>
                  <p className="font-body text-sm text-earth-500 mt-1">{farm.stateName} {farm.pincode ? `• ${farm.pincode}` : ''}</p>
                </div>
                <div className="rounded-2xl bg-earth-50 p-4 sm:col-span-2">
                  <p className="font-body text-xs text-earth-500">Coordinates</p>
                  <p className="font-body text-sm font-semibold text-earth-800 mt-1 flex items-center gap-2">
                    <MapPin size={14} className="text-mustard-600" />
                    {formatCoordinate(farm.latitude)}, {formatCoordinate(farm.longitude)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="font-display text-xl font-semibold text-earth-900 mb-4">Infrastructure</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Dairy Shed', value: farm.hasDairyShed },
                  { label: 'Milking Parlor', value: farm.hasMilkingParlor },
                  { label: 'Biogas', value: farm.hasBiogas },
                  { label: 'Cold Storage', value: farm.hasColdStorage },
                  { label: 'Fodder Storage', value: farm.hasFodderStorage },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border px-4 py-3 ${item.value ? 'border-green-200 bg-green-50 text-green-700' : 'border-earth-200 bg-earth-50 text-earth-500'}`}>
                    <p className="font-body text-sm font-semibold">{item.label}</p>
                    <p className="font-body text-xs mt-1">{item.value ? 'Available' : 'Not recorded'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="font-display text-xl font-semibold text-earth-900 mb-4">Certifications and IDs</h2>
              <div className="space-y-3">
                <div className="rounded-2xl bg-earth-50 p-4">
                  <p className="font-body text-xs text-earth-500">GST Number</p>
                  <p className="font-body text-sm font-semibold text-earth-800 mt-1">{farm.gstNumber || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-earth-50 p-4">
                  <p className="font-body text-xs text-earth-500">Certifications</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(farm.certifications?.length ? farm.certifications : ['No certifications added']).map((item) => (
                      <span key={item} className="badge badge-gray">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-earth-100">
            <h2 className="font-display font-semibold text-earth-900">Animals registered on this farm</h2>
            <Link to={`/animals/new?farmId=${id}`} className="btn-primary text-sm inline-flex items-center gap-2 py-2">
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
                    {['Tag No.', 'Name', 'Species', 'Breed', 'Gender', 'Health', 'Actions'].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 font-body uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {animals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-earth-50">
                      <td className="px-4 py-3 font-mono text-xs text-earth-600">{animal.tagNumber}</td>
                      <td className="px-4 py-3 font-body text-sm font-medium text-earth-900">{animal.name || 'N/A'}</td>
                      <td className="px-4 py-3"><span className="badge badge-blue">{humanizeEnum(animal.species)}</span></td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{animal.breed}</td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{humanizeEnum(animal.gender)}</td>
                      <td className="px-4 py-3">
                        <span className={animal.healthStatus === 'HEALTHY' ? 'badge-green' : animal.healthStatus === 'SICK' ? 'badge-red' : 'badge-yellow'}>
                          {humanizeEnum(animal.healthStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/animals/${animal.id}`} className="text-xs text-mustard-600 hover:underline font-body">
                          View record
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Farm Details" size="lg">
          {form && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Farm Name</label>
                  <input className="input-field" value={form.farmName} onChange={setField('farmName')} required />
                </div>
                <div>
                  <label className="label">Farm Type</label>
                  <select className="input-field" value={form.farmType} onChange={setField('farmType')}>
                    {['DAIRY', 'POULTRY', 'PIGGERY', 'GOAT', 'SHEEP', 'MIXED', 'AQUACULTURE', 'OTHERS'].map((type) => (
                      <option key={type} value={type}>{humanizeEnum(type)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Owner Name</label>
                  <input className="input-field" value={form.ownerName} onChange={setField('ownerName')} required />
                </div>
                <div>
                  <label className="label">Owner Mobile</label>
                  <input className="input-field" value={form.ownerMobile} onChange={setField('ownerMobile')} required />
                </div>
                <div>
                  <label className="label">Village</label>
                  <input className="input-field" value={form.villageName} onChange={setField('villageName')} />
                </div>
                <div>
                  <label className="label">Block</label>
                  <input className="input-field" value={form.blockName} onChange={setField('blockName')} />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input className="input-field" value={form.pincode} onChange={setField('pincode')} />
                </div>
                <div>
                  <label className="label">Area (acres)</label>
                  <input type="number" step="0.1" className="input-field" value={form.totalAreaAcres} onChange={setField('totalAreaAcres')} />
                </div>
                <div>
                  <label className="label">Latitude</label>
                  <input type="number" step="any" className="input-field" value={form.latitude} onChange={setField('latitude')} />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input type="number" step="any" className="input-field" value={form.longitude} onChange={setField('longitude')} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Certifications</label>
                  <input className="input-field" value={form.certifications} onChange={setField('certifications')} placeholder="Comma separated values" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">GST Number</label>
                  <input className="input-field" value={form.gstNumber} onChange={setField('gstNumber')} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'hasDairyShed', label: 'Dairy Shed' },
                  { key: 'hasMilkingParlor', label: 'Milking Parlor' },
                  { key: 'hasBiogas', label: 'Biogas' },
                  { key: 'hasColdStorage', label: 'Cold Storage' },
                  { key: 'hasFodderStorage', label: 'Fodder Storage' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 rounded-2xl bg-earth-50 px-4 py-3 cursor-pointer">
                    <input type="checkbox" checked={form[item.key]} onChange={setField(item.key)} className="w-4 h-4 accent-mustard-500" />
                    <span className="font-body text-sm text-earth-700">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
