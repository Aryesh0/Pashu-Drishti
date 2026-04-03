import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Edit3,
  QrCode,
  Save,
  Shield,
  Syringe,
  Tag,
  Waves,
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import Modal from '../../components/common/Modal'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { animalAPI, rfidAPI } from '../../services/api'
import { formatDateTime, formatShortDate, humanizeEnum } from '../../utils/formatters'
import { buildVaccinationSuggestion, getVaccinesForSpecies, getWithdrawalSummary } from '../../utils/livestockCatalog'

const HEALTH_COLORS = {
  HEALTHY: 'badge-green',
  SICK: 'badge-red',
  UNDER_TREATMENT: 'badge-blue',
  QUARANTINED: 'badge-red',
  RECOVERED: 'badge-green',
}

const STATUS_OPTIONS = ['ACTIVE', 'SOLD', 'DIED', 'SLAUGHTERED', 'TRANSFERRED']
const HEALTH_OPTIONS = ['HEALTHY', 'SICK', 'UNDER_TREATMENT', 'QUARANTINED', 'RECOVERED']
const RFID_TYPES = ['EAR_TAG', 'BOLUS', 'ANKLET']

const emptyVaccinationForm = {
  vaccineKey: '',
  vaccineName: '',
  disease: '',
  vaccinationDate: '',
  nextDueDate: '',
  administeredBy: '',
  batchNumber: '',
}

const buildEditForm = (animal) => ({
  tagNumber: animal.tagNumber || '',
  farmId: animal.farmId || '',
  species: animal.species || 'COW',
  breed: animal.breed || '',
  name: animal.name || '',
  gender: animal.gender || 'FEMALE',
  dateOfBirth: animal.dateOfBirth || '',
  colorMarkings: animal.colorMarkings || '',
  purpose: animal.purpose || 'DAIRY',
  bodyConditionScore: animal.bodyConditionScore || 'GOOD',
  notes: animal.notes || '',
  sourceType: animal.sourceType || 'BORN_ON_FARM',
  acquisitionDate: animal.acquisitionDate || '',
  bodyWeightKg: animal.bodyWeightKg ?? '',
  healthStatus: animal.healthStatus || 'HEALTHY',
  insurancePolicyNumber: animal.insurancePolicyNumber || '',
  insuranceCompany: animal.insuranceCompany || '',
  insuranceValidTill: animal.insuranceValidTill || '',
  isPregnant: Boolean(animal.isPregnant),
  expectedDeliveryDate: animal.expectedDeliveryDate || '',
  lastCalvingDate: animal.lastCalvingDate || '',
  averageDailyMilkLitres: animal.averageDailyMilkLitres ?? '',
  status: animal.status || 'ACTIVE',
})

const toNullableDate = (value) => (value ? value : null)
const toNullableNumber = (value) => (value === '' ? null : Number(value))

const Row = ({ label, value, children }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-earth-50 last:border-b-0">
    <span className="font-body text-sm text-earth-500">{label}</span>
    {children || <span className="font-body text-sm font-medium text-earth-800 text-right max-w-sm">{value || 'N/A'}</span>}
  </div>
)

export default function AnimalDetailPage() {
  const { id } = useParams()
  const { isAdmin, isVet, isOfficer } = useAuth()
  const canRecordVaccination = isAdmin() || isVet() || isOfficer()

  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [qrModal, setQrModal] = useState(false)
  const [qrData, setQrData] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [vaccinationOpen, setVaccinationOpen] = useState(false)
  const [vaccinationSaving, setVaccinationSaving] = useState(false)
  const [vaccinationForm, setVaccinationForm] = useState(emptyVaccinationForm)
  const [rfidOpen, setRfidOpen] = useState(false)
  const [rfidSaving, setRfidSaving] = useState(false)
  const [rfidForm, setRfidForm] = useState({ rfidTagNumber: '', tagType: 'EAR_TAG' })
  const [healthStatus, setHealthStatus] = useState('HEALTHY')

  const loadHistory = async (animalId) => {
    setHistoryLoading(true)
    try {
      const response = await rfidAPI.getAnimalHistory(animalId, 0, 5)
      setHistory(response.data?.data?.content || [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadAnimal = async () => {
    setLoading(true)
    try {
      const response = await animalAPI.getById(id)
      const nextAnimal = response.data?.data
      setAnimal(nextAnimal)
      setEditForm(buildEditForm(nextAnimal))
      setHealthStatus(nextAnimal.healthStatus || 'HEALTHY')
      setRfidForm({
        rfidTagNumber: nextAnimal.rfidTagNumber || '',
        tagType: nextAnimal.rfidTagType || 'EAR_TAG',
      })
      await loadHistory(id)
    } catch {
      toast.error('Failed to load animal details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnimal()
  }, [id])

  const updateEditField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setEditForm((current) => ({ ...current, [key]: value }))
  }

  const handleFetchQr = async () => {
    setQrModal(true)
    setQrLoading(true)
    try {
      const response = await animalAPI.getQrCode(id)
      setQrData(response.data?.data || null)
    } catch {
      toast.error('Failed to generate QR code')
      setQrData(null)
    } finally {
      setQrLoading(false)
    }
  }

  const handleHealthUpdate = async () => {
    try {
      await animalAPI.updateHealth(id, healthStatus)
      toast.success('Health status updated')
      setAnimal((current) => ({ ...current, healthStatus }))
    } catch {
      toast.error('Failed to update health status')
    }
  }

  const handleSaveEdit = async (event) => {
    event.preventDefault()
    if (!editForm) return

    setEditSaving(true)
    try {
      await animalAPI.update(id, {
        tagNumber: editForm.tagNumber,
        farmId: editForm.farmId,
        species: editForm.species,
        breed: editForm.breed,
        name: editForm.name || null,
        gender: editForm.gender,
        dateOfBirth: toNullableDate(editForm.dateOfBirth),
        colorMarkings: editForm.colorMarkings || null,
        purpose: editForm.purpose || null,
        bodyConditionScore: editForm.bodyConditionScore || null,
        notes: editForm.notes || null,
        sourceType: editForm.sourceType || null,
        acquisitionDate: toNullableDate(editForm.acquisitionDate),
        bodyWeightKg: toNullableNumber(editForm.bodyWeightKg),
        healthStatus: editForm.healthStatus,
        insurancePolicyNumber: editForm.insurancePolicyNumber || null,
        insuranceCompany: editForm.insuranceCompany || null,
        insuranceValidTill: toNullableDate(editForm.insuranceValidTill),
        isPregnant: editForm.gender === 'FEMALE' ? editForm.isPregnant : false,
        expectedDeliveryDate: editForm.gender === 'FEMALE' && editForm.isPregnant ? toNullableDate(editForm.expectedDeliveryDate) : null,
        lastCalvingDate: editForm.gender === 'FEMALE' ? toNullableDate(editForm.lastCalvingDate) : null,
        averageDailyMilkLitres: editForm.gender === 'FEMALE' ? toNullableNumber(editForm.averageDailyMilkLitres) : null,
      })

      if (editForm.status !== animal.status) {
        await animalAPI.updateStatus(id, editForm.status)
      }

      toast.success('Animal record updated')
      setEditOpen(false)
      await loadAnimal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update animal')
    } finally {
      setEditSaving(false)
    }
  }

  const handleVaccinationSubmit = async (event) => {
    event.preventDefault()
    setVaccinationSaving(true)
    try {
      await animalAPI.addVaccination(id, {
        vaccineName: vaccinationForm.vaccineName,
        disease: vaccinationForm.disease || null,
        vaccinationDate: vaccinationForm.vaccinationDate,
        nextDueDate: toNullableDate(vaccinationForm.nextDueDate),
        administeredBy: vaccinationForm.administeredBy || null,
        batchNumber: vaccinationForm.batchNumber || null,
      })
      toast.success('Vaccination recorded')
      setVaccinationOpen(false)
      setVaccinationForm(emptyVaccinationForm)
      await loadAnimal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record vaccination')
    } finally {
      setVaccinationSaving(false)
    }
  }

  const vaccineOptions = getVaccinesForSpecies(animal.species)
  const selectedVaccineProfile = vaccinationForm.vaccineKey
    ? buildVaccinationSuggestion(animal.species, vaccinationForm.vaccineKey, vaccinationForm.vaccinationDate)
    : null

  const handleVaccinationField = (key) => (event) => {
    const value = event.target.value
    setVaccinationForm((current) => {
      if (key === 'vaccineKey') {
        if (value === 'CUSTOM') {
          return {
            ...current,
            vaccineKey: value,
            vaccineName: '',
            disease: '',
            nextDueDate: '',
          }
        }

        const suggestion = buildVaccinationSuggestion(animal.species, value, current.vaccinationDate)
        return {
          ...current,
          vaccineKey: value,
          vaccineName: suggestion?.vaccineName || '',
          disease: suggestion?.disease || '',
          nextDueDate: suggestion?.nextDueDate || '',
        }
      }

      if (key === 'vaccinationDate') {
        const suggestion = current.vaccineKey && current.vaccineKey !== 'CUSTOM'
          ? buildVaccinationSuggestion(animal.species, current.vaccineKey, value)
          : null
        return {
          ...current,
          vaccinationDate: value,
          nextDueDate: suggestion?.nextDueDate ?? current.nextDueDate,
        }
      }

      return { ...current, [key]: value }
    })
  }

  const handleAssignRfid = async (event) => {
    event.preventDefault()
    setRfidSaving(true)
    try {
      await rfidAPI.assign(id, rfidForm)
      toast.success('RFID tag assigned')
      setRfidOpen(false)
      await loadAnimal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign RFID tag')
    } finally {
      setRfidSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage />
      </DashboardLayout>
    )
  }

  if (!animal) {
    return (
      <DashboardLayout>
        <p className="font-body text-earth-500">Animal not found.</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Link to="/animals" className="inline-flex items-center gap-1.5 text-sm text-earth-500 hover:text-mustard-600 font-body mb-4">
            <ArrowLeft size={15} /> Back to Animals
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-earth-900">{animal.name || animal.tagNumber}</h1>
              <p className="font-mono text-sm text-earth-400 mt-1">{animal.tagNumber}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`badge ${HEALTH_COLORS[animal.healthStatus] || 'badge-gray'}`}>{humanizeEnum(animal.healthStatus)}</span>
                <span className="badge badge-blue">{humanizeEnum(animal.species)}</span>
                <span className="badge badge-gray">{humanizeEnum(animal.status)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setEditOpen(true)} className="btn-secondary inline-flex items-center gap-2">
                <Edit3 size={15} /> Edit Record
              </button>
              <button type="button" onClick={handleFetchQr} className="btn-primary inline-flex items-center gap-2">
                <QrCode size={15} /> QR Code
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="card bg-mustard-50 border-mustard-200">
            <p className="font-body text-sm text-mustard-700">Farm</p>
            <p className="font-display text-xl font-semibold text-mustard-800 mt-2">{animal.farmName}</p>
          </div>
          <div className="card">
            <p className="font-body text-sm text-earth-500">Weight</p>
            <p className="font-display text-xl font-semibold text-earth-900 mt-2">{animal.bodyWeightKg ? `${animal.bodyWeightKg} kg` : 'N/A'}</p>
          </div>
          <div className="card">
            <p className="font-body text-sm text-earth-500">Milk Production</p>
            <p className="font-display text-xl font-semibold text-earth-900 mt-2">
              {animal.averageDailyMilkLitres ? `${animal.averageDailyMilkLitres} L/day` : 'N/A'}
            </p>
          </div>
          <div className="card">
            <p className="font-body text-sm text-earth-500">Last RFID Scan</p>
            <p className="font-display text-xl font-semibold text-earth-900 mt-2">{formatShortDate(animal.lastRfidScanTime)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-display text-xl font-semibold text-earth-900 mb-4">Identity and health</h2>
              <Row label="Species" value={humanizeEnum(animal.species)} />
              <Row label="Breed" value={animal.breed} />
              <Row label="Gender" value={humanizeEnum(animal.gender)} />
              <Row label="Date of Birth" value={formatShortDate(animal.dateOfBirth)} />
              <Row label="Color / Markings" value={animal.colorMarkings} />
              <Row label="Purpose" value={humanizeEnum(animal.purpose)} />
              <Row label="Body Condition" value={humanizeEnum(animal.bodyConditionScore)} />
              <Row label="Current Health">
                <div className="flex items-center gap-2">
                  <select className="input-field py-2 min-w-48" value={healthStatus} onChange={(event) => setHealthStatus(event.target.value)}>
                    {HEALTH_OPTIONS.map((status) => (
                      <option key={status} value={status}>{humanizeEnum(status)}</option>
                    ))}
                  </select>
                  <button type="button" className="btn-secondary" onClick={handleHealthUpdate}>Update</button>
                </div>
              </Row>
              <Row label="Notes" value={animal.notes} />
            </div>

            <div className="card">
              <h2 className="font-display text-xl font-semibold text-earth-900 mb-4">Breeding and production</h2>
              <Row label="Pregnant" value={animal.isPregnant ? 'Yes' : 'No'} />
              <Row label="Expected Delivery" value={formatShortDate(animal.expectedDeliveryDate)} />
              <Row label="Last Calving" value={formatShortDate(animal.lastCalvingDate)} />
              <Row label="Average Daily Milk" value={animal.averageDailyMilkLitres ? `${animal.averageDailyMilkLitres} litres` : 'N/A'} />
              <Row label="Insurance Policy" value={animal.insurancePolicyNumber} />
              <Row label="Insurance Company" value={animal.insuranceCompany} />
              <Row label="Insurance Valid Till" value={formatShortDate(animal.insuranceValidTill)} />
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-earth-900">Vaccination history</h2>
                {canRecordVaccination && (
                  <button type="button" onClick={() => setVaccinationOpen(true)} className="btn-secondary inline-flex items-center gap-2">
                    <Syringe size={15} /> Record Vaccination
                  </button>
                )}
              </div>

              {!animal.vaccinationHistory?.length ? (
                <p className="font-body text-sm text-earth-400">No vaccinations recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {animal.vaccinationHistory.map((record, index) => (
                    <div key={`${record.vaccineName}-${index}`} className="rounded-2xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-body text-sm font-semibold text-green-800">{record.vaccineName}</p>
                          <p className="font-body text-xs text-green-700 mt-1">{record.disease || 'Disease not specified'}</p>
                        </div>
                        <span className="badge badge-green">{formatShortDate(record.vaccinationDate)}</span>
                      </div>
                      <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs font-body text-green-700">
                        <span>Administered By: {record.administeredBy || 'N/A'}</span>
                        <span>Batch: {record.batchNumber || 'N/A'}</span>
                        <span>Next Due: {formatShortDate(record.nextDueDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-earth-900">RFID identity</h2>
                <button type="button" onClick={() => setRfidOpen(true)} className="btn-secondary inline-flex items-center gap-2">
                  <Tag size={15} /> {animal.rfidTagNumber ? 'Update RFID' : 'Assign RFID'}
                </button>
              </div>

              <Row label="RFID Tag" value={animal.rfidTagNumber} />
              <Row label="Tag Type" value={humanizeEnum(animal.rfidTagType)} />
              <Row label="Active" value={animal.rfidActive ? 'Yes' : 'No'} />
              <Row label="Tagged On" value={formatShortDate(animal.rfidTaggedDate)} />
              <Row label="Tagged By" value={animal.rfidTaggedBy} />
              <Row label="Last Scan Time" value={formatDateTime(animal.lastRfidScanTime)} />
              <Row label="Last Scan Location" value={animal.lastRfidScanLocation} />
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-earth-900">Recent scan history</h2>
                {historyLoading && <LoadingSpinner />}
              </div>

              {!history.length ? (
                <p className="font-body text-sm text-earth-400">No scan history available yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="rounded-2xl bg-earth-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-body text-sm font-semibold text-earth-800">{entry.scanLocation || 'Scan location not recorded'}</p>
                          <p className="font-body text-xs text-earth-500 mt-1">{humanizeEnum(entry.scanPurpose)}</p>
                        </div>
                        <span className="text-xs font-body text-earth-400">{formatDateTime(entry.scannedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-earth-900 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Shield size={18} className="text-mustard-300" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">Traceability Ready</p>
                  <p className="font-body text-sm text-white/70">This record is connected to farm, QR, vaccination, and scan history data.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm font-body">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-white/60">Created</p>
                  <p className="mt-2 font-semibold">{formatDateTime(animal.createdAt)}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-white/60">Updated</p>
                  <p className="mt-2 font-semibold">{formatDateTime(animal.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal open={qrModal} onClose={() => setQrModal(false)} title="Animal QR Code">
          {qrLoading ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : qrData ? (
            <div className="space-y-4 text-center">
              <div className="inline-flex rounded-2xl border border-earth-200 bg-white p-4">
                <img
                  src={`data:image/png;base64,${qrData.qrCodeBase64}`}
                  alt={`QR for ${qrData.tagNumber}`}
                  className="w-56 h-56"
                />
              </div>
              <p className="font-body text-sm text-earth-600">Scan to identify animal tag <span className="font-mono font-semibold">{qrData.tagNumber}</span></p>
              <a href={`data:image/png;base64,${qrData.qrCodeBase64}`} download={`${animal.tagNumber}-qr.png`} className="btn-primary inline-flex">
                Download QR
              </a>
            </div>
          ) : (
            <p className="font-body text-sm text-earth-500 text-center">QR code unavailable.</p>
          )}
        </Modal>

        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Animal Record" size="lg">
          {editForm && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Tag Number">
                  <input className="input-field font-mono" value={editForm.tagNumber} onChange={updateEditField('tagNumber')} required />
                </Field>
                <Field label="Breed">
                  <input className="input-field" value={editForm.breed} onChange={updateEditField('breed')} required />
                </Field>
                <Field label="Name">
                  <input className="input-field" value={editForm.name} onChange={updateEditField('name')} />
                </Field>
                <Field label="Health Status">
                  <select className="input-field" value={editForm.healthStatus} onChange={updateEditField('healthStatus')}>
                    {HEALTH_OPTIONS.map((status) => (
                      <option key={status} value={status}>{humanizeEnum(status)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Body Weight (kg)">
                  <input type="number" step="0.1" className="input-field" value={editForm.bodyWeightKg} onChange={updateEditField('bodyWeightKg')} />
                </Field>
                <Field label="Animal Status">
                  <select className="input-field" value={editForm.status} onChange={updateEditField('status')}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{humanizeEnum(status)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Purpose">
                  <input className="input-field" value={editForm.purpose} onChange={updateEditField('purpose')} />
                </Field>
                <Field label="Body Condition">
                  <input className="input-field" value={editForm.bodyConditionScore} onChange={updateEditField('bodyConditionScore')} />
                </Field>
                <Field label="Average Daily Milk">
                  <input type="number" step="0.1" className="input-field" value={editForm.averageDailyMilkLitres} onChange={updateEditField('averageDailyMilkLitres')} />
                </Field>
                <Field label="Color / Markings">
                  <input className="input-field" value={editForm.colorMarkings} onChange={updateEditField('colorMarkings')} />
                </Field>
                <Field label="Last Calving">
                  <input type="date" className="input-field" value={editForm.lastCalvingDate} onChange={updateEditField('lastCalvingDate')} />
                </Field>
                <Field label="Expected Delivery">
                  <input type="date" className="input-field" value={editForm.expectedDeliveryDate} onChange={updateEditField('expectedDeliveryDate')} />
                </Field>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.isPregnant} onChange={updateEditField('isPregnant')} className="w-4 h-4 accent-mustard-500" />
                <span className="font-body text-sm text-earth-700">Currently pregnant</span>
              </label>

              <Field label="Notes">
                <textarea className="input-field resize-none" rows={4} value={editForm.notes} onChange={updateEditField('notes')} />
              </Field>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={editSaving} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                  <Save size={15} /> {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </Modal>

        <Modal open={vaccinationOpen} onClose={() => setVaccinationOpen(false)} title="Record Vaccination">
          <form onSubmit={handleVaccinationSubmit} className="space-y-4">
            <Field label="Vaccine Preset">
              <select className="input-field" value={vaccinationForm.vaccineKey} onChange={handleVaccinationField('vaccineKey')}>
                <option value="">-- Select Vaccine --</option>
                {vaccineOptions.map((vaccine) => (
                  <option key={vaccine.key} value={vaccine.key}>{vaccine.name}</option>
                ))}
                <option value="CUSTOM">Custom vaccine</option>
              </select>
            </Field>
            <Field label="Vaccine Name">
              <input className="input-field" value={vaccinationForm.vaccineName} onChange={handleVaccinationField('vaccineName')} required />
            </Field>
            <Field label="Disease">
              <input className="input-field" value={vaccinationForm.disease} onChange={handleVaccinationField('disease')} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Vaccination Date">
                <input type="date" className="input-field" value={vaccinationForm.vaccinationDate} onChange={handleVaccinationField('vaccinationDate')} required />
              </Field>
              <Field label="Next Due Date">
                <input type="date" className="input-field" value={vaccinationForm.nextDueDate} onChange={handleVaccinationField('nextDueDate')} />
              </Field>
              <Field label="Administered By">
                <input className="input-field" value={vaccinationForm.administeredBy} onChange={handleVaccinationField('administeredBy')} />
              </Field>
              <Field label="Batch Number">
                <input className="input-field" value={vaccinationForm.batchNumber} onChange={handleVaccinationField('batchNumber')} />
              </Field>
            </div>
            {selectedVaccineProfile && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="font-body text-sm font-semibold text-blue-800">Automatic guidance applied</p>
                <p className="font-body text-xs text-blue-700 mt-1">
                  {getWithdrawalSummary(selectedVaccineProfile.milkWithdrawalDays, selectedVaccineProfile.meatWithdrawalDays)}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setVaccinationOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={vaccinationSaving} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                <Syringe size={15} /> {vaccinationSaving ? 'Saving...' : 'Record Vaccination'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal open={rfidOpen} onClose={() => setRfidOpen(false)} title="Assign RFID Tag" size="sm">
          <form onSubmit={handleAssignRfid} className="space-y-4">
            <Field label="RFID Tag Number">
              <input className="input-field" value={rfidForm.rfidTagNumber} onChange={(event) => setRfidForm((current) => ({ ...current, rfidTagNumber: event.target.value }))} required />
            </Field>
            <Field label="Tag Type">
              <select className="input-field" value={rfidForm.tagType} onChange={(event) => setRfidForm((current) => ({ ...current, tagType: event.target.value }))}>
                {RFID_TYPES.map((type) => (
                  <option key={type} value={type}>{humanizeEnum(type)}</option>
                ))}
              </select>
            </Field>
            <div className="flex gap-3">
              <button type="button" onClick={() => setRfidOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={rfidSaving} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                <Waves size={15} /> {rfidSaving ? 'Saving...' : 'Save RFID'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
