# 任务：对接 AI 定制服装商城「用户注册」接口

你是一名前端工程师。请根据下列后端契约，实现注册页（或注册 API 封装），不要自行发明字段、状态码或鉴权方式。

## 接口概览

- 方法：`POST`
- 路径：`/api/v1/auth/register`
- Content-Type：`application/json`
- 成功后：**自动登录**（服务端写入 `HttpOnly` Cookie `session_id`）
- 本阶段：**不发送验证码**，也不校验手机号/邮箱是否归本人所有
- 响应体中：**不会**返回 Session ID、密码或密码哈希

本地默认基址示例：`http://127.0.0.1:8080`

## 请求体

只允许以下 4 个字段，禁止多传未知字段（多传会 400）：

```json
{
  "nickname": "测试用户",
  "identity_type": "email",
  "identifier": "test@example.com",
  "password": "password1"
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `nickname` | string | 是 | 昵称，trim 后 1–64 个字符，不能含控制字符 |
| `identity_type` | string | 是 | 仅支持 `"email"` 或 `"phone"` |
| `identifier` | string | 是 | 登录标识。邮箱会转小写；手机号按中国大陆 11 位保存，可带 `+86`/`86`/`0086` 前缀（服务端会去掉） |
| `password` | string | 是 | 至少 8 个字符，最长 72 字节 |

手机号注册示例：

```json
{
  "nickname": "测试用户",
  "identity_type": "phone",
  "identifier": "13800138000",
  "password": "password1"
}
```

## 统一响应结构

```ts
type ApiBody<T> = {
  code: string;
  message: string;
  data: T | null;
};
```

### 成功（HTTP 200）

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "id": 1,
    "nickname": "测试用户",
    "avatar_url": null,
    "status": "active",
    "last_login_at": "2026-10-26T12:00:00Z",
    "created_at": "2026-10-26T12:00:00Z"
  }
}
```

成功后浏览器会收到 Cookie：`session_id`（HttpOnly）。后续需登录的接口依赖该 Cookie，**不要**自己存 token 到 localStorage。

### 失败（data 固定为 null）

| HTTP | code | 典型 message | 前端处理建议 |
| --- | --- | --- | --- |
| 400 | `INVALID_ARGUMENT` | 昵称/身份类型/邮箱/手机号/密码等校验文案，或「请求格式不正确」「请求包含不支持的字段」 | 表单字段旁展示 `message` |
| 409 | `CONFLICT` | 该邮箱或手机号已注册 | 提示改用登录或更换标识 |
| 429 | `RATE_LIMITED` | 尝试次数过多，请稍后再试 | 同一 IP 每小时最多注册 20 次；禁用按钮并提示稍后重试 |
| 503 | `UNAVAILABLE` | 服务暂时不可用 / 账号已创建，会话暂时不可用，请稍后登录 | 后者说明账号可能已写入，引导去登录 |
| 500 | `INTERNAL` | 内部错误 | 通用错误提示 |

常见 400 message（可按原文匹配展示）：

- `昵称长度需为 1 到 64 个字符`
- `昵称不能包含控制字符`
- `身份类型只支持 email 或 phone`
- `邮箱格式不正确`
- `手机号格式不正确`
- `密码至少 8 个字符，且不超过 72 字节`
- `请求格式不正确`
- `请求包含不支持的字段`

## 请求发送要求（非常重要）

1. 必须带 Cookie：`credentials: 'include'`（fetch）或 `withCredentials: true`（axios）。
2. Header：`Content-Type: application/json`。
3. Body 只序列化上述 4 个字段；不要传 `id`、`status`、`user_id` 等。
4. 跨域时：前端 Origin 必须在后端 `CORS_ALLOWED_ORIGINS` 白名单中；Cookie 默认 `SameSite=Lax`、`HttpOnly`。跨站 HTTPS 场景需后端配置 `SameSite=None` + `Secure`。
5. 不要在前端持久化 `session_id`（读不到，也不该读）。

### fetch 示例

```ts
const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nickname,
    identity_type: identityType, // 'email' | 'phone'
    identifier,
    password,
  }),
});
const body = await res.json();
if (!res.ok || body.code !== 'OK') {
  // 用 body.message 提示用户
  throw new Error(body.message || '注册失败');
}
// body.data 即为当前用户；已自动登录，可跳转首页或拉取 /api/v1/auth/me
```

## 前端校验（提交前建议做，最终以后端为准）

- 昵称：非空，≤64 字符
- `identity_type` 切换时同步校验 `identifier`（邮箱 / 大陆手机号）
- 密码：≥8 字符；可提示「不超过 72 字节」（中文等多字节字符要小心）
- 提交中禁用按钮，防重复点击；429 时给出冷却提示

## 注册成功后的产品行为

1. 用返回的 `data` 写入全局用户状态（或再调 `GET /api/v1/auth/me` 确认会话）。
2. 跳转已登录落地页（例如首页），不要再强制跳登录页。
3. 若返回 503 且 message 含「账号已创建，会话暂时不可用」，提示用户稍后用同一账号去登录页登录。

## 表单 UX 建议

- 支持「邮箱注册 / 手机号注册」切换，切换时清空对方标识输入。
- 错误优先展示接口 `message`，不要只写「请求失败」。
- 409 提供「去登录」入口。
- 暂不展示验证码输入框（后端未提供）。

## 验收清单

- [ ] 邮箱/手机号两种注册都能成功，且后续带 Cookie 请求 `GET /api/v1/auth/me` 成功
- [ ] 重复注册返回 409 并正确提示
- [ ] 非法字段/未知字段返回 400 并展示后端文案
- [ ] 请求使用 `credentials: 'include'`，未把 session 存进 localStorage
- [ ] 未多传后端不支持的字段
