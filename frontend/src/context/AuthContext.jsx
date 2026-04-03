import { createContext, useContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (authData) => {
    setToken(authData.accessToken)
    setUser({
      userId: authData.userId,
      username: authData.username,
      fullName: authData.fullName,
      email: authData.email,
      roles: authData.roles,
    })
    localStorage.setItem('accessToken', authData.accessToken)
    localStorage.setItem('refreshToken', authData.refreshToken)
    localStorage.setItem('user', JSON.stringify({
      userId: authData.userId,
      username: authData.username,
      fullName: authData.fullName,
      email: authData.email,
      roles: authData.roles,
    }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  const hasRole = (role) => user?.roles?.includes(role)

  const isAdmin = () => hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN')
  const isVet = () => hasRole('ROLE_VET_OFFICER')
  const isFarmer = () => hasRole('ROLE_FARMER')
  const isOfficer = () => hasRole('ROLE_DISTRICT_OFFICER') || hasRole('ROLE_STATE_OFFICER')

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      hasRole, isAdmin, isVet, isFarmer, isOfficer
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}