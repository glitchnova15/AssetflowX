import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center font-display text-2xl text-ink">Loading AssetFlow...</div>
  }

  // If not logged in, show Login screen
  if (!session) {
    return <Login onLogin={setSession} />
  }

  // If logged in, show the main application
  return (
    <div className="min-h-screen bg-paper-100 p-8 font-body text-ink">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-paper-300">
        <h1 className="text-3xl font-display font-bold text-stamp mb-4">Dashboard Active</h1>
        <p className="mb-4">Welcome back. Your session is connected.</p>
        
        <button 
          onClick={() => supabase.auth.signOut()}
          className="bg-ink hover:bg-ink-700 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
