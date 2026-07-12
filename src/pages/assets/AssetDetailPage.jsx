import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { assetsApi } from '../../api/assets.api.js'
import { useAuth } from '../../hooks/useAuth.js'

const formatLabel = (val) => val?.replace(/_/g, ' ') ?? '—'
const formatCurrency = (val) => val != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val) : '—'
const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

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

export default function AssetDetailPage() {
  const { assetId } = useParams()
  const navigate = useNavigate()
  const { hasRole, user } = useAuth()
  const canWrite = hasRole('ADMIN') || hasRole('ASSET_MANAGER')

  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newStatus, setNewStatus] = useState('')
  const [statusReason, setStatusReason] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchAsset = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await assetsApi.getById(assetId)
      setAsset(data)
      setNewStatus(data.lifecycleStatus)
    } catch (err) {
      setError(err.message || 'Failed to load asset details')
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => { fetchAsset() }, [fetchAsset])

  const handleStatusChange = async (e) => {
    e.preventDefault()
    if (!newStatus || newStatus === asset.lifecycleStatus) return
    setUpdatingStatus(true)
    try {
      await assetsApi.changeStatus(assetId, { status: newStatus, reason: statusReason })
      setStatusReason('')
      await fetchAsset()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    try {
      await assetsApi.remove(assetId)
      navigate('/assets')
    } catch (err) {
      setError(err.message || 'Failed to delete asset')
      setShowDeleteModal(false)
    }
  }

  const handleDownloadQr = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/v1/assets/${assetId}/qr`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to generate QR')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `QR_${asset?.assetTag || assetId}.png`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download QR Code')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-signal"></div>
      </div>
    )
  }

  if (error && !asset) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block p-4 bg-stamp/10 rounded-xl text-stamp font-medium mb-4">{error}</div>
        <div><Link to="/assets" className="text-signal hover:underline">← Back to Assets</Link></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="mb-6">
        <Link to="/assets" className="inline-flex items-center text-sm font-medium text-ink-500 hover:text-ink transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Assets
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-4xl font-bold text-ink">{asset.name}</h1>
            <span className="font-mono text-xs font-bold bg-ink text-white px-2.5 py-1 rounded-md">{asset.assetTag}</span>
          </div>
          <p className="text-ink-500">{asset.description || 'No description provided.'}</p>
        </div>

        {canWrite && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/assets/${assetId}/edit`)}
              className="px-4 py-2 bg-white border border-paper-300 text-ink rounded-lg font-medium hover:bg-paper-100 transition-colors"
            >
              Edit Asset
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-white border border-stamp text-stamp rounded-lg font-medium hover:bg-stamp/5 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white rounded-xl border border-paper-300 p-6 shadow-sm">
            <h2 className="font-display tracking-wide uppercase text-ink-500 text-sm font-bold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              General Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-1">Manufacturer</p>
                <p className="font-medium">{asset.manufacturer || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-1">Model</p>
                <p className="font-medium">{asset.model || '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-1">Serial Number</p>
                <p className="font-mono bg-paper-100 px-2 py-1 rounded inline-block text-sm">{asset.serialNumber || '—'}</p>
              </div>
            </div>
          </div>

          {/* Classification & Financial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-paper-300 p-6 shadow-sm">
              <h2 className="font-display tracking-wide uppercase text-ink-500 text-sm font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Classification
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-1">Category</p>
                  <p className="font-medium">{asset.category?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-1">Department</p>
                  <p className="font-medium">{asset.department?.name || '—'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-paper-300 p-6 shadow-sm">
              <h2 className="font-display tracking-wide uppercase text-ink-500 text-sm font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Financials
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-1">Purchase Cost</p>
                  <p className="font-medium font-mono text-lg">{formatCurrency(asset.purchaseCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-1">Acquired / Warranty</p>
                  <p className="text-sm">Acq: {formatDate(asset.acquiredDate)}</p>
                  <p className="text-sm">Exp: {formatDate(asset.warrantyExpiryDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-xl border border-paper-300 p-6 shadow-sm">
            <h2 className="font-display tracking-wide uppercase text-ink-500 text-sm font-bold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status & Condition
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-2">Lifecycle Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold tracking-wide ${statusColor(asset.lifecycleStatus)}`}>
                  {formatLabel(asset.lifecycleStatus)}
                </span>
              </div>
              <div>
                <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold mb-2">Physical Condition</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold tracking-wide ${conditionColor(asset.condition)}`}>
                  {formatLabel(asset.condition)}
                </span>
              </div>
            </div>
          </div>

          {/* Change Status (Write access only) */}
          {canWrite && (
            <div className="bg-white rounded-xl border border-paper-300 p-6 shadow-sm">
              <h2 className="font-display tracking-wide uppercase text-ink-500 text-sm font-bold mb-4">Update Status</h2>
              <form onSubmit={handleStatusChange} className="space-y-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-paper-300 rounded-lg focus:outline-none focus:border-signal text-sm bg-white"
                >
                  {['AVAILABLE', 'ALLOCATED', 'RESERVED', 'IN_MAINTENANCE', 'RETIRED', 'LOST', 'DISPOSED'].map(s => (
                    <option key={s} value={s}>{formatLabel(s)}</option>
                  ))}
                </select>
                {newStatus !== asset.lifecycleStatus && (
                  <>
                    <textarea
                      placeholder="Reason for status change (required)..."
                      required
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      className="w-full px-3 py-2 border border-paper-300 rounded-lg focus:outline-none focus:border-signal text-sm min-h-[80px] resize-none"
                    />
                    <button
                      type="submit"
                      disabled={updatingStatus || !statusReason.trim()}
                      className="w-full bg-signal hover:bg-signal-700 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {updatingStatus ? 'Updating...' : 'Confirm Status Change'}
                    </button>
                  </>
                )}
              </form>
            </div>
          )}

          {/* QR Code */}
          <div className="bg-white rounded-xl border border-paper-300 p-6 shadow-sm text-center">
             <h2 className="font-display tracking-wide uppercase text-ink-500 text-sm font-bold mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Asset Tag QR
            </h2>
            <button
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-2 px-4 py-2 bg-paper-100 hover:bg-paper-300 text-ink font-medium rounded-lg text-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold font-display text-stamp mb-2">Delete Asset</h3>
            <p className="text-ink-500 mb-6">Are you sure you want to delete <strong>{asset.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-ink-500 hover:bg-paper-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-stamp hover:bg-stamp-700 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
