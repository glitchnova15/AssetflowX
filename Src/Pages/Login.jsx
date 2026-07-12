import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isSignUp) {
        // Step 1: Create the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (authError) throw authError

        // Step 2: Create their profile in our custom Employee table
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('employees')
            .insert([
              {
                id: authData.user.id, // Links to Supabase Auth UUID
                full_name: fullName,
                role: 'ADMIN', // Hackathon trick: Make your first user an Admin instantly
              }
            ])
          if (profileError) throw profileError
          alert('Registration successful! You can now log in.')
          setIsSignUp(false) // Switch back to login view
        }
      } else {
        // Handle Login
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        })
        if (error) throw error
        onLogin(data.session)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 font-body text-ink">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-paper-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-stamp mb-2">AssetFlow</h1>
          <p className="text-ink-500">Enterprise Resource Management</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-paper-300 rounded focus:outline-none focus:border-signal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-paper-300 rounded focus:outline-none focus:border-signal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-paper-300 rounded focus:outline-none focus:border-signal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal hover:bg-signal-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Register Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-stamp hover:text-stamp-700 font-bold"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  )
}
