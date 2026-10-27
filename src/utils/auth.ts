import type { IdentityType } from '../types/auth.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONTROL_CHAR_RE = /[\p{Cc}]/u

export function normalizeIdentifier(type: IdentityType, value: string) {
  const trimmed = value.trim()
  return type === 'email' ? trimmed.toLowerCase() : trimmed
}

export function validateNickname(value: string) {
  if (CONTROL_CHAR_RE.test(value)) {
    return '昵称不能包含控制字符'
  }

  const trimmed = value.trim()
  if (trimmed.length < 1 || trimmed.length > 64) {
    return '昵称长度需为 1 到 64 个字符'
  }

  return null
}

export function validateEmail(value: string) {
  const trimmed = value.trim()
  if (
    trimmed.length < 1 ||
    trimmed.length > 128 ||
    /\s/.test(trimmed) ||
    !EMAIL_RE.test(trimmed)
  ) {
    return '邮箱格式不正确'
  }

  return null
}

export function validatePhone(value: string) {
  const compact = value.trim().replace(/[\s-]/g, '')
  const normalized = compact.replace(/^(?:\+86|0086|86)/, '')

  if (!/^1[3-9]\d{9}$/.test(normalized)) {
    return '手机号格式不正确'
  }

  return null
}

export function validateIdentifier(type: IdentityType, value: string) {
  if (type === 'email') {
    return validateEmail(value)
  }

  if (type === 'phone') {
    return validatePhone(value)
  }

  return '身份类型只支持 email 或 phone'
}

export function validatePassword(value: string) {
  const characters = Array.from(value).length
  const bytes = new TextEncoder().encode(value).length

  if (characters < 8 || bytes > 72) {
    return '密码至少 8 个字符，且不超过 72 字节'
  }

  return null
}

export function validateAvatarUrl(value: string) {
  if (!value || value.length > 512 || /[\s]/.test(value)) {
    return '头像地址不正确'
  }

  try {
    const url = new URL(value)
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return '头像地址不正确'
    }
  } catch {
    return '头像地址不正确'
  }

  return null
}

/** 只允许站内相对路径，避免登录后被带到外部地址。 */
export function safeReturnPath(value: unknown) {
  if (typeof value !== 'string') {
    return '/'
  }

  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/'
  }

  if (value.startsWith('/login') || value.startsWith('/register')) {
    return '/'
  }

  return value
}
