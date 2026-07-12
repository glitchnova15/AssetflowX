import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingsApi } from '../../api/bookings.api.js'
import { useAuth } from '../../hooks/useAuth.js'

const formatLabel = (val) => val?.replace(/_/g, ' ') ?? '—'

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

export default function BookingDetailPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const canManage = hasRole('ADMIN') || hasRole('ASSET_MANAGER')

  const fetchBooking = useCallback(async () => {
    try {
      const result = await bookingsApi.getById(bookingId)
      setBooking(result)
    } catch (err) {
      setError(err.message || 'Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => { fetchBooking() }, [fetchBooking])

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${formatLabel(newStatus)}?`)) return
    setActionLoading(true)
    setError('')
    try {
      await bookingsApi.updateStatus(bookingId, newStatus)
      await fetchBooking()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-ink-500 animate-pulse">Loading booking details...</div>
  }

  if (error && !booking) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-4 bg-stamp/10 border border-stamp/20 text-stamp rounded-lg">{error}</div>
        <button onClick={() => navigate('/bookings')} className="mt-4 text-signal hover:underline">
          &larr; Back to Bookings
        </button>
      </div>
    )
  }

  const { status } = booking

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/bookings')}
          className="text-ink-500 hover:text-ink transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="font-display text-2xl font-bold text-ink uppercase tracking-wide">
          Booking Details
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(status)}`}>
            {formatLabel(status)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-stamp/10 border border-stamp/20 text-stamp rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-paper-300 shadow-sm p-6">
            <h2 className="text-lg font-bold text-ink mb-4 font-display">Request Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Requested Item</p>
                {booking.asset ? (
                  <div>
                    <p className="font-medium text-ink">{booking.asset.name}</p>
                    <p className="text-sm font-mono text-ink-500">{booking.asset.assetTag}</p>
                  </div>
                ) : booking.category ? (
                  <div>
                    <p className="font-medium text-ink">{booking.category.name}</p>
                    <p className="text-sm text-ink-500">Any asset in category</p>
                  </div>
                ) : (
                  <p className="text-ink-500">—</p>
                )}
              </div>
              
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Requester</p>
                <p className="font-medium text-ink">{booking.user?.displayName ?? '—'}</p>
                <p className="text-sm text-ink-500">{booking.user?.email ?? '—'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Start Date & Time</p>
                <p className="font-medium text-ink">{new Date(booking.startsAt).toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">End Date & Time</p>
                <p className="font-medium text-ink">{new Date(booking.endsAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-paper-200">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Purpose</p>
              <p className="text-ink-600 whitespace-pre-wrap">{booking.purpose || 'No purpose provided.'}</p>
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-paper-300 shadow-sm p-6">
            <h2 className="text-lg font-bold text-ink mb-4 font-display">Actions</h2>
            <div className="flex flex-col gap-3">
              {/* Manager Actions */}
              {canManage && status === 'PENDING' && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusUpdate('APPROVED')}
                    className="w-full px-4 py-2.5 bg-signal text-white font-medium rounded-lg hover:bg-signal-700 disabled:opacity-50 transition-colors"
                  >
                    Approve Request
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusUpdate('REJECTED')}
                    className="w-full px-4 py-2.5 bg-stamp/10 text-stamp font-medium rounded-lg hover:bg-stamp hover:text-white disabled:opacity-50 transition-colors"
                  >
                    Reject Request
                  </button>
                </>
              )}

              {canManage && status === 'APPROVED' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusUpdate('CHECKED_OUT')}
                  className="w-full px-4 py-2.5 bg-signal text-white font-medium rounded-lg hover:bg-signal-700 disabled:opacity-50 transition-colors"
                >
                  Mark as Checked Out
                </button>
              )}

              {canManage && status === 'CHECKED_OUT' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  className="w-full px-4 py-2.5 bg-signal text-white font-medium rounded-lg hover:bg-signal-700 disabled:opacity-50 transition-colors"
                >
                  Mark as Completed (Returned)
                </button>
              )}

              {/* User/General Actions */}
              {(status === 'PENDING' || status === 'APPROVED') && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusUpdate('CANCELLED')}
                  className="w-full px-4 py-2.5 border border-stamp text-stamp font-medium rounded-lg hover:bg-stamp hover:text-white disabled:opacity-50 transition-colors"
                >
                  Cancel Booking
                </button>
              )}

              {['REJECTED', 'CANCELLED', 'COMPLETED'].includes(status) && (
                <p className="text-sm text-ink-500 text-center italic">No further actions available for this booking.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
