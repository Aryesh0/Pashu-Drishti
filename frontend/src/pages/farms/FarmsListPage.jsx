import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { farmAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import Pagination from '../../components/common/Pagination'
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner'
import { MapPin, Plus, Search, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FarmsListPage() {
  const { isAdmin, isFarmer } = useAuth()
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchFarms = async (p = 0, kw = '') => {
    setLoading(true)
    try {
      const res = kw
        ? await farmAPI.search(kw, p)
        : isFarmer()
          ? await farmAPI.getMyFarms(p)
          : await farmAPI.getAll(p)
      const data = res.data.data
      setFarms(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch {
      toast.error('Failed to load farms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFarms(page, search) }, [page, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  const handleToggleStatus = async (farm) => {
    const newStatus = farm.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      await farmAPI.updateStatus(farm.id, newStatus)
      toast.success(`Farm ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`)
      fetchFarms(page, search)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const farmTypeColor = (type) => {
    const map = { DAIRY: 'badge-blue', POULTRY: 'badge-yellow', CATTLE: 'badge-green', PIG: 'badge-gray', GOAT: 'badge-green', SHEEP: 'badge-gray', MIXED: 'badge-blue' }
    return map[type] || 'badge-gray'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-earth-900">
              {isFarmer() ? 'My Farms' : 'All Farms'}
            </h1>
            <p className="font-body text-sm text-earth-500 mt-1">Manage registered farms</p>
          </div>
          <Link to="/farms/new" className="btn-primary flex items-center gap-2 w-fit">
            <Plus size={16} /> Register Farm
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
            <input
              className="input-field pl-10"
              placeholder="Search by farm name or location..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
          {search && (
            <button type="button" className="btn-secondary px-4" onClick={() => { setSearch(''); setSearchInput(''); setPage(0) }}>
              Clear
            </button>
          )}
        </form>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <LoadingSpinner fullPage />
          ) : farms.length === 0 ? (
            <EmptyState
              icon={<MapPin size={28} />}
              title="No farms found"
              desc={isFarmer() ? "You haven't registered any farms yet" : "No farms match your search"}
              action={<Link to="/farms/new" className="btn-primary inline-flex items-center gap-2"><Plus size={15} /> Register Farm</Link>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50 border-b border-earth-100">
                  <tr>
                    {['Farm Name', 'Reg. No.', 'Type', 'Location', 'Animals', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 font-body uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {farms.map(farm => (
                    <tr key={farm.id} className="hover:bg-earth-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-body font-semibold text-sm text-earth-900">{farm.farmName}</p>
                        <p className="font-body text-xs text-earth-400">{farm.ownerName}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-earth-600">{farm.farmRegistrationNumber}</td>
                      <td className="px-4 py-3"><span className={farmTypeColor(farm.farmType)}>{farm.farmType}</span></td>
                      <td className="px-4 py-3">
                        <p className="font-body text-xs text-earth-600">{farm.districtName}</p>
                        <p className="font-body text-xs text-earth-400">{farm.stateName}</p>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-earth-700 font-semibold">{farm.totalAnimals ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={farm.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}>{farm.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/farms/${farm.id}`} className="p-1.5 rounded-lg hover:bg-mustard-50 text-mustard-600 transition-colors" title="View">
                            <Eye size={15} />
                          </Link>
                          {isAdmin() && (
                            <button onClick={() => handleToggleStatus(farm)}
                              className={`p-1.5 rounded-lg transition-colors ${farm.status === 'ACTIVE' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}
                              title={farm.status === 'ACTIVE' ? 'Suspend' : 'Activate'}>
                              {farm.status === 'ACTIVE' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            </button>
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
      </div>
    </DashboardLayout>
  )
}