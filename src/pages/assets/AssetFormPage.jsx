import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assetsApi } from '../../api/assets.api.js'
import { categoriesApi } from '../../api/categories.api.js'

const STATUS_OPTIONS = ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'IN_MAINTENANCE', 'RETIRED', 'LOST', 'DISPOSED']
const CONDITION_OPTIONS = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']
const formatLabel = (val) => val?.replace(/_/g, ' ') ?? ''

export default function AssetFormPage() {
  const { assetId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(assetId)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    serialNumber: '',
    description: '',
    categoryId: '',
    manufacturer: '',
    model: '',
    lifecycleStatus: 'AVAILABLE',
    condition: 'NEW',
    purchaseCost: '',
    acquiredDate: '',
    warrantyExpiryDate: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await categoriesApi.list({ pageSize: 100 })
        setCategories(catRes.data)

        if (isEdit) {
          const asset = await assetsApi.getById(assetId)
          setFormData({
            assetTag: asset.assetTag,
            name: asset.name,
            serialNumber: asset.serialNumber || '',
            description: asset.description || '',
            categoryId: asset.categoryId || '',
            manufacturer: asset.manufacturer || '',
            model: asset.model || '',
            lifecycleStatus: asset.lifecycleStatus,
            condition: asset.condition,
            purchaseCost: asset.purchaseCost || '',
            acquiredDate: asset.acquiredDate ? asset.acquiredDate.split('T')[0] : '',
            warrantyExpiryDate: asset.warrantyExpiryDate ? asset.warrantyExpiryDate.split('T')[0] : '',
          })
        }
      } catch (err) {
        setError('Failed to load form data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [assetId, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      ...formData,
      purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : null,
      acquiredDate: formData.acquiredDate ? new Date(formData.acquiredDate).toISOString() : null,
      warrantyExpiryDate: formData.warrantyExpiryDate ? new Date(formData.warrantyExpiryDate).toISOString() : null,
      categoryId: formData.categoryId || null,
    }
    // Remove empty strings to not send them as invalid values
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') delete payload[key]
    })

    try {
      if (isEdit) {
        delete payload.assetTag // cannot update asset tag
        await assetsApi.update(assetId, payload)
        navigate(`/assets/${assetId}`)
      } else {
        const created = await assetsApi.create(payload)
        navigate(`/assets/${created.id}`)
      }
    } catch (err) {
      setError(err.message || (isEdit ? 'Failed to update asset' : 'Failed to create asset'))
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-signal"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-paper-300/50 text-ink-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="font-display text-3xl font-bold text-ink uppercase tracking-wide">
          {isEdit ? 'Edit Asset' : 'New Asset'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-paper-300 p-6 md:p-8">
        {/* Core Info */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-ink mb-4 border-b border-paper-300 pb-2">Core Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Asset Tag <span className="text-stamp">*</span></label>
              <input
                name="assetTag"
                required
                disabled={isEdit}
                value={formData.assetTag}
                onChange={handleChange}
                placeholder="e.g. LPT-001"
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Asset Name <span className="text-stamp">*</span></label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. MacBook Pro M2"
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Additional details..."
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-ink mb-4 border-b border-paper-300 pb-2">Classification & Hardware</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Category <span className="text-stamp">*</span></label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              >
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Serial Number</label>
              <input
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Manufacturer</label>
              <input
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Model</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Status & Condition */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-ink mb-4 border-b border-paper-300 pb-2">Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isEdit && (
              <div>
                <label className="block text-sm font-bold mb-1.5 text-ink-500">Initial Status</label>
                <select
                  name="lifecycleStatus"
                  value={formData.lifecycleStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
                </select>
                <p className="text-xs text-ink-500 mt-1">Status changes after creation are done on the detail page to track history.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              >
                {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-ink mb-4 border-b border-paper-300 pb-2">Financials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Purchase Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="purchaseCost"
                value={formData.purchaseCost}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Acquired Date</label>
              <input
                type="date"
                name="acquiredDate"
                value={formData.acquiredDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink-500">Warranty Expiry</label>
              <input
                type="date"
                name="warrantyExpiryDate"
                value={formData.warrantyExpiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end border-t border-paper-300 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-bold text-ink hover:bg-paper-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-bold bg-signal hover:bg-signal-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Asset')}
          </button>
        </div>
      </form>
    </div>
  )
}
