import { useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import Pagination from '../../components/common/Pagination'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { adminAPI } from '../../services/api'
import { formatDateTime, humanizeEnum } from '../../utils/formatters'

const actionBadge = (action) => {
  if (action?.includes('DELETE')) return 'badge-red'
  if (action?.includes('CREATE')) return 'badge-green'
  if (action?.includes('UPDATE') || action?.includes('LOGIN')) return 'badge-blue'
  return 'badge-gray'
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    adminAPI.getAuditLogs(page)
      .then((response) => {
        const data = response.data?.data
        setLogs(data?.content || [])
        setTotalPages(data?.totalPages || 0)
      })
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }, [page])

  const filteredLogs = useMemo(() => {
    if (filter === 'ALL') return logs
    if (filter === 'SUCCESS') return logs.filter((log) => log.success)
    return logs.filter((log) => !log.success)
  }, [filter, logs])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="font-display text-2xl font-bold text-earth-900">Audit Logs</h1>
          <p className="font-body text-sm text-earth-500 mt-1">Review platform actions, success states, and the exact user or entity affected.</p>
        </div>

        <div className="flex gap-2">
          {[
            { key: 'ALL', label: 'All Events' },
            { key: 'SUCCESS', label: 'Successful' },
            { key: 'FAILED', label: 'Failed' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold ${
                filter === item.key ? 'bg-mustard-500 text-white' : 'bg-white border border-earth-200 text-earth-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? (
            <LoadingSpinner fullPage />
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={32} className="text-earth-300 mx-auto mb-3" />
              <p className="font-body text-earth-400">No audit logs found for this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50 border-b border-earth-100">
                  <tr>
                    {['Timestamp', 'User', 'Action', 'Entity', 'Status', 'Description', 'IP Address'].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 font-body uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-earth-50">
                      <td className="px-4 py-3 font-mono text-xs text-earth-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                      <td className="px-4 py-3">
                        <p className="font-body text-sm text-earth-800 font-medium">{log.username || 'System'}</p>
                        <p className="font-body text-xs text-earth-400 mt-1">{log.userId || 'No user id'}</p>
                      </td>
                      <td className="px-4 py-3"><span className={actionBadge(log.action)}>{humanizeEnum(log.action)}</span></td>
                      <td className="px-4 py-3">
                        <p className="font-body text-sm text-earth-700">{log.entityType || 'N/A'}</p>
                        <p className="font-body text-xs text-earth-400 mt-1">{log.entityId || 'No entity id'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={log.success ? 'badge-green' : 'badge-red'}>{log.success ? 'Success' : 'Failed'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-body text-sm text-earth-700">{log.description || 'No description recorded'}</p>
                        {!log.success && log.failureReason && <p className="font-body text-xs text-red-500 mt-1">{log.failureReason}</p>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-earth-500">{log.ipAddress || 'N/A'}</td>
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
