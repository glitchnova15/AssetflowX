import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { assetsApi } from '../../api/assets.api.js'
import { useAuth } from '../../hooks/useAuth.js'

const STATUS_OPTIONS = ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'IN_MAINTENANCE', 'RETIRED', 'LOST', 'DISPOSED']
const CONDITION_OPTIONS = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']

const statusColor = (status) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-signal/15 text-signal'
    case 'ALLOCATED': case 'RESERVED': return 'bg-amber/15 text-amber'
    case 'IN_MAINTENANCE': return 'bg-amber/15 text-amber'
    default: return 'bg-stamp/15 text-stamp'
  }
}

const conditionColor = (condition) => {
  switch (condition) {
    case 'NEW': case 'GOOD': return 'bg-signal/15 text-signal'
    case 'FAIR': return 'bg-amber/15 text-amber'
    default: return 'bg-stamp/15 text-stamp'
  }
}

const formatLabel = (val) => val?.replace(/_/g, ' ') ?? '—'

export default function AssetListPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const canWrite = hasRole('ADMIN') || hasRole('ASSET_MANAGER')

  const [assets, setAssets] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentPage = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''
  const lifecycleStatus = searchParams.get('lifecycleStatus') || ''
  const condition = searchParams.get('condition') || ''

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await assetsApi.list({
        page: currentPage,
        pageSize: 20,
        ...(search && { search }),
        ...(lifecycleStatus && { lifecycleStatus }),
        ...(condition && { condition }),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      setAssets(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message || 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, lifecycleStatus, condition])

  useEffect(() => { fetchAssets() }, [fetchAssets])

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
        <h1 className="font-display text-3xl font-bold text-gray-800 uppercase tracking-wide">Assets</h1>
        {canWrite && (
          <button
            onClick={() => navigate('/assets/new')}
            className="inline-flex items-center gap-2 bg-signal hover:bg-signal-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Asset
          </button>
        )}
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
              placeholder="Search by tag, name, or serial..."
              className="w-full pl-10 pr-4 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              defaultValue={search}
              onKeyDown={(e) => { if (e.key === 'Enter') updateFilter('search', e.target.value) }}
            />
          </div>
          <select
            className="px-3 py-2.5 border border-paper-300 rounded-lg text-sm bg-white focus:outline-none focus:border-signal"
            value={lifecycleStatus}
            onChange={(e) => updateFilter('lifecycleStatus', e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
          </select>
          <select
            className="px-3 py-2.5 border border-paper-300 rounded-lg text-sm bg-white focus:outline-none focus:border-signal"
            value={condition}
            onChange={(e) => updateFilter('condition', e.target.value)}
          >
            <option value="">All Conditions</option>
            {CONDITION_OPTIONS.map((c) => <option key={c} value={c}>{formatLabel(c)}</option>)}
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
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Asset Tag</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider hidden sm:table-cell">Condition</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-paper-300/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-paper-300/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-ink-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-paper-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="font-medium">No assets found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="border-b border-paper-300/50 hover:bg-paper-100/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium">{asset.assetTag}</td>
                    <td className="px-4 py-3 font-medium">{asset.name}</td>
                    <td className="px-4 py-3 text-ink-500 hidden md:table-cell">{asset.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-500 hidden lg:table-cell">{asset.department?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(asset.lifecycleStatus)}`}>
                        {formatLabel(asset.lifecycleStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${conditionColor(asset.condition)}`}>
                        {formatLabel(asset.condition)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
