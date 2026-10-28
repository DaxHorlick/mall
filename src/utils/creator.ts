const CONTROL_CHAR_RE = /[\p{Cc}]/u

export function validateDisplayName(value: string) {
  if (CONTROL_CHAR_RE.test(value)) {
    return '展示名不能包含控制字符'
  }

  const trimmed = value.trim()
  if (trimmed.length < 1 || trimmed.length > 64) {
    return '展示名长度需为 1 到 64 个字符'
  }

  return null
}

export function validateCreatorBio(value: string) {
  if (CONTROL_CHAR_RE.test(value)) {
    return '简介不能包含控制字符'
  }

  const trimmed = value.trim()
  if (trimmed.length > 500) {
    return '简介不能超过 500 个字符'
  }

  return null
}
