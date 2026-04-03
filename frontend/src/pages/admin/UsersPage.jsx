import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import Pagination from '../../components/common/Pagination'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { Users, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchUsers = async (p = 0) => {
    setLoading(true)
    try {
      const res = await adminAPI.getUsers(p)
      const data = res.data.data
      setUsers(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers(page) }, [page])

  const handleToggle = async (userId, currentActive) => {
    try {
      await adminAPI.toggleUser(userId)
      toast.success(currentActive ? 'User deactivated' : 'User activated')
      fetchUsers(page)
    } catch { toast.error('Failed to update user') }
  }

  const roleColor = role => {
    if (role.includes('SUPER_ADMIN')) return 'badge-red'
    if (role.includes('ADMIN')) return 'badge-yellow'
    if (role.includes('VET')) return 'badge-blue'
    if (role.includes('OFFICER')) return 'badge-green'
    return 'badge-gray'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">User Management</h1>
          <p className="font-body text-sm text-earth-500 mt-1">Manage all registered users</p>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? <LoadingSpinner fullPage /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50 border-b border-earth-100">
                  <tr>
                    {['Name', 'Username', 'Email', 'Mobile', 'Role', 'State', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 font-body uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-earth-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-mustard-500 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-semibold">{u.fullName?.charAt(0)}</span>
                          </div>
                          <span className="font-body text-sm font-medium text-earth-900">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-earth-600">{u.username}</td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{u.email}</td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{u.mobileNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {u.roles?.map(r => (
                            <span key={r} className={`badge text-xs ${roleColor(r)}`}>{r.replace('ROLE_', '')}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-earth-600">{u.stateCode || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={u.active ? 'badge-green' : 'badge-red'}>{u.active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-earth-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(u.id, u.active)}
                          className={`p-1.5 rounded-lg transition-colors ${u.active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}
                          title={u.active ? 'Deactivate' : 'Activate'}>
                          {u.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
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