import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { maintenanceApi } from '../../api/maintenance.api.js'
import { assetsApi } from '../../api/assets.api.js'

export default function MaintenanceFormPage() {
  const navigate = useNavigate()
  
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [assetsLoading, setAssetsLoading] = useState(true)

  const [formData, setFormData] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'NORMAL'
  })

  useEffect(() => {
    // Fetch assets for dropdown
    const loadAssets = async () => {
      try {
        const res = await assetsApi.list({ pageSize: 100 }) // fetch first 100
        setAssets(res.data)
      } catch (err) {
        console.error('Failed to load assets', err)
      } finally {
        setAssetsLoading(false)
      }
    }
    loadAssets()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await maintenanceApi.create(formData)
      navigate('/maintenance')
    } catch (err) {
      setError(err.message || 'Failed to submit maintenance request')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/maintenance')} className="text-ink-500 hover:text-ink">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="font-display text-3xl font-bold text-ink uppercase tracking-wide">
          Report Issue
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-paper-300 shadow-sm p-6">
        {error && (
          <div className="mb-6 p-3 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Asset *</label>
            <select
              name="assetId"
              required
              value={formData.assetId}
              onChange={handleChange}
              disabled={assetsLoading}
              className="w-full px-3 py-2 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal bg-white"
            >
              <option value="">Select an asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.assetTag})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="E.g., Screen flickering, Engine oil leak"
              className="w-full px-3 py-2 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Priority *</label>
            <select
              name="priority"
              required
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal bg-white"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Description *</label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-paper-200">
            <button
              type="button"
              onClick={() => navigate('/maintenance')}
              className="px-4 py-2 text-sm font-medium text-ink-600 hover:bg-paper-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-signal hover:bg-signal-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
