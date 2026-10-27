import { App } from 'antd'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAccountDisabled, setAuthFailureHandler } from '../../api/client.ts'
import { useAuthStore } from '../../stores/auth.ts'

/** 已登录后的业务请求若会话失效或账号停用，清空内存态并进入登录页。 */
export function AuthSessionSync() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const setAnonymous = useAuthStore((s) => s.setAnonymous)

  useEffect(() => {
    setAuthFailureHandler((error) => {
      setAnonymous()
      message.error(error.message)

      if (window.location.pathname === '/login') {
        return
      }

      const from = `${window.location.pathname}${window.location.search}`
      navigate('/login', {
        replace: true,
        state: isAccountDisabled(error) ? undefined : { from },
      })
    })

    return () => {
      setAuthFailureHandler(null)
    }
  }, [message, navigate, setAnonymous])

  return null
}
