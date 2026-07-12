import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await register({ email, password, displayName })
      } else {
        await login(email, password)
      }
      navigate('/assets', { replace: true })
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 font-body text-ink">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-paper-300">
        <div className="text-center mb-8">
          <div className="h-1 w-12 bg-signal rounded-full mx-auto mb-4" />
          <h1 className="text-4xl font-display font-bold text-stamp mb-2">AssetFlowX</h1>
          <p className="text-ink-500">Enterprise Resource Management</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-2.5 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              required
              minLength={12}
              className="w-full p-2.5 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 12 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal hover:bg-signal-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-stamp hover:text-stamp-700 font-bold transition-colors"
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  )
}
