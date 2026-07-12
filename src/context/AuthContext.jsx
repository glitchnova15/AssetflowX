import { createContext, useState, useCallback, useMemo } from 'react'
import { authApi } from '../api/auth.api.js'

export const AuthContext = createContext(null)

function loadStoredAuth() {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    if (user && accessToken) return { user, accessToken, refreshToken }
  } catch { /* ignore parse errors */ }
  return { user: null, accessToken: null, refreshToken: null }
}

function persistAuth({ user, accessToken, refreshToken }) {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

function clearAuth() {
  localStorage.removeItem('user')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth)

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    const state = { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }
    persistAuth(state)
    setAuth(state)
    return data
  }, [])

  const register = useCallback(async ({ email, password, displayName }) => {
    const data = await authApi.register({ email, password, displayName })
    const state = { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }
    persistAuth(state)
    setAuth(state)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      if (auth.refreshToken) await authApi.logout(auth.refreshToken)
    } catch { /* ignore logout errors */ }
    clearAuth()
    setAuth({ user: null, accessToken: null, refreshToken: null })
  }, [auth.refreshToken])

  const hasRole = useCallback((role) => {
    return auth.user?.roles?.includes(role) ?? false
  }, [auth.user])

  const value = useMemo(() => ({
    user: auth.user,
    isAuthenticated: !!auth.accessToken,
    login,
    register,
    logout,
    hasRole,
  }), [auth.user, auth.accessToken, login, register, logout, hasRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
