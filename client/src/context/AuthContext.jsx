import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { authService } from '../api/services'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.me()
      setUser(response.user)
      return response.user
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      try {
        const response = await authService.me()
        if (active) {
          setUser(response.user)
        }
      } catch {
        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      active = false
    }
  }, [])

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload)
    setUser(response.user)
    toast.success('Account created successfully')
    return response
  }, [])

  const login = useCallback(async (payload) => {
    const response = await authService.login(payload)
    setUser(response.user)
    toast.success('Logged in successfully')
    return response
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const sendPhoneOtp = useCallback(async (payload) => {
    const response = await authService.sendPhoneOtp(payload)
    toast.success('OTP sent successfully')
    return response
  }, [])

  const verifyPhoneOtp = useCallback(async (payload) => {
    const response = await authService.verifyPhoneOtp(payload)
    setUser(response.user)
    toast.success('Phone verified successfully')
    return response
  }, [])

  const sendPasswordResetOtp = useCallback(async (payload) => {
    const response = await authService.sendPasswordResetOtp(payload)
    toast.success('Password reset OTP sent to your email')
    return response
  }, [])

  const resetPassword = useCallback(async (payload) => {
    const response = await authService.resetPassword(payload)
    toast.success('Password reset successfully')
    return response
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      refreshUser,
      register,
      resetPassword,
      sendPasswordResetOtp,
      sendPhoneOtp,
      user,
      verifyPhoneOtp,
    }),
    [loading, login, logout, refreshUser, register, resetPassword, sendPasswordResetOtp, sendPhoneOtp, user, verifyPhoneOtp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
