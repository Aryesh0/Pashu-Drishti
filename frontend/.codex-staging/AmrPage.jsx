import { useEffect, useMemo, useState } from 'react'
import { Loader2, Pill, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { EmptyState, LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { amrAPI, animalAPI, farmAPI } from '../../services/api'
import { formatShortDate, humanizeEnum } from '../../utils/formatters'

const PAGE_SIZE = 10
const DRUG_CLASSES = ['AMINOGLYCOSIDES', 'BETA_LACTAMS', 'CEPHALOSPORINS', 'FLUOROQUINOLONES', 'MACROLIDES', 'TETRACYCLINES', 'SULFONAMIDES', 'POLYMYXINS', 'OTHERS']
const OUTCOMES = ['RECOVERED', 'IMPROVED', 'NO_CHANGE', 'DETERIORATED', 'DIED', 'ONGOING']

const blankDrug = () => ({
  drugName: '',
  activeIngredient: '',
  drugClass: 'BETA_LACTAMS',
  dosage: '',
  routeOfAdministration: 'INJECTABLE',
  durationDays: '',
  milkWithdrawalDays: '',
  meatWithdrawalDays: '',
  criticallyImportantAntibiotic: false,
})

const blankForm = {
  farmId: '',
  animalIds: [],
  treatmentDescription: '',
  numberOfAnimalsAffected: '',
  diagnosis: '',
  prescribingVetId: '',
  prescribingVetName: '',
  vetRegistrationNumber: '',
  vetContactNumber: '',
  prescriptionDate: '',
  treatmentStartDate: '',
  treatmentEndDate: '',
  milkWithdrawalEndDate: '',
  meatWithdrawalEndDate: '',
  isEmergencyTreatment: false,
  emergencyJustification: '',
  drugsUsed: [blankDrug()],
}

const Field = ({ label, children, required = false }) => (
  <div>
    <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    {children}
  </div>
)

const getFarmId = (farm) => farm?.id || farm?.farmId || ''
const toNumber = (value) => (value === '' ? null : Number(value))
const toDate = (value) => (value ? value : null)
const slicePage = (items, page) => items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

export default function AmrPage() {
  const { isAdmin, isVet, isOfficer } = useAuth()
  const isPrivileged = isAdmin() || isVet() || isOfficer()
  const canCreate = isPrivileged
  const canComplete = isAdmin() || isVet()

  const [records, setRecords] = useState([])
  const [farms, setFarms] = useState([])
  const [animals, setAnimals] = useState([])
  const [form, setForm] = useState(blankForm)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState('ALL')
  const [farmFilter, setFarmFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [outcomeModal, setOutcomeModal] = useState({ open: false, record: null, outcome: 'ONGOING', notes: '' })
  const [outcomeSaving, setOutcomeSaving] = useState(false)
  const [withdrawalSavingId, setWithdrawalSavingId] = useState('')

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const response = isPrivileged ? await farmAPI.getAll(0, 100) : await farmAPI.getMyFarms(0, 100)
        setFarms(response.data?.data?.content || [])
      } catch {
        toast.error('Failed to load farms')
      }
    }
    loadFarms()
  }, [isPrivileged])

  useEffect(() => {
    if (!form.farmId) {
      setAnimals([])
      return
    }
    animalAPI.getByFarm(form.farmId, 0, 100)
      .then((response) => setAnimals(response.data?.data?.content || []))
      .catch(() => setAnimals([]))
  }, [form.farmId])

  const fetchRecords = async (nextPage = 0) => {
    setLoading(true)
    try {
      if (farmFilter || !isPrivileged) {
        const farmIds = farmFilter ? [farmFilter] : farms.map(getFarmId).filter(Boolean)
        const responses = await Promise.all(farmIds.map((farmId) => amrAPI.getByFarm(farmId, 0, 100)))
        let items = responses.flatMap((response) => response.data?.data?.content || [])
        if (filter === 'CRITICAL') items = items.filter((item) => item.drugsUsed?.some((drug) => drug.criticallyImportantAntibiotic))
        if (filter === 'WITHDRAWALS') items = items.filter((item) => !item.withdrawalPeriodComplete)
        items.sort((left, right) => new Date(right.createdAt || right.treatmentStartDate) - new Date(left.createdAt || left.treatmentStartDate))
        setRecords(slicePage(items, nextPage))
        setTotalPages(Math.max(1, Math.ceil(items.length / PAGE_SIZE)))
      } else {
        const response = filter === 'CRITICAL'
          ? await amrAPI.getCritical(nextPage, PAGE_SIZE)
          : filter === 'WITHDRAWALS'
            ? await amrAPI.getActiveWithdrawals(nextPage, PAGE_SIZE)
            : await amrAPI.getAll(nextPage, PAGE_SIZE)
        const data = response.data?.data
        setRecords(data?.content || [])
        setTotalPages(data?.totalPages || 0)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load AMR records')
      setRecords([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords(page)
  }, [page, filter, farmFilter, farms.length, isPrivileged])

  const updateField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateDrug = (index, key, value) => {
    setForm((current) => ({
      ...current,
      drugsUsed: current.drugsUsed.map((drug, i) => (i === index ? { ...drug, [key]: value } : drug)),
    }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await amrAPI.create({
        farmId: form.farmId,
        animalIds: form.animalIds.length ? form.animalIds : null,
        treatmentDescription: form.treatmentDescription,
        numberOfAnimalsAffected: Number(form.numberOfAnimalsAffected),
        diagnosis: form.diagnosis,
        prescribingVetId: form.prescribingVetId,
        prescribingVetName: form.prescribingVetName,
        vetRegistrationNumber: form.vetRegistrationNumber,
        vetContactNumber: form.vetContactNumber || null,
        prescriptionDate: form.prescriptionDate,
        treatmentStartDate: form.treatmentStartDate,
        treatmentEndDate: toDate(form.treatmentEndDate),
        milkWithdrawalEndDate: toDate(form.milkWithdrawalEndDate),
        meatWithdrawalEndDate: toDate(form.meatWithdrawalEndDate),
        isEmergencyTreatment: form.isEmergencyTreatment,
        emergencyJustification: form.isEmergencyTreatment ? form.emergencyJustification || null : null,
        drugsUsed: form.drugsUsed.map((drug) => ({
          drugName: drug.drugName,
          activeIngredient: drug.activeIngredient,
          drugClass: drug.drugClass,
          dosage: drug.dosage,
          routeOfAdministration: drug.routeOfAdministration,
          durationDays: toNumber(drug.durationDays),
          milkWithdrawalDays: toNumber(drug.milkWithdrawalDays),
          meatWithdrawalDays: toNumber(drug.meatWithdrawalDays),
          criticallyImportantAntibiotic: drug.criticallyImportantAntibiotic,
        })),
      })
      toast.success('AMR record saved')
      setModalOpen(false)
      setForm(blankForm)
      setPage(0)
      fetchRecords(0)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save AMR record')
    } finally {
      setSaving(false)
    }
  }

  const handleOutcome = async (event) => {
    event.preventDefault()
    setOutcomeSaving(true)
    try {
      await amrAPI.updateOutcome(outcomeModal.record.id, { outcome: outcomeModal.outcome, notes: outcomeModal.notes })
      toast.success('Outcome updated')
      setOutcomeModal({ open: false, record: null, outcome: 'ONGOING', notes: '' })
      fetchRecords(page)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update outcome')
    } finally {
      setOutcomeSaving(false)
    }
  }

  const markWithdrawalComplete = async (recordId) => {
    setWithdrawalSavingId(recordId)
    try {
      await amrAPI.markWithdrawalComplete(recordId)
      toast.success('Withdrawal marked complete')
      fetchRecords(page)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update withdrawal')
    } finally {
      setWithdrawalSavingId('')
    }
  }

  const summary = useMemo(() => ({
    visible: records.length,
    critical: records.filter((record) => record.drugsUsed?.some((drug) => drug.criticallyImportantAntibiotic)).length,
    withdrawals: records.filter((record) => !record.withdrawalPeriodComplete).length,
  }), [records])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-earth-900">AMR Tracking</h1>
            <p className="font-body text-sm text-earth-500 mt-1">Track antimicrobial usage, outcomes, and withdrawal periods.</p>
          </div>
          {canCreate && <button type="button" onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Record Usage</button>}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Visible Records', value: summary.visible },
            { label: 'Critical Antibiotics', value: summary.critical },
            { label: 'Active Withdrawals', value: summary.withdrawals },
          ].map((item) => (
            <div key={item.label} className="stat-card">
              <div className="w-11 h-11 rounded-2xl bg-mustard-50 text-mustard-700 flex items-center justify-center"><Pill size={18} /></div>
              <div>
                <p className="font-display text-3xl font-bold text-earth-900">{item.value}</p>
                <p className="font-body text-sm text-earth-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ALL', label: 'All Records' },
              { key: 'CRITICAL', label: 'Critical' },
              { key: 'WITHDRAWALS', label: 'Active Withdrawals' },
            ].map((item) => (
              <button key={item.key} type="button" onClick={() => { setFilter(item.key); setPage(0) }} className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold ${filter === item.key ? 'bg-mustard-500 text-white' : 'bg-white border border-earth-200 text-earth-600'}`}>
                {item.label}
              </button>
            ))}
          </div>
          <select className="input-field py-2 lg:ml-auto min-w-56" value={farmFilter} onChange={(event) => { setFarmFilter(event.target.value); setPage(0) }}>
            <option value="">All accessible farms</option>
            {farms.map((farm) => <option key={getFarmId(farm)} value={getFarmId(farm)}>{farm.farmName}</option>)}
          </select>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? <LoadingSpinner fullPage /> : records.length === 0 ? (
            <EmptyState icon={<Pill size={28} />} title="No AMR records found" action={canCreate ? <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">Record Usage</button> : null} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50 border-b border-earth-100">
                  <tr>{['Reference', 'Farm', 'Diagnosis', 'Drugs', 'Outcome', 'Withdrawal', 'Actions'].map((header) => <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 font-body uppercase tracking-wider">{header}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-earth-50">
                      <td className="px-4 py-3"><p className="font-body text-sm font-semibold text-earth-900">{record.usageReferenceNumber}</p><p className="font-body text-xs text-earth-400 mt-1">{formatShortDate(record.treatmentStartDate)}</p></td>
                      <td className="px-4 py-3 font-body text-sm text-earth-700">{record.farmName}</td>
                      <td className="px-4 py-3"><p className="font-body text-sm text-earth-800">{record.diagnosis}</p><p className="font-body text-xs text-earth-400 mt-1">{record.prescribingVetName}</p></td>
                      <td className="px-4 py-3">{(record.drugsUsed || []).map((drug) => <p key={`${record.id}-${drug.drugName}`} className="font-body text-xs text-earth-600">{drug.drugName}{drug.criticallyImportantAntibiotic && ' (Critical)'}</p>)}</td>
                      <td className="px-4 py-3"><span className="badge badge-gray">{humanizeEnum(record.outcome)}</span></td>
                      <td className="px-4 py-3"><p className="font-body text-xs text-earth-600">Milk: {formatShortDate(record.milkWithdrawalEndDate)}</p><p className="font-body text-xs text-earth-400 mt-1">Meat: {formatShortDate(record.meatWithdrawalEndDate)}</p></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {isPrivileged && <button type="button" className="text-left text-xs text-mustard-700 hover:underline" onClick={() => setOutcomeModal({ open: true, record, outcome: record.outcome || 'ONGOING', notes: record.outcomeNotes || '' })}>Update outcome</button>}
                          {canComplete && !record.withdrawalPeriodComplete && <button type="button" className="text-left text-xs text-green-700 hover:underline" disabled={withdrawalSavingId === record.id} onClick={() => markWithdrawalComplete(record.id)}>{withdrawalSavingId === record.id ? 'Saving...' : 'Mark withdrawal complete'}</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Antimicrobial Usage" size="xl">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Farm" required><select className="input-field" value={form.farmId} onChange={updateField('farmId')} required><option value="">-- Select Farm --</option>{farms.map((farm) => <option key={getFarmId(farm)} value={getFarmId(farm)}>{farm.farmName}</option>)}</select></Field>
              <Field label="Animals Affected" required><input type="number" min="1" className="input-field" value={form.numberOfAnimalsAffected} onChange={updateField('numberOfAnimalsAffected')} required /></Field>
              <Field label="Diagnosis" required><input className="input-field" value={form.diagnosis} onChange={updateField('diagnosis')} required /></Field>
              <Field label="Treatment Description" required><input className="input-field" value={form.treatmentDescription} onChange={updateField('treatmentDescription')} required /></Field>
              <Field label="Prescribing Vet ID" required><input className="input-field" value={form.prescribingVetId} onChange={updateField('prescribingVetId')} required /></Field>
              <Field label="Prescribing Vet Name" required><input className="input-field" value={form.prescribingVetName} onChange={updateField('prescribingVetName')} required /></Field>
              <Field label="Vet Registration Number" required><input className="input-field" value={form.vetRegistrationNumber} onChange={updateField('vetRegistrationNumber')} required /></Field>
              <Field label="Prescription Date" required><input type="date" className="input-field" value={form.prescriptionDate} onChange={updateField('prescriptionDate')} required /></Field>
              <Field label="Treatment Start Date" required><input type="date" className="input-field" value={form.treatmentStartDate} onChange={updateField('treatmentStartDate')} required /></Field>
              <Field label="Treatment End Date"><input type="date" className="input-field" value={form.treatmentEndDate} onChange={updateField('treatmentEndDate')} /></Field>
              <Field label="Milk Withdrawal End"><input type="date" className="input-field" value={form.milkWithdrawalEndDate} onChange={updateField('milkWithdrawalEndDate')} /></Field>
              <Field label="Meat Withdrawal End"><input type="date" className="input-field" value={form.meatWithdrawalEndDate} onChange={updateField('meatWithdrawalEndDate')} /></Field>
            </div>

            {animals.length > 0 && (
              <div className="rounded-2xl bg-earth-50 p-4">
                <p className="font-display text-lg font-semibold text-earth-900">Specific Animals</p>
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {animals.map((animal) => (
                    <label key={animal.id} className="flex items-center gap-3 rounded-xl border border-earth-200 bg-white px-4 py-3">
                      <input type="checkbox" checked={form.animalIds.includes(animal.id)} onChange={() => setForm((current) => ({ ...current, animalIds: current.animalIds.includes(animal.id) ? current.animalIds.filter((value) => value !== animal.id) : [...current.animalIds, animal.id] }))} className="w-4 h-4 accent-mustard-500" />
                      <span className="font-body text-sm text-earth-700">{animal.name || animal.tagNumber}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {form.drugsUsed.map((drug, index) => (
              <div key={`drug-${index}`} className="rounded-2xl border border-earth-200 p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Drug Name" required><input className="input-field" value={drug.drugName} onChange={(event) => updateDrug(index, 'drugName', event.target.value)} required /></Field>
                  <Field label="Active Ingredient" required><input className="input-field" value={drug.activeIngredient} onChange={(event) => updateDrug(index, 'activeIngredient', event.target.value)} required /></Field>
                  <Field label="Drug Class"><select className="input-field" value={drug.drugClass} onChange={(event) => updateDrug(index, 'drugClass', event.target.value)}>{DRUG_CLASSES.map((item) => <option key={item} value={item}>{humanizeEnum(item)}</option>)}</select></Field>
                  <Field label="Dosage" required><input className="input-field" value={drug.dosage} onChange={(event) => updateDrug(index, 'dosage', event.target.value)} required /></Field>
                  <Field label="Route"><input className="input-field" value={drug.routeOfAdministration} onChange={(event) => updateDrug(index, 'routeOfAdministration', event.target.value)} /></Field>
                  <Field label="Duration Days"><input type="number" min="1" className="input-field" value={drug.durationDays} onChange={(event) => updateDrug(index, 'durationDays', event.target.value)} /></Field>
                  <Field label="Milk WD Days"><input type="number" min="0" className="input-field" value={drug.milkWithdrawalDays} onChange={(event) => updateDrug(index, 'milkWithdrawalDays', event.target.value)} /></Field>
                  <Field label="Meat WD Days"><input type="number" min="0" className="input-field" value={drug.meatWithdrawalDays} onChange={(event) => updateDrug(index, 'meatWithdrawalDays', event.target.value)} /></Field>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input type="checkbox" checked={drug.criticallyImportantAntibiotic} onChange={(event) => updateDrug(index, 'criticallyImportantAntibiotic', event.target.checked)} className="w-4 h-4 accent-mustard-500" />
                  <span className="font-body text-sm text-earth-700">WHO critically important antibiotic</span>
                </label>
              </div>
            ))}

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isEmergencyTreatment} onChange={updateField('isEmergencyTreatment')} className="w-4 h-4 accent-mustard-500" />
                <span className="font-body text-sm text-amber-800">Emergency treatment</span>
              </label>
              {form.isEmergencyTreatment && <textarea className="input-field resize-none mt-3" rows={3} value={form.emergencyJustification} onChange={updateField('emergencyJustification')} placeholder="Why emergency treatment was necessary" />}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">{saving ? <Loader2 size={15} className="animate-spin" /> : <Pill size={15} />}{saving ? 'Saving...' : 'Save Record'}</button>
            </div>
          </form>
        </Modal>

        <Modal open={outcomeModal.open} onClose={() => setOutcomeModal({ open: false, record: null, outcome: 'ONGOING', notes: '' })} title="Update Outcome">
          <form onSubmit={handleOutcome} className="space-y-4">
            <Field label="Outcome"><select className="input-field" value={outcomeModal.outcome} onChange={(event) => setOutcomeModal((current) => ({ ...current, outcome: event.target.value }))}>{OUTCOMES.map((item) => <option key={item} value={item}>{humanizeEnum(item)}</option>)}</select></Field>
            <Field label="Notes"><textarea className="input-field resize-none" rows={4} value={outcomeModal.notes} onChange={(event) => setOutcomeModal((current) => ({ ...current, notes: event.target.value }))} /></Field>
            <div className="flex gap-3"><button type="button" onClick={() => setOutcomeModal({ open: false, record: null, outcome: 'ONGOING', notes: '' })} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={outcomeSaving} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">{outcomeSaving ? <Loader2 size={15} className="animate-spin" /> : null}Save Outcome</button></div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
