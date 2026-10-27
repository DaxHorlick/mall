import { App } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout as logoutRequest } from '../api/auth.ts'
import { ApiError, getErrorMessage } from '../api/client.ts'
import { useAuthStore } from '../stores/auth.ts'

export function useLogout() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const setAnonymous = useAuthStore((s) => s.setAnonymous)
  const [pending, setPending] = useState(false)

  const logout = async () => {
    if (pending) {
      return
    }

    setPending(true)

    try {
      await logoutRequest()
      setAnonymous()
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setAnonymous()
        message.warning(err.message)
        navigate('/', { replace: true })
        return
      }

      message.error(getErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  return { logout, pending }
}
