import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Beef, Eye, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import Pagination from '../../components/common/Pagination'
import { EmptyState, LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { animalAPI, farmAPI } from '../../services/api'
import { humanizeEnum } from '../../utils/formatters'

const HEALTH_COLORS = {
  HEALTHY: 'badge-green',
  SICK: 'badge-red',
  UNDER_TREATMENT: 'badge-blue',
  RECOVERED: 'badge-green',
  QUARANTINED: 'badge-red',
}

const FARMER_FILTERS = ['ALL']
const PRIVILEGED_FILTERS = ['ALL', 'SICK', 'PREGNANT']

const formatAge = (ageInMonths) => {
  if (!ageInMonths && ageInMonths !== 0) return 'N/A'
  const years = Math.floor(ageInMonths / 12)
  const months = ageInMonths % 12
  if (!years) return `${months}m`
  if (!months) return `${years}y`
  return `${years}y ${months}m`
}

export default function AnimalsListPage() {
  const [searchParams] = useSearchParams()
  const farmIdParam = searchParams.get('farmId')
  const { isAdmin, isVet, isOfficer } = useAuth()
  const isPrivileged = isAdmin() || isVet() || isOfficer()

  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState('ALL')
  const [tagSearch, setTagSearch] = useState('')
  const [resolvedFarmId, setResolvedFarmId] = useState(farmIdParam || '')
  const [farmResolved, setFarmResolved] = useState(Boolean(farmIdParam) || isPrivileged)
  const [farmLabel, setFarmLabel] = useState('')

  useEffect(() => {
    if (farmIdParam) {
      setResolvedFarmId(farmIdParam)
      setFarmResolved(true)
      return
    }

    if (isPrivileged) {
      setResolvedFarmId('')
      setFarmResolved(true)
      return
    }

    const resolveFarm = async () => {
      try {
        const response = await farmAPI.getMyFarms(0, 1)
        const firstFarm = response.data?.data?.content?.[0]
        setResolvedFarmId(firstFarm?.id || '')
        setFarmLabel(firstFarm?.farmName || '')
      } catch {
        setResolvedFarmId('')
      } finally {
        setFarmResolved(true)
      }
    }

    resolveFarm()
  }, [farmIdParam, isPrivileged])

  useEffect(() => {
    if (!resolvedFarmId) return
    farmAPI.getById(resolvedFarmId)
      .then((response) => setFarmLabel(response.data?.data?.farmName || ''))
      .catch(() => {})
  }, [resolvedFarmId])

  const fetchAnimals = async (nextPage = 0) => {
    if (!farmResolved) return

    setLoading(true)
    try {
      let response

      if (filter === 'PREGNANT' && isPrivileged) {
        response = await animalAPI.getPregnant(nextPage)
      } else if (filter === 'SICK' && resolvedFarmId) {
        response = await animalAPI.getSickByFarm(resolvedFarmId, nextPage)
      } else if (filter === 'SICK' && isPrivileged) {
        response = await animalAPI.getSick(nextPage)
      } else if (resolvedFarmId) {
        response = await animalAPI.getByFarm(resolvedFarmId, nextPage)
      } else if (isPrivileged) {
        response = await animalAPI.getAll(nextPage)
      } else {
        setAnimals([])
        setTotalPages(0)
        return
      }

      const data = response.data?.data
      setAnimals(data?.content || [])
      setTotalPages(data?.totalPages || 0)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view this list')
      } else {
        toast.error(error.response?.data?.message || 'Failed to load animals')
      }
      setAnimals([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimals(page)
  }, [page, filter, resolvedFarmId, farmResolved])

  const handleTagSearch = async () => {
    if (!tagSearch.trim()) return

    setLoading(true)
    try {
      const response = await animalAPI.getByTag(tagSearch.trim().toUpperCase())
      const animal = response.data?.data
      setAnimals(animal ? [animal] : [])
      setTotalPages(animal ? 1 : 0)
    } catch {
      toast.error('No animal found with that tag')
      setAnimals([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setTagSearch('')
    setPage(0)
    fetchAnimals(0)
  }

  const availableFilters = isPrivileged ? PRIVILEGED_FILTERS : FARMER_FILTERS

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-earth-900">Animal Records</h1>
            <p className="font-body text-sm text-earth-500 mt-1">
              {resolvedFarmId && !isPrivileged
                ? `Tracking animals for ${farmLabel || 'your farm'}`
                : 'Search, review, and manage registered livestock records'}
            </p>
          </div>
          <Link
            to={`/animals/new${resolvedFarmId ? `?farmId=${resolvedFarmId}` : ''}`}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus size={16} /> Register Animal
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {availableFilters.map((item) => (
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
                {item === 'ALL' ? 'All Animals' : humanizeEnum(item)}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 lg:ml-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
              <input
                className="input-field pl-9 py-2 text-sm w-full sm:w-56"
                placeholder="Search by ICAR tag"
                value={tagSearch}
                onChange={(event) => setTagSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleTagSearch()
                }}
              />
            </div>
            <button type="button" onClick={handleTagSearch} className="btn-primary py-2 px-4 text-sm">Find</button>
            {tagSearch && (
              <button type="button" onClick={clearSearch} className="btn-secondary py-2 px-4 text-sm">Clear</button>
            )}
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          {!farmResolved || loading ? (
            <LoadingSpinner fullPage />
          ) : animals.length === 0 ? (
            <EmptyState
              icon={<Beef size={28} />}
              title="No animals found"
              desc={
                resolvedFarmId
                  ? 'Register the first animal for this farm or try a different filter.'
                  : 'Register a farm first, then add animals to begin tracking them.'
              }
              action={
                <Link to={`/animals/new${resolvedFarmId ? `?farmId=${resolvedFarmId}` : ''}`} className="btn-primary inline-flex items-center gap-2">
                  <Plus size={15} /> Register Animal
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50 border-b border-earth-100">
                  <tr>
                    {['Tag Number', 'Name', 'Species', 'Breed', 'Gender', 'Age', 'Health', 'Farm', 'Actions'].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 font-body uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {animals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-earth-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-earth-700 font-medium">{animal.tagNumber}</td>
                      <td className="px-4 py-3 font-body text-sm text-earth-900">{animal.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-blue">{humanizeEnum(animal.species)}</span>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{animal.breed || 'N/A'}</td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{humanizeEnum(animal.gender)}</td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{formatAge(animal.ageInMonths)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${HEALTH_COLORS[animal.healthStatus] || 'badge-gray'}`}>
                          {humanizeEnum(animal.healthStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{animal.farmName || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/animals/${animal.id}`}
                          className="p-1.5 rounded-lg hover:bg-mustard-50 text-mustard-600 inline-flex"
                          title="View details"
                        >
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </DashboardLayout>
  )
}
