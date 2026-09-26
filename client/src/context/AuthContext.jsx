import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { clearSessionMarker, hasSessionMarker, setSessionMarker } from '../api/client'
import { authService } from '../api/services'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  const refreshUser = useCallback(async () => {
    if (!hasSessionMarker()) {
      setUser(null)
      setSessionError('')
      setLoading(false)
      return null
    }

    try {
      const response = await authService.me()
      setUser(response.user)
      setSessionError('')
      return response.user
    } catch (error) {
      if (error.status === 401 || error.status === 403) { setUser(null); setSessionError('') }
      else setSessionError('We could not reconnect to your account. Your login has been kept on this device.')
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
      } catch (error) {
        if (active) {
          if (error.status === 401 || error.status === 403) setUser(null)
          else setSessionError('We could not reconnect to your account. Your login has been kept on this device.')
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

    const handleStorage = (event) => {
      if (event.key === 'babycure:has-session') {
        if (hasSessionMarker()) refreshUser()
        else handleUnauthorized()
      }
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('babycure:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('babycure:unauthorized', handleUnauthorized)
    }
  }, [refreshUser])

  const verifyLoginOtp = useCallback(async (payload) => {
    const response = await authService.verifyLoginOtp(payload)
    setSessionMarker()
    setUser(response.user)
    toast.success('Welcome to BabyCure', { id: 'auth' })
    return response
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    clearSessionMarker()
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const sendPasswordResetOtp = useCallback(async (payload) => {
    const response = await authService.sendPasswordResetOtp(payload)
    toast.success(response.message || 'If this email is registered, a password reset OTP has been sent.')
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
      verifyLoginOtp,
      logout,
      refreshUser,
      resetPassword,
      sendPasswordResetOtp,
      user,
      updateProfile,
    }),
    [loading, verifyLoginOtp, logout, refreshUser, resetPassword, sendPasswordResetOtp, updateProfile, user],
  )

  return <AuthContext.Provider value={value}>{sessionError ? <div className="mx-auto my-16 max-w-md rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-bold text-brand-ink">Let’s reconnect</h1><p role="status" className="mt-3 text-sm text-slate-500">{sessionError}</p><button type="button" className="mt-5 rounded-full bg-brand-blue px-6 py-3 font-semibold text-white disabled:opacity-50" disabled={loading} onClick={async () => { setLoading(true); await refreshUser() }}>{loading ? 'Reconnecting...' : 'Try again'}</button></div> : children}</AuthContext.Provider>
}
