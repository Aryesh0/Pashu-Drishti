import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Info, Loader2, RefreshCw, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { animalAPI, farmAPI } from '../../services/api'
import { generateIcarTag } from '../../utils/indiaData'
import { humanizeEnum } from '../../utils/formatters'
import { getBreedOptions } from '../../utils/livestockCatalog'

const SPECIES = ['COW', 'BUFFALO', 'GOAT', 'SHEEP', 'PIG', 'POULTRY', 'HORSE', 'CAMEL', 'RABBIT', 'OTHERS']
const GENDERS = ['MALE', 'FEMALE']
const PURPOSES = ['DAIRY', 'MEAT', 'BREEDING', 'DRAUGHT', 'PET', 'SHOW', 'MIXED']
const HEALTH_STATUSES = ['HEALTHY', 'SICK', 'UNDER_TREATMENT', 'QUARANTINED', 'RECOVERED']
const BODY_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR']
const SOURCE_TYPES = ['BORN_ON_FARM', 'PURCHASED', 'TRANSFERRED', 'GOVERNMENT_SUPPLIED', 'UNKNOWN']

const Field = ({ label, children, required = false, hint }) => (
  <div>
    <label className="label">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-earth-400 mt-1 font-body">{hint}</p>}
  </div>
)

const getFarmId = (farm) => farm?.id || farm?.farmId || ''

const farmSeqFromId = (value = '') =>
  String(
    value
      .split('')
      .reduce((total, char) => total + char.charCodeAt(0), 0) % 999
  + 1).padStart(3, '0')

const toNullableDate = (value) => (value ? value : null)
const toNullableNumber = (value) => (value === '' ? null : Number(value))

export default function RegisterAnimalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedFarmId = searchParams.get('farmId')
  const { isAdmin, isVet, isOfficer } = useAuth()
  const isPrivileged = isAdmin() || isVet() || isOfficer()

  const [loading, setLoading] = useState(false)
  const [farmsLoading, setFarmsLoading] = useState(true)
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [tagEdited, setTagEdited] = useState(false)
  const [form, setForm] = useState({
    tagNumber: '',
    farmId: preselectedFarmId || '',
    name: '',
    species: 'COW',
    breed: '',
    gender: 'FEMALE',
    dateOfBirth: '',
    colorMarkings: '',
    purpose: 'DAIRY',
    bodyConditionScore: 'GOOD',
    healthStatus: 'HEALTHY',
    sourceType: 'BORN_ON_FARM',
    acquisitionDate: '',
    bodyWeightKg: '',
    isPregnant: false,
    expectedDeliveryDate: '',
    lastCalvingDate: '',
    averageDailyMilkLitres: '',
    insurancePolicyNumber: '',
    insuranceCompany: '',
    insuranceValidTill: '',
    notes: '',
  })

  const breedOptions = getBreedOptions(form.species)

  useEffect(() => {
    const loadFarms = async () => {
      setFarmsLoading(true)
      try {
        const response = isPrivileged
          ? await farmAPI.getAll(0, 100)
          : await farmAPI.getMyFarms(0, 100)
        const list = response.data?.data?.content || []
        setFarms(list)

        const initialFarmId = preselectedFarmId || (list.length === 1 ? getFarmId(list[0]) : '')
        if (!initialFarmId) return

        const farm = list.find((item) => getFarmId(item) === initialFarmId)
        if (!farm) return

        setSelectedFarm(farm)
        setForm((current) => ({
          ...current,
          farmId: initialFarmId,
          tagNumber: current.tagNumber || generateIcarTag(farm.stateName, farmSeqFromId(initialFarmId)),
        }))
      } catch {
        toast.error('Could not load farms')
      } finally {
        setFarmsLoading(false)
      }
    }

    loadFarms()
  }, [isPrivileged, preselectedFarmId])

  const updateField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => {
      if (key === 'species') {
        const nextBreedOptions = getBreedOptions(value)
        const shouldResetBreed = current.breed && !nextBreedOptions.includes(current.breed)
        return {
          ...current,
          species: value,
          breed: shouldResetBreed ? '' : current.breed,
        }
      }
      return { ...current, [key]: value }
    })
  }

  const handleFarmChange = (event) => {
    const farmId = event.target.value
    const farm = farms.find((item) => getFarmId(item) === farmId) || null
    setSelectedFarm(farm)
    setForm((current) => ({
      ...current,
      farmId,
      tagNumber: tagEdited || !farm ? current.tagNumber : generateIcarTag(farm.stateName, farmSeqFromId(farmId)),
    }))
  }

  const regenerateTag = () => {
    if (!selectedFarm) {
      toast.error('Select a farm first')
      return
    }

    setForm((current) => ({
      ...current,
      tagNumber: generateIcarTag(selectedFarm.stateName, farmSeqFromId(getFarmId(selectedFarm))),
    }))
    setTagEdited(false)
    toast.success('New ICAR tag generated')
  }

  const handleTagChange = (event) => {
    const value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
    setForm((current) => ({ ...current, tagNumber: value }))
    setTagEdited(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.farmId) {
      toast.error('Please select a farm')
      return
    }

    if (form.tagNumber.length !== 12 || !form.tagNumber.startsWith('IN')) {
      toast.error('ICAR tag must be 12 characters and start with IN')
      return
    }

    if (!form.breed.trim()) {
      toast.error('Breed is required')
      return
    }

    setLoading(true)
    try {
      const payload = {
        tagNumber: form.tagNumber,
        farmId: form.farmId,
        species: form.species,
        breed: form.breed.trim(),
        name: form.name.trim() || null,
        gender: form.gender,
        dateOfBirth: toNullableDate(form.dateOfBirth),
        colorMarkings: form.colorMarkings.trim() || null,
        purpose: form.purpose,
        bodyConditionScore: form.bodyConditionScore,
        notes: form.notes.trim() || null,
        sourceType: form.sourceType,
        acquisitionDate: toNullableDate(form.acquisitionDate),
        bodyWeightKg: toNullableNumber(form.bodyWeightKg),
        healthStatus: form.healthStatus,
        insurancePolicyNumber: form.insurancePolicyNumber.trim() || null,
        insuranceCompany: form.insuranceCompany.trim() || null,
        insuranceValidTill: toNullableDate(form.insuranceValidTill),
        isPregnant: form.gender === 'FEMALE' ? form.isPregnant : false,
        expectedDeliveryDate: form.gender === 'FEMALE' && form.isPregnant ? toNullableDate(form.expectedDeliveryDate) : null,
        lastCalvingDate: form.gender === 'FEMALE' ? toNullableDate(form.lastCalvingDate) : null,
        averageDailyMilkLitres: form.gender === 'FEMALE' ? toNullableNumber(form.averageDailyMilkLitres) : null,
      }

      const response = await animalAPI.create(payload)
      toast.success('Animal registered successfully')
      navigate(`/animals/${response.data?.data?.id || ''}`)
    } catch (error) {
      const validation = error.response?.data?.data
      if (validation && typeof validation === 'object') {
        Object.values(validation).forEach((message) => toast.error(String(message)))
      } else {
        toast.error(error.response?.data?.message || 'Failed to register animal')
      }
    } finally {
      setLoading(false)
    }
  }

  const showFemaleSection = form.gender === 'FEMALE'

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">Register New Animal</h1>
          <p className="font-body text-sm text-earth-500 mt-1">
            Create a complete livestock record with ICAR identity, health status, and production details.
          </p>
        </div>

        {!farmsLoading && farms.length === 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-sm font-semibold text-red-700">No farms available yet</p>
              <p className="font-body text-xs text-red-600 mt-1">
                Register a farm first so this animal can be mapped to an actual location and owner.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-earth-900 border-b border-earth-100 pb-3">Farm Assignment</h2>

            <Field label="Select Farm" required>
              <select
                className="input-field"
                value={form.farmId}
                onChange={handleFarmChange}
                disabled={farmsLoading || farms.length === 0}
              >
                <option value="">
                  {farmsLoading ? 'Loading farms...' : farms.length === 0 ? 'Register a farm first' : '-- Select a Farm --'}
                </option>
                {farms.map((farm) => (
                  <option key={getFarmId(farm)} value={getFarmId(farm)}>
                    {farm.farmName} - {farm.districtName}, {farm.stateName}
                  </option>
                ))}
              </select>
            </Field>

            {selectedFarm && (
              <div className="flex items-start gap-2 rounded-xl border border-mustard-200 bg-mustard-50 p-3">
                <Info size={15} className="text-mustard-600 mt-0.5 shrink-0" />
                <p className="font-body text-xs text-mustard-700">
                  ICAR state code <strong>{selectedFarm.stateCode}</strong> is embedded into the generated tag for {selectedFarm.stateName}.
                </p>
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-earth-900 border-b border-earth-100 pb-3">Identity</h2>

            <Field label="ICAR Tag Number" required hint="12 characters: IN + state code + farm sequence + serial">
              <div className="flex gap-2">
                <input
                  className="input-field font-mono uppercase tracking-[0.2em] flex-1"
                  value={form.tagNumber}
                  onChange={handleTagChange}
                  placeholder="IN2700104521"
                  maxLength={12}
                />
                <button
                  type="button"
                  className="btn-secondary px-3 inline-flex items-center gap-1.5"
                  onClick={regenerateTag}
                  disabled={!selectedFarm}
                >
                  <RefreshCw size={14} /> New
                </button>
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Animal Name / Local ID">
                <input className="input-field" value={form.name} onChange={updateField('name')} placeholder="e.g. Gauri" />
              </Field>

              <Field label="Species" required>
                <select className="input-field" value={form.species} onChange={updateField('species')}>
                  {SPECIES.map((species) => (
                    <option key={species} value={species}>{humanizeEnum(species)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Breed" required>
                {breedOptions.length > 0 ? (
                  <select className="input-field" value={form.breed} onChange={updateField('breed')} required>
                    <option value="">-- Select Breed --</option>
                    {breedOptions.map((breed) => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                ) : (
                  <input className="input-field" value={form.breed} onChange={updateField('breed')} placeholder="Enter breed name" />
                )}
              </Field>

              <Field label="Gender" required>
                <select className="input-field" value={form.gender} onChange={updateField('gender')}>
                  {GENDERS.map((gender) => (
                    <option key={gender} value={gender}>{humanizeEnum(gender)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Date of Birth">
                <input type="date" className="input-field" value={form.dateOfBirth} onChange={updateField('dateOfBirth')} />
              </Field>

              <Field label="Source Type">
                <select className="input-field" value={form.sourceType} onChange={updateField('sourceType')}>
                  {SOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>{humanizeEnum(type)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Acquisition Date">
                <input type="date" className="input-field" value={form.acquisitionDate} onChange={updateField('acquisitionDate')} />
              </Field>

              <Field label="Color / Markings">
                <input
                  className="input-field"
                  value={form.colorMarkings}
                  onChange={updateField('colorMarkings')}
                  placeholder="e.g. White patch on forehead"
                />
              </Field>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-earth-900 border-b border-earth-100 pb-3">Health and Production</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Purpose">
                <select className="input-field" value={form.purpose} onChange={updateField('purpose')}>
                  {PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>{humanizeEnum(purpose)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Health Status">
                <select className="input-field" value={form.healthStatus} onChange={updateField('healthStatus')}>
                  {HEALTH_STATUSES.map((status) => (
                    <option key={status} value={status}>{humanizeEnum(status)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Body Condition Score">
                <select className="input-field" value={form.bodyConditionScore} onChange={updateField('bodyConditionScore')}>
                  {BODY_CONDITIONS.map((score) => (
                    <option key={score} value={score}>{humanizeEnum(score)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Body Weight (kg)">
                <input type="number" step="0.1" min="0" className="input-field" value={form.bodyWeightKg} onChange={updateField('bodyWeightKg')} />
              </Field>

              {showFemaleSection && (
                <>
                  <Field label="Average Daily Milk (litres)">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="input-field"
                      value={form.averageDailyMilkLitres}
                      onChange={updateField('averageDailyMilkLitres')}
                    />
                  </Field>

                  <Field label="Last Calving Date">
                    <input type="date" className="input-field" value={form.lastCalvingDate} onChange={updateField('lastCalvingDate')} />
                  </Field>
                </>
              )}
            </div>

            {showFemaleSection && (
              <div className="space-y-3 rounded-2xl bg-earth-50 p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPregnant} onChange={updateField('isPregnant')} className="w-4 h-4 accent-mustard-500" />
                  <span className="font-body text-sm text-earth-700">Currently pregnant</span>
                </label>
                {form.isPregnant && (
                  <Field label="Expected Delivery Date">
                    <input type="date" className="input-field" value={form.expectedDeliveryDate} onChange={updateField('expectedDeliveryDate')} />
                  </Field>
                )}
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-earth-900 border-b border-earth-100 pb-3">Insurance and Notes</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Insurance Policy Number">
                <input className="input-field" value={form.insurancePolicyNumber} onChange={updateField('insurancePolicyNumber')} />
              </Field>

              <Field label="Insurance Company">
                <input className="input-field" value={form.insuranceCompany} onChange={updateField('insuranceCompany')} />
              </Field>

              <Field label="Insurance Valid Till">
                <input type="date" className="input-field" value={form.insuranceValidTill} onChange={updateField('insuranceValidTill')} />
              </Field>
            </div>

            <Field label="Notes" hint="Special handling, medical context, or traceability notes">
              <textarea className="input-field resize-none" rows={4} value={form.notes} onChange={updateField('notes')} />
            </Field>
          </div>

          <div className="flex gap-4 pb-8">
            <button type="button" onClick={() => navigate('/animals')} className="btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              disabled={loading || farms.length === 0}
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Tag size={16} />}
              {loading ? 'Registering...' : 'Register Animal'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
