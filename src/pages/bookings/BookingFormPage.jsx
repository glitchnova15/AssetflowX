import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingsApi } from '../../api/bookings.api.js'
import { assetsApi } from '../../api/assets.api.js'
import { categoriesApi } from '../../api/categories.api.js'

export default function BookingFormPage() {
  const navigate = useNavigate()
  const [bookingType, setBookingType] = useState('ASSET')
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(false)

  const [formData, setFormData] = useState({
    assetId: '',
    categoryId: '',
    startsAt: '',
    endsAt: '',
    purpose: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const fetchItems = async () => {
      setLoadingItems(true)
      try {
        if (bookingType === 'ASSET') {
          const res = await assetsApi.list({ pageSize: 100 })
          if (active) setItems(res.data)
        } else {
          const res = await categoriesApi.list({ pageSize: 100 })
          if (active) setItems(res.data)
        }
      } catch (err) {
        if (active) setError('Failed to load items')
      } finally {
        if (active) setLoadingItems(false)
      }
    }
    fetchItems()
    return () => { active = false }
  }, [bookingType])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.startsAt || !formData.endsAt) {
      return setError('Start and End dates are required.')
    }
    
    if (new Date(formData.startsAt) >= new Date(formData.endsAt)) {
      return setError('End date must be after start date.')
    }

    if (bookingType === 'ASSET' && !formData.assetId) {
      return setError('Please select an asset.')
    }
    
    if (bookingType === 'CATEGORY' && !formData.categoryId) {
      return setError('Please select a category.')
    }

    setSubmitting(true)
    try {
      await bookingsApi.create({
        assetId: bookingType === 'ASSET' ? formData.assetId : undefined,
        categoryId: bookingType === 'CATEGORY' ? formData.categoryId : undefined,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
        purpose: formData.purpose,
      })
      navigate('/bookings')
    } catch (err) {
      setError(err.message || 'Failed to create booking')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/bookings')}
          className="text-ink-500 hover:text-ink transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="font-display text-2xl font-bold text-ink uppercase tracking-wide">Request Booking</h1>
      </div>

      <div className="bg-white rounded-xl border border-paper-300 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-lg">{error}</div>
          )}

          {/* Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-ink">Booking Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="ASSET"
                  checked={bookingType === 'ASSET'}
                  onChange={() => {
                    setBookingType('ASSET')
                    setFormData(prev => ({ ...prev, assetId: '', categoryId: '' }))
                  }}
                  className="text-signal focus:ring-signal"
                />
                <span className="text-sm font-medium">Book Specific Asset</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="CATEGORY"
                  checked={bookingType === 'CATEGORY'}
                  onChange={() => {
                    setBookingType('CATEGORY')
                    setFormData(prev => ({ ...prev, assetId: '', categoryId: '' }))
                  }}
                  className="text-signal focus:ring-signal"
                />
                <span className="text-sm font-medium">Book by Category</span>
              </label>
            </div>
          </div>

          {/* Item Selection */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              {bookingType === 'ASSET' ? 'Select Asset' : 'Select Category'}
            </label>
            <select
              name={bookingType === 'ASSET' ? 'assetId' : 'categoryId'}
              value={bookingType === 'ASSET' ? formData.assetId : formData.categoryId}
              onChange={handleChange}
              disabled={loadingItems}
              className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors disabled:bg-paper-100"
              required
            >
              <option value="">{loadingItems ? 'Loading...' : '-- Select --'}</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.assetTag ? `(${item.assetTag})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                name="endsAt"
                value={formData.endsAt}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                required
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Purpose / Notes</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={4}
              placeholder="Why do you need this resource?"
              className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-paper-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-ink hover:bg-paper-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium bg-signal text-white rounded-lg hover:bg-signal-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
