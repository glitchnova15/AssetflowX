const API_BASE = '/api/v1'

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`
    const token = localStorage.getItem('accessToken')

    const config = {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, config)

    if (response.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/AssetflowX/login'
      throw new Error('Session expired')
    }

    if (response.status === 204) return null

    const data = await response.json()
    if (!response.ok) throw { status: response.status, ...data.error }
    return data
  }

  get(endpoint, params) {
    const query = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString()
      : ''
    return this.request(`${endpoint}${query}`)
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body })
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  upload(endpoint, formData) {
    return this.request(endpoint, { method: 'POST', body: formData })
  }
}

export const apiClient = new ApiClient()
