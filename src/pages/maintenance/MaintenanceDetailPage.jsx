import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { maintenanceApi } from '../../api/maintenance.api.js'
import { useAuth } from '../../hooks/useAuth.js'

const formatLabel = (val) => val?.replace(/_/g, ' ') ?? '—'

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

export default function MaintenanceDetailPage() {
  const { maintenanceId } = useParams()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Update form state
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
    actualCost: '',
    vendorName: ''
  })

  const fetchTicket = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await maintenanceApi.getById(maintenanceId)
      setTicket(res.data)
      setUpdateData({
        status: res.data.status,
        notes: '',
        actualCost: res.data.actualCost || '',
        vendorName: res.data.vendorName || ''
      })
    } catch (err) {
      setError(err.message || 'Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }, [maintenanceId])

  useEffect(() => { fetchTicket() }, [fetchTicket])

  const handleUpdateChange = (e) => {
    const { name, value } = e.target
    setUpdateData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setUpdateError('')
    try {
      // Clean up empty fields
      const payload = { ...updateData }
      if (!payload.actualCost) delete payload.actualCost
      if (!payload.vendorName) delete payload.vendorName
      
      await maintenanceApi.update(maintenanceId, payload)
      await fetchTicket() // Refresh ticket
    } catch (err) {
      setUpdateError(err.message || 'Failed to update ticket')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-ink-500 animate-pulse">Loading ticket details...</div>
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-4 bg-stamp/10 border border-stamp/20 text-stamp rounded-lg">
          {error || 'Ticket not found'}
        </div>
        <button onClick={() => navigate('/maintenance')} className="mt-4 text-signal hover:underline">
          &larr; Back to Maintenance
        </button>
      </div>
    )
  }

  const canUpdate = hasRole('ADMIN') || hasRole('ASSET_MANAGER') || ticket.requestedBy?.id === user?.id || ticket.assignee?.id === user?.id
  const isStatusChanged = updateData.status !== ticket.status

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/maintenance')} className="text-ink-500 hover:text-ink">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="font-display text-3xl font-bold text-ink uppercase tracking-wide">
          Ticket Details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Info & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Info */}
          <div className="bg-white rounded-xl border border-paper-300 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-paper-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-ink mb-1">{ticket.title}</h2>
                  <p className="text-sm text-ink-500 font-mono">
                    Asset: {ticket.asset?.name} ({ticket.asset?.assetTag})
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(ticket.status)}`}>
                    {formatLabel(ticket.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColor(ticket.priority)}`}>
                    {formatLabel(ticket.priority)} Priority
                  </span>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-ink-600">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>
            <div className="p-4 bg-paper-100/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Requested By</p>
                <p className="font-medium text-ink">{ticket.requestedBy?.displayName || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Opened At</p>
                <p className="font-medium text-ink">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}</p>
              </div>
              <div>
                <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Assignee</p>
                <p className="font-medium text-ink">{ticket.assignee?.displayName || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Cost</p>
                <p className="font-medium text-ink">{ticket.actualCost ? `$${ticket.actualCost}` : '—'}</p>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          <div className="bg-white rounded-xl border border-paper-300 shadow-sm p-5">
            <h3 className="font-bold text-lg text-ink mb-6">History Timeline</h3>
            {ticket.history && ticket.history.length > 0 ? (
              <div className="relative border-l-2 border-paper-200 ml-3 space-y-6">
                {ticket.history.map((item, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-paper-300 border-2 border-white" />
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm text-ink">{item.action}</p>
                      <p className="text-xs text-ink-500 whitespace-nowrap ml-2">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                      </p>
                    </div>
                    {item.notes && <p className="text-sm text-ink-600 bg-paper-100 p-2 rounded mt-2">{item.notes}</p>}
                    <p className="text-xs text-ink-400 mt-1">by {item.user?.displayName || 'System'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500 text-center py-4">No history available.</p>
            )}
          </div>
        </div>

        {/* Right Col: Update Action Box */}
        {canUpdate && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-paper-300 shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-lg text-ink mb-4">Update Ticket</h3>
              
              {updateError && (
                <div className="mb-4 p-2 bg-stamp/10 border border-stamp/20 text-stamp text-xs rounded-lg">
                  {updateError}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Status</label>
                  <select
                    name="status"
                    value={updateData.status}
                    onChange={handleUpdateChange}
                    className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal bg-white"
                  >
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Notes {isStatusChanged && <span className="text-stamp">*</span>}
                  </label>
                  <textarea
                    name="notes"
                    value={updateData.notes}
                    onChange={handleUpdateChange}
                    required={isStatusChanged}
                    rows="3"
                    placeholder="Enter update details..."
                    className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Actual Cost ($)</label>
                  <input
                    type="number"
                    name="actualCost"
                    value={updateData.actualCost}
                    onChange={handleUpdateChange}
                    step="0.01"
                    min="0"
                    placeholder="e.g. 150.00"
                    className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Vendor Name</label>
                  <input
                    type="text"
                    name="vendorName"
                    value={updateData.vendorName}
                    onChange={handleUpdateChange}
                    placeholder="External service used..."
                    className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full mt-2 py-2 text-sm font-medium text-white bg-signal hover:bg-signal-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Update'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
