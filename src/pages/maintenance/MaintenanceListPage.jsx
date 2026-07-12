import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { maintenanceApi } from '../../api/maintenance.api.js'
import { useAuth } from '../../hooks/useAuth.js'

const STATUS_OPTIONS = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']
const PRIORITY_OPTIONS = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL']

const statusColor = (status) => {
  switch (status) {
    case 'OPEN': case 'ASSIGNED': case 'IN_PROGRESS': return 'bg-signal/15 text-signal'
    case 'ON_HOLD': return 'bg-amber/15 text-amber'
    case 'COMPLETED': return 'bg-emerald-500/15 text-emerald-600'
    default: return 'bg-stamp/15 text-stamp'
  }
}

const priorityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': case 'HIGH': return 'bg-amber/15 text-amber'
    case 'LOW': return 'bg-stamp/15 text-stamp'
    default: return 'bg-signal/15 text-signal'
  }
}

const formatLabel = (val) => val?.replace(/_/g, ' ') ?? '—'

export default function MaintenanceListPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [maintenanceItems, setMaintenanceItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentPage = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''

  const fetchMaintenance = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await maintenanceApi.list({
        page: currentPage,
        pageSize: 20,
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority }),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      setMaintenanceItems(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message || 'Failed to load maintenance tickets')
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, status, priority])

  useEffect(() => { fetchMaintenance() }, [fetchMaintenance])

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    setSearchParams(params)
  }

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
  }

  const startIndex = (pagination.page - 1) * pagination.pageSize + 1
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.total)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl font-bold text-ink uppercase tracking-wide">Maintenance</h1>
        <button
          onClick={() => navigate('/maintenance/new')}
          className="inline-flex items-center gap-2 bg-signal hover:bg-signal-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Report Issue
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-paper-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or asset..."
              className="w-full pl-10 pr-4 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              defaultValue={search}
              onKeyDown={(e) => { if (e.key === 'Enter') updateFilter('search', e.target.value) }}
            />
          </div>
          <select
            className="px-3 py-2.5 border border-paper-300 rounded-lg text-sm bg-white focus:outline-none focus:border-signal"
            value={status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
          </select>
          <select
            className="px-3 py-2.5 border border-paper-300 rounded-lg text-sm bg-white focus:outline-none focus:border-signal"
            value={priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{formatLabel(p)}</option>)}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-lg">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-paper-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paper-300 bg-paper-100/50">
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Asset</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider hidden sm:table-cell">Opened</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-paper-300/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-paper-300/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : maintenanceItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-ink-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-paper-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="font-medium">No maintenance tickets found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                maintenanceItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/maintenance/${item.id}`)}
                    className="border-b border-paper-300/50 hover:bg-paper-100/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.asset?.name || 'Unknown Asset'}</div>
                      <div className="text-xs text-ink-500 font-mono">{item.asset?.assetTag || '—'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColor(item.priority)}`}>
                        {formatLabel(item.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                        {formatLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500 hidden sm:table-cell">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ink-500 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-paper-300">
            <p className="text-sm text-ink-500">
              Showing <span className="font-medium text-ink">{startIndex}</span>–<span className="font-medium text-ink">{endIndex}</span> of{' '}
              <span className="font-medium text-ink">{pagination.total}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-paper-300 rounded-lg hover:bg-paper-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="px-3 py-1.5 text-sm border border-paper-300 rounded-lg hover:bg-paper-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
