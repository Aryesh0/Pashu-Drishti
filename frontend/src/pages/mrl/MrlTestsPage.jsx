import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ClipboardCheck, FlaskConical, Loader2, Plus, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { EmptyState, LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { animalAPI, farmAPI, mrlAPI } from '../../services/api'
import { formatShortDate, humanizeEnum } from '../../utils/formatters'
import { getMrlParameterOptions, getMrlParameterProfile } from '../../utils/livestockCatalog'

const PAGE_SIZE = 10
const SAMPLE_TYPES = ['MILK', 'MEAT', 'EGG', 'BLOOD', 'URINE', 'FEED', 'WATER', 'MANURE']
const STATUS_OPTIONS = ['SAMPLE_COLLECTED', 'LAB_RECEIVED', 'TESTING_IN_PROGRESS', 'COMPLETED', 'REPORT_DISPATCHED']

const createEmptyParameter = () => ({
  catalogKey: '',
  parameterName: '',
  category: 'Antibiotic',
  detectedValue: '',
  unit: 'ppb',
  mrlLimit: '',
  mrlStandard: 'FSSAI',
})

const emptyForm = {
  farmId: '',
  animalId: '',
  sampleType: 'MILK',
  sampleId: '',
  sampleCollectionDate: '',
  collectedBy: '',
  collectorDesignation: '',
  labName: '',
  labAccreditationNumber: '',
  labState: '',
  sampleReceivedDate: '',
  testCompletedDate: '',
  remarks: '',
  residueParameters: [createEmptyParameter()],
}

const getFarmId = (farm) => farm?.id || farm?.farmId || ''

const Field = ({ label, children, required = false, hint }) => (
  <div>
    <label className="label">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="font-body text-xs text-earth-400 mt-1">{hint}</p>}
  </div>
)

const paginateLocal = (items, page) => {
  const start = page * PAGE_SIZE
  return items.slice(start, start + PAGE_SIZE)
}

export default function MrlTestsPage() {
  const { isAdmin, isVet, isOfficer } = useAuth()
  const isPrivileged = isAdmin() || isVet() || isOfficer()
  const canCreate = isPrivileged
  const canUpdateStatus = isPrivileged
  const canRecordAction = isAdmin() || isOfficer()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState('ALL')
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [farms, setFarms] = useState([])
  const [animals, setAnimals] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusModal, setStatusModal] = useState({ open: false, record: null, status: 'SAMPLE_COLLECTED' })
  const [statusSaving, setStatusSaving] = useState(false)
  const [actionModal, setActionModal] = useState({ open: false, record: null, action: '', actionBy: '' })
  const [actionSaving, setActionSaving] = useState(false)

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const response = isPrivileged
          ? await farmAPI.getAll(0, 100)
          : await farmAPI.getMyFarms(0, 100)
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
      if (selectedFarmId) {
        const response = await mrlAPI.getByFarm(selectedFarmId, 0, 100)
        let items = response.data?.data?.content || []
        if (filter === 'FAILED') {
          items = items.filter((item) => item.overallResult === 'FAIL')
        }
        items.sort((left, right) => new Date(right.createdAt || right.sampleCollectionDate) - new Date(left.createdAt || left.sampleCollectionDate))
        setRecords(paginateLocal(items, nextPage))
        setTotalPages(items.length ? Math.ceil(items.length / PAGE_SIZE) : 0)
        return
      }

      if (!isPrivileged) {
        const farmIds = farms.map(getFarmId).filter(Boolean)
        const responses = await Promise.all(farmIds.map((farmId) => mrlAPI.getByFarm(farmId, 0, 100)))
        let items = responses.flatMap((response) => response.data?.data?.content || [])
        if (filter === 'FAILED') {
          items = items.filter((item) => item.overallResult === 'FAIL')
        }
        items.sort((left, right) => new Date(right.createdAt || right.sampleCollectionDate) - new Date(left.createdAt || left.sampleCollectionDate))
        setRecords(paginateLocal(items, nextPage))
        setTotalPages(items.length ? Math.ceil(items.length / PAGE_SIZE) : 0)
        return
      }

      const response = filter === 'FAILED'
        ? await mrlAPI.getFailed(nextPage, PAGE_SIZE)
        : await mrlAPI.getAll(nextPage, PAGE_SIZE)
      const data = response.data?.data
      setRecords(data?.content || [])
      setTotalPages(data?.totalPages || 0)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load MRL tests')
      setRecords([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords(page)
  }, [page, filter, selectedFarmId, farms.length, isPrivileged])

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const updateResidue = (index, key, value) => {
    setForm((current) => {
      const sampleType = current.sampleType
      return {
        ...current,
        residueParameters: current.residueParameters.map((parameter, parameterIndex) => {
          if (parameterIndex !== index) return parameter
          if (key === 'catalogKey') {
            const profile = getMrlParameterProfile(value)
            return profile
              ? {
                  ...parameter,
                  catalogKey: value,
                  parameterName: profile.parameterName,
                  category: profile.category,
                  unit: profile.unit,
                  mrlLimit: profile.mrlLimit,
                  mrlStandard: profile.mrlStandard,
                }
              : createEmptyParameter()
          }
          return { ...parameter, [key]: value, sampleType }
        }),
      }
    })
  }

  const addResidue = () => {
    setForm((current) => ({
      ...current,
      residueParameters: [...current.residueParameters, createEmptyParameter()],
    }))
  }

  const removeResidue = (index) => {
    setForm((current) => ({
      ...current,
      residueParameters: current.residueParameters.filter((_, parameterIndex) => parameterIndex !== index),
    }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await mrlAPI.create({
        farmId: form.farmId,
        animalId: form.animalId || null,
        sampleType: form.sampleType,
        sampleId: form.sampleId,
        sampleCollectionDate: form.sampleCollectionDate,
        collectedBy: form.collectedBy,
        collectorDesignation: form.collectorDesignation || null,
        labName: form.labName,
        labAccreditationNumber: form.labAccreditationNumber || null,
        labState: form.labState || null,
        sampleReceivedDate: form.sampleReceivedDate || null,
        testCompletedDate: form.testCompletedDate || null,
        remarks: form.remarks || null,
        residueParameters: form.residueParameters.map((parameter) => ({
          parameterName: parameter.parameterName,
          category: parameter.category || null,
          detectedValue: parameter.detectedValue === '' ? null : Number(parameter.detectedValue),
          unit: parameter.unit,
          mrlLimit: parameter.mrlLimit === '' ? null : Number(parameter.mrlLimit),
          mrlStandard: parameter.mrlStandard || null,
        })),
      })
      toast.success('MRL test created')
      setModalOpen(false)
      setForm(emptyForm)
      setPage(0)
      fetchRecords(0)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create MRL test')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusModal.record) return
    setStatusSaving(true)
    try {
      await mrlAPI.updateStatus(statusModal.record.id, statusModal.status)
      toast.success('MRL status updated')
      setStatusModal({ open: false, record: null, status: 'SAMPLE_COLLECTED' })
      fetchRecords(page)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setStatusSaving(false)
    }
  }

  const handleActionUpdate = async (event) => {
    event.preventDefault()
    if (!actionModal.record) return
    setActionSaving(true)
    try {
      await mrlAPI.updateAction(actionModal.record.id, {
        action: actionModal.action,
        actionBy: actionModal.actionBy,
      })
      toast.success('Corrective action recorded')
      setActionModal({ open: false, record: null, action: '', actionBy: '' })
      fetchRecords(page)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record action')
    } finally {
      setActionSaving(false)
    }
  }

  const cards = useMemo(() => ([
    {
      label: 'Visible Tests',
      value: records.length,
      icon: <FlaskConical size={18} />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Failed Results',
      value: records.filter((record) => record.overallResult === 'FAIL').length,
      icon: <ShieldAlert size={18} />,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Completed Status',
      value: records.filter((record) => record.status === 'COMPLETED').length,
      icon: <ClipboardCheck size={18} />,
      color: 'bg-green-50 text-green-600',
    },
  ]), [records])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-earth-900">MRL Testing</h1>
            <p className="font-body text-sm text-earth-500 mt-1">
              Track sample collection, residue parameters, failed limits, and corrective action in one place.
            </p>
          </div>
          {canCreate && (
            <button type="button" onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2 w-fit">
              <Plus size={16} /> New MRL Test
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}>{card.icon}</div>
              <div>
                <p className="font-display text-3xl font-bold text-earth-900">{card.value}</p>
                <p className="font-body text-sm text-earth-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'FAILED'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setFilter(item)
                  setPage(0)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-colors ${
                  filter === item
                    ? 'bg-mustard-500 text-white'
                    : 'bg-white border border-earth-200 text-earth-600 hover:border-mustard-300'
                }`}
              >
                {item === 'ALL' ? 'All Tests' : 'Failed Tests'}
              </button>
            ))}
          </div>

          <div className="lg:ml-auto flex flex-col sm:flex-row gap-2">
            <select
              className="input-field py-2 min-w-56"
              value={selectedFarmId}
              onChange={(event) => {
                setSelectedFarmId(event.target.value)
                setPage(0)
              }}
            >
              <option value="">All accessible farms</option>
              {farms.map((farm) => (
                <option key={getFarmId(farm)} value={getFarmId(farm)}>
                  {farm.farmName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? (
            <LoadingSpinner fullPage />
          ) : records.length === 0 ? (
            <EmptyState
              icon={<FlaskConical size={28} />}
              title="No MRL records found"
              desc="Create the first test result to start tracking residue compliance."
              action={canCreate ? <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">New MRL Test</button> : null}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50 border-b border-earth-100">
                  <tr>
                    {['Reference', 'Farm', 'Sample', 'Residues', 'Result', 'Status', 'Dates', 'Actions'].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 font-body uppercase tracking-wider whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-earth-50">
                      <td className="px-4 py-3">
                        <p className="font-body text-sm font-semibold text-earth-900">{record.testReferenceNumber}</p>
                        <p className="font-body text-xs text-earth-400 mt-1">{record.sampleId}</p>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-earth-700">{record.farmName}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-blue">{humanizeEnum(record.sampleType)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {(record.residueParameters || []).slice(0, 2).map((parameter) => (
                            <p key={`${record.id}-${parameter.parameterName}`} className="font-body text-xs text-earth-600">
                              {parameter.parameterName}: {parameter.detectedValue ?? 'N/A'} {parameter.unit}
                            </p>
                          ))}
                          {(record.residueParameters || []).length > 2 && (
                            <p className="font-body text-xs text-earth-400">+{record.residueParameters.length - 2} more parameters</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={record.overallResult === 'FAIL' ? 'badge-red' : 'badge-green'}>
                          {humanizeEnum(record.overallResult)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-gray">{humanizeEnum(record.status)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-body text-xs text-earth-600">Collected: {formatShortDate(record.sampleCollectionDate)}</p>
                        <p className="font-body text-xs text-earth-400 mt-1">Completed: {formatShortDate(record.testCompletedDate)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {canUpdateStatus && (
                            <button
                              type="button"
                              className="text-left text-xs font-body text-mustard-700 hover:underline"
                              onClick={() => setStatusModal({ open: true, record, status: record.status || 'SAMPLE_COLLECTED' })}
                            >
                              Update status
                            </button>
                          )}
                          {canRecordAction && record.overallResult === 'FAIL' && (
                            <button
                              type="button"
                              className="text-left text-xs font-body text-red-600 hover:underline"
                              onClick={() => setActionModal({
                                open: true,
                                record,
                                action: record.actionTaken || '',
                                actionBy: record.actionTakenBy || '',
                              })}
                            >
                              Record action
                            </button>
                          )}
                          {record.actionTaken && (
                            <p className="font-body text-xs text-earth-500">Action: {record.actionTaken}</p>
                          )}
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

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create MRL Test Record" size="xl">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Farm" required>
                <select className="input-field" value={form.farmId} onChange={updateField('farmId')} required>
                  <option value="">-- Select Farm --</option>
                  {farms.map((farm) => (
                    <option key={getFarmId(farm)} value={getFarmId(farm)}>{farm.farmName}</option>
                  ))}
                </select>
              </Field>

              <Field label="Animal" hint="Optional for herd or bulk samples">
                <select className="input-field" value={form.animalId} onChange={updateField('animalId')}>
                  <option value="">Bulk / herd sample</option>
                  {animals.map((animal) => (
                    <option key={animal.id} value={animal.id}>{animal.name || animal.tagNumber}</option>
                  ))}
                </select>
              </Field>

              <Field label="Sample Type" required>
                <select
                  className="input-field"
                  value={form.sampleType}
                  onChange={(event) => {
                    const sampleType = event.target.value
                    setForm((current) => ({
                      ...current,
                      sampleType,
                      residueParameters: current.residueParameters.map((parameter) => {
                        const profile = parameter.catalogKey ? getMrlParameterProfile(parameter.catalogKey) : null
                        if (!profile || profile.sampleTypes.includes(sampleType)) return parameter
                        return createEmptyParameter()
                      }),
                    }))
                  }}
                >
                  {SAMPLE_TYPES.map((type) => (
                    <option key={type} value={type}>{humanizeEnum(type)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Sample ID" required>
                <input className="input-field" value={form.sampleId} onChange={updateField('sampleId')} required />
              </Field>

              <Field label="Sample Collection Date" required>
                <input type="date" className="input-field" value={form.sampleCollectionDate} onChange={updateField('sampleCollectionDate')} required />
              </Field>

              <Field label="Collected By" required>
                <input className="input-field" value={form.collectedBy} onChange={updateField('collectedBy')} required />
              </Field>

              <Field label="Collector Designation">
                <input className="input-field" value={form.collectorDesignation} onChange={updateField('collectorDesignation')} />
              </Field>

              <Field label="Lab Name" required>
                <input className="input-field" value={form.labName} onChange={updateField('labName')} required />
              </Field>

              <Field label="Lab Accreditation Number">
                <input className="input-field" value={form.labAccreditationNumber} onChange={updateField('labAccreditationNumber')} />
              </Field>

              <Field label="Lab State">
                <input className="input-field" value={form.labState} onChange={updateField('labState')} />
              </Field>

              <Field label="Sample Received Date">
                <input type="date" className="input-field" value={form.sampleReceivedDate} onChange={updateField('sampleReceivedDate')} />
              </Field>

              <Field label="Test Completed Date">
                <input type="date" className="input-field" value={form.testCompletedDate} onChange={updateField('testCompletedDate')} />
              </Field>
            </div>

            <div className="space-y-4 rounded-2xl border border-earth-200 bg-earth-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-earth-900">Residue Parameters</h3>
                  <p className="font-body text-xs text-earth-500 mt-1">Add one or more tested parameters with measured values and limits.</p>
                </div>
                <button type="button" onClick={addResidue} className="btn-secondary text-sm">Add Parameter</button>
              </div>

              <div className="space-y-4">
                {form.residueParameters.map((parameter, index) => (
                  <div key={`parameter-${index}`} className="rounded-2xl bg-white p-4 border border-earth-200">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Field label="Preset">
                        <select className="input-field" value={parameter.catalogKey} onChange={(event) => updateResidue(index, 'catalogKey', event.target.value)}>
                          <option value="">Custom parameter</option>
                          {getMrlParameterOptions(form.sampleType).map((item) => (
                            <option key={item.key} value={item.key}>{item.parameterName} ({item.mrlStandard})</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Parameter Name" required>
                        <input className="input-field" value={parameter.parameterName} onChange={(event) => updateResidue(index, 'parameterName', event.target.value)} required />
                      </Field>
                      <Field label="Category">
                        <input className="input-field" value={parameter.category} onChange={(event) => updateResidue(index, 'category', event.target.value)} />
                      </Field>
                      <Field label="Detected Value">
                        <input type="number" step="0.01" className="input-field" value={parameter.detectedValue} onChange={(event) => updateResidue(index, 'detectedValue', event.target.value)} />
                      </Field>
                      <Field label="Unit" required>
                        <input className="input-field" value={parameter.unit} onChange={(event) => updateResidue(index, 'unit', event.target.value)} required />
                      </Field>
                      <Field label="MRL Limit">
                        <input type="number" step="0.01" className="input-field" value={parameter.mrlLimit} onChange={(event) => updateResidue(index, 'mrlLimit', event.target.value)} />
                      </Field>
                      <Field label="MRL Standard">
                        <input className="input-field" value={parameter.mrlStandard} onChange={(event) => updateResidue(index, 'mrlStandard', event.target.value)} />
                      </Field>
                    </div>
                    {form.residueParameters.length > 1 && (
                      <button type="button" onClick={() => removeResidue(index)} className="mt-3 text-xs font-body text-red-600 hover:underline">
                        Remove parameter
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Field label="Remarks">
              <textarea className="input-field resize-none" rows={3} value={form.remarks} onChange={updateField('remarks')} />
            </Field>

            <div className="flex gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <FlaskConical size={15} />}
                {submitting ? 'Saving...' : 'Create Test'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal open={statusModal.open} onClose={() => setStatusModal({ open: false, record: null, status: 'SAMPLE_COLLECTED' })} title="Update Test Status" size="sm">
          <div className="space-y-4">
            <Field label="Status">
              <select
                className="input-field"
                value={statusModal.status}
                onChange={(event) => setStatusModal((current) => ({ ...current, status: event.target.value }))}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{humanizeEnum(status)}</option>
                ))}
              </select>
            </Field>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStatusModal({ open: false, record: null, status: 'SAMPLE_COLLECTED' })} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={handleStatusUpdate} disabled={statusSaving} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                {statusSaving ? <Loader2 size={15} className="animate-spin" /> : null}
                Save Status
              </button>
            </div>
          </div>
        </Modal>

        <Modal open={actionModal.open} onClose={() => setActionModal({ open: false, record: null, action: '', actionBy: '' })} title="Record Corrective Action">
          <form onSubmit={handleActionUpdate} className="space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-body text-sm font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle size={15} /> This action will be attached to a failed MRL result.
              </p>
            </div>
            <Field label="Action Taken" required>
              <textarea
                className="input-field resize-none"
                rows={4}
                value={actionModal.action}
                onChange={(event) => setActionModal((current) => ({ ...current, action: event.target.value }))}
                required
              />
            </Field>
            <Field label="Action Taken By" required>
              <input
                className="input-field"
                value={actionModal.actionBy}
                onChange={(event) => setActionModal((current) => ({ ...current, actionBy: event.target.value }))}
                required
              />
            </Field>
            <div className="flex gap-3">
              <button type="button" onClick={() => setActionModal({ open: false, record: null, action: '', actionBy: '' })} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={actionSaving} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                {actionSaving ? <Loader2 size={15} className="animate-spin" /> : null}
                Save Action
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
