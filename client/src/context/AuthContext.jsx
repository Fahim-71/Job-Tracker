import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { TOKEN_KEY, LOGOUT_EVENT } from '../api/axios'

const AuthContext = createContext(null)

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [user, setUser] = useState(null)
  // With a stored token we don't know the user yet, so wait for /auth/me.
  const [loading, setLoading] = useState(() => Boolean(readToken()))

  const saveSession = useCallback(({ token: newToken, user: newUser }) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post('/auth/login', { email, password })
      saveSession(data)
      return data.user
    },
    [saveSession],
  )

  const register = useCallback(
    async (name, email, password) => {
      const { data } = await api.post('/auth/register', { name, email, password })
      saveSession(data)
      return data.user
    },
    [saveSession],
  )

  // Restore the user for a token left in localStorage from a previous visit.
  useEffect(() => {
    if (!readToken()) return
    let cancelled = false
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!cancelled) setUser(data.user)
      })
      .catch((err) => {
        // 401 is handled by the interceptor event; other errors (server down)
        // keep the token so a refresh can recover.
        if (!cancelled && err.response?.status === 401) logout()
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [logout])

  // The Axios interceptor fires this when the server rejects our token.
  useEffect(() => {
    window.addEventListener(LOGOUT_EVENT, logout)
    return () => window.removeEventListener(LOGOUT_EVENT, logout)
  }, [logout])

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
