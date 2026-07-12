import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bookingsApi } from '../../api/bookings.api.js'
import { useAuth } from '../../hooks/useAuth.js'

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_OUT', 'COMPLETED']

const statusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-amber/15 text-amber'
    case 'APPROVED': return 'bg-signal/15 text-signal'
    case 'REJECTED': case 'CANCELLED': return 'bg-stamp/15 text-stamp'
    case 'CHECKED_OUT': return 'bg-signal/15 text-signal'
    case 'COMPLETED': return 'bg-signal/15 text-signal'
    default: return 'bg-ink/15 text-ink'
  }
}

const formatLabel = (val) => val?.replace(/_/g, ' ') ?? '—'

export default function BookingListPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [bookings, setBookings] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentPage = Number(searchParams.get('page')) || 1
  const status = searchParams.get('status') || ''

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await bookingsApi.list({
        page: currentPage,
        pageSize: 20,
        ...(status && { status }),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      setBookings(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [currentPage, status])

  useEffect(() => { fetchBookings() }, [fetchBookings])

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl font-bold text-ink uppercase tracking-wide">Resource Bookings</h1>
        <button
          onClick={() => navigate('/bookings/new')}
          className="inline-flex items-center gap-2 bg-signal hover:bg-signal-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Request Booking
        </button>
      </div>

      <div className="bg-white rounded-xl border border-paper-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="px-3 py-2.5 border border-paper-300 rounded-lg text-sm bg-white focus:outline-none focus:border-signal w-full sm:w-auto"
            value={status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-paper-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paper-300 bg-paper-100/50">
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Requested Item</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Start Date</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">End Date</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider hidden sm:table-cell">Requester</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Status</th>
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
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-ink-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-paper-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-medium">No bookings found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                    className="border-b border-paper-300/50 hover:bg-paper-100/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {booking.asset ? (
                        <span>{booking.asset.name} <span className="text-ink-500 text-xs font-mono ml-2">{booking.asset.assetTag}</span></span>
                      ) : booking.category ? (
                        <span>{booking.category.name} <span className="text-ink-500 text-xs ml-1">(Any)</span></span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{new Date(booking.startsAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink-600">{new Date(booking.endsAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink-600 hidden sm:table-cell">{booking.user?.displayName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(booking.status)}`}>
                        {formatLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-ink-500 hover:text-signal transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
