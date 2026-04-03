import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { farmAPI } from '../../services/api'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { STATE_NAMES, getStateCode, getDistricts, getDistrictCode } from '../../utils/indiaData'
import toast from 'react-hot-toast'
import { Loader2, MapPin } from 'lucide-react'

const FARM_TYPES = ['DAIRY', 'POULTRY', 'PIGGERY', 'GOAT', 'SHEEP', 'MIXED', 'AQUACULTURE', 'OTHERS']

const Field = ({ label, children, required, hint }) => (
  <div>
    <label className="label">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-earth-400 mt-1 font-body">{hint}</p>}
  </div>
)

export default function RegisterFarmPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    farmName: '',
    farmType: 'DAIRY',
    ownerName: '',
    ownerMobile: '',
    stateCode: '',
    stateName: '',
    districtCode: '',
    districtName: '',
    blockCode: '',
    blockName: '',
    villageName: '',
    pincode: '',
    latitude: '',
    longitude: '',
    totalAreaAcres: '',
    hasDairyShed: false,
    hasMilkingParlor: false,
    hasBiogas: false,
    hasColdStorage: false,
    hasFodderStorage: false,
    gstNumber: '',
    certifications: [],
  })

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
  }

  const handleStateChange = (e) => {
    const stateName = e.target.value
    setForm(f => ({
      ...f,
      stateName,
      stateCode: getStateCode(stateName),
      districtName: '',
      districtCode: '',
    }))
  }

  const handleDistrictChange = (e) => {
    const districtName = e.target.value
    setForm(f => ({
      ...f,
      districtName,
      districtCode: getDistrictCode(f.stateName, districtName),
    }))
  }

  const handleMobile = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm(f => ({ ...f, ownerMobile: val }))
  }

  const handlePincode = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setForm(f => ({ ...f, pincode: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.farmName.trim()) return toast.error('Farm name is required')
    if (!form.ownerName.trim()) return toast.error('Owner name is required')
    if (!form.ownerMobile || form.ownerMobile.length !== 10) {
      return toast.error('Please enter a valid 10-digit mobile number')
    }
    if (!form.stateName) return toast.error('Please select a state')
    if (!form.districtName) return toast.error('Please select a district')

    setLoading(true)
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        totalAreaAcres: form.totalAreaAcres ? parseFloat(form.totalAreaAcres) : null,
      }
      await farmAPI.create(payload)
      toast.success('Farm registered successfully!')
      navigate('/farms')
    } catch (err) {
      const data = err.response?.data
      if (data?.data && typeof data.data === 'object') {
        Object.values(data.data).forEach(v => toast.error(v))
      } else {
        toast.error(data?.message || 'Failed to register farm')
      }
    } finally {
      setLoading(false)
    }
  }

  const districts = getDistricts(form.stateName)

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">Register New Farm</h1>
          <p className="font-body text-sm text-earth-500 mt-1">
            Fill in the details to register your farm on PASHU-DRISHTI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="card space-y-4">
            <h3 className="font-display font-semibold text-earth-900 border-b border-earth-100 pb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Field label="Farm Name" required>
                <input className="input-field" value={form.farmName}
                  onChange={set('farmName')} placeholder="e.g. Green Meadows Farm" />
              </Field>

              <Field label="Farm Type" required>
                <select className="input-field" value={form.farmType} onChange={set('farmType')}>
                  {FARM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="Owner Name" required>
                <input className="input-field" value={form.ownerName}
                  onChange={set('ownerName')} placeholder="Full name of owner" />
              </Field>

              <Field label="Mobile Number" required hint="10-digit number without country code">
                <input type="tel" inputMode="numeric" className="input-field"
                  value={form.ownerMobile} onChange={handleMobile}
                  placeholder="e.g. 9876543210" maxLength={10} />
              </Field>

              <Field label="GST Number" hint="Optional">
                <input className="input-field font-mono" value={form.gstNumber}
                  onChange={set('gstNumber')} placeholder="e.g. 27AAAAA0000A1Z5" />
              </Field>

            </div>
          </div>

          {/* Location */}
          <div className="card space-y-4">
            <h3 className="font-display font-semibold text-earth-900 border-b border-earth-100 pb-3">
              Location Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Field label="State" required>
                <select className="input-field" value={form.stateName} onChange={handleStateChange}>
                  <option value="">-- Select State / UT --</option>
                  {STATE_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="State Code" hint="Auto-filled">
                <input className="input-field bg-earth-50 text-earth-500 font-mono cursor-not-allowed"
                  value={form.stateCode} readOnly placeholder="Auto-filled" />
              </Field>

              <Field label="District" required>
                <select className="input-field" value={form.districtName}
                  onChange={handleDistrictChange} disabled={!form.stateName}>
                  <option value="">
                    {form.stateName ? '-- Select District --' : '-- Select State First --'}
                  </option>
                  {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                </select>
              </Field>

              <Field label="District Code" hint="Auto-filled">
                <input className="input-field bg-earth-50 text-earth-500 font-mono cursor-not-allowed"
                  value={form.districtCode} readOnly placeholder="Auto-filled" />
              </Field>

              <Field label="Block / Taluk" hint="Optional">
                <input className="input-field" value={form.blockName}
                  onChange={set('blockName')} placeholder="Block or taluk name" />
              </Field>

              <Field label="Village / Town" hint="Optional">
                <input className="input-field" value={form.villageName}
                  onChange={set('villageName')} placeholder="Village or town name" />
              </Field>

              <Field label="Pincode">
                <input type="tel" inputMode="numeric" className="input-field"
                  value={form.pincode} onChange={handlePincode}
                  placeholder="6-digit pincode" maxLength={6} />
              </Field>

            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" hint="Optional — e.g. 18.5204">
                <input type="number" step="any" className="input-field"
                  value={form.latitude} onChange={set('latitude')} placeholder="e.g. 18.5204" />
              </Field>
              <Field label="Longitude" hint="Optional — e.g. 73.8567">
                <input type="number" step="any" className="input-field"
                  value={form.longitude} onChange={set('longitude')} placeholder="e.g. 73.8567" />
              </Field>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="card space-y-4">
            <h3 className="font-display font-semibold text-earth-900 border-b border-earth-100 pb-3">
              Infrastructure
            </h3>

            <Field label="Total Land Area (Acres)">
              <input type="number" step="0.1" min="0" className="input-field"
                value={form.totalAreaAcres} onChange={set('totalAreaAcres')} placeholder="e.g. 5.5" />
            </Field>

            <div className="flex flex-wrap gap-6 pt-1">
              {[
                { key: 'hasDairyShed', label: 'Has Dairy Shed' },
                { key: 'hasMilkingParlor', label: 'Has Milking Parlor' },
                { key: 'hasBiogas', label: 'Has Biogas Plant' },
                { key: 'hasColdStorage', label: 'Has Cold Storage' },
                { key: 'hasFodderStorage', label: 'Has Fodder Storage' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[key]} onChange={set(key)}
                    className="w-4 h-4 accent-mustard-500 rounded" />
                  <span className="font-body text-sm text-earth-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pb-8">
            <button type="button" onClick={() => navigate('/farms')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Registering...</>
                : <><MapPin size={16} /> Register Farm</>}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  )
}