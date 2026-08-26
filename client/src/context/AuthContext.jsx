import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { clearSessionMarker, hasSessionMarker, setSessionMarker } from '../api/client'
import { authService } from '../api/services'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!hasSessionMarker()) {
      setUser(null)
      setLoading(false)
      return null
    }

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
      if (!hasSessionMarker()) {
        setLoading(false)
        return
      }

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

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setLoading(false)
    }

    window.addEventListener('babycure:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('babycure:unauthorized', handleUnauthorized)
  }, [])

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload)
    setSessionMarker()
    setUser(response.user)
    toast.success('Account created successfully')
    return response
  }, [])

  const login = useCallback(async (payload) => {
    const response = await authService.login(payload)
    setSessionMarker()
    setUser(response.user)
    toast.success('Logged in successfully')
    return response
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearSessionMarker()
      setUser(null)
    }
    toast.success('Logged out successfully')
  }, [])

  const sendPhoneOtp = useCallback(async (payload) => {
    const response = await authService.sendPhoneOtp(payload)
    toast.success('OTP sent successfully')
    return response
  }, [])

  const verifyPhoneOtp = useCallback(async (payload) => {
    const response = await authService.verifyPhoneOtp(payload)
    setSessionMarker()
    setUser(response.user)
    toast.success('Phone verified successfully')
    return response
  }, [])

  const sendPasswordResetOtp = useCallback(async (payload) => {
    const response = await authService.sendPasswordResetOtp(payload)
    toast.success('Password reset OTP sent to your registered email')
    return response
  }, [])

  const resetPassword = useCallback(async (payload) => {
    const response = await authService.resetPassword(payload)
    toast.success('Password reset successfully')
    return response
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const response = await authService.updateProfile(payload)
    setUser(response.user)
    toast.success('Profile updated successfully')
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
      updateProfile,
      verifyPhoneOtp,
    }),
    [loading, login, logout, refreshUser, register, resetPassword, sendPasswordResetOtp, sendPhoneOtp, updateProfile, user, verifyPhoneOtp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
