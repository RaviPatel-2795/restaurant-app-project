import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [authedTenants, setAuthedTenants] = useState(() => {
    try {
      const raw = localStorage.getItem('admin.authedTenants')
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('admin.authedTenants', JSON.stringify(Array.from(authedTenants)))
    } catch {
      console.error('Failed to save authed tenants to localStorage')
    }
  }, [authedTenants])

  const value = useMemo(() => ({
    isAuthed: (restaurantId) => authedTenants.has(restaurantId),
    login: (restaurantId) => setAuthedTenants(prev => new Set(prev).add(restaurantId)),
    logout: (restaurantId) => setAuthedTenants(prev => {
      const next = new Set(prev)
      next.delete(restaurantId)
      return next
    }),
  }), [authedTenants])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
