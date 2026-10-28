# 任务：对接创作者申请、资料和主页

你是一名资深 React + TypeScript 前端工程师。请在当前前端项目中对接已完成的创作者后端，实现申请成为创作者、查看审核状态、修改创作者资料、被拒绝后重新申请，以及公开创作者主页。先阅读现有路由、状态管理和 API 封装，沿用它们，不要另起一套请求库或状态库。

登录、注册、退出和会话恢复已经由用户认证对接完成。本任务不要重做这些流程，也不要做第二套创作者登录。当前用户只来自已有的登录态。创作者只是这个账号上的可选身份。

后端是 AI 定制服装商城，本地默认 `http://localhost:8080`。写操作依赖登录 Cookie。前端不能读写 `session_id`，也不能把会话 ID 或审核令牌写入 `localStorage`、`sessionStorage`。

## 一、请求约定

- 用户侧接口前缀：`/api/v1`
- `Content-Type: application/json`
- 跨域时每个请求都带 `credentials: "include"`（axios 为 `withCredentials: true`）
- 请求体只包含下面列出的字段。多一个字段会返回 400，`code` 为 `INVALID_ARGUMENT`，`message` 为「请求包含不支持的字段」
- 请求体上限约 8KB。格式不是合法 JSON、或 JSON 后面还有多余内容，返回 400，「请求格式不正确」
- 申请、查看自己的资料、修改资料都不要传 `user_id`。当前用户只由 Cookie 里的会话决定
- 写接口如果浏览器带了 `Origin`，该来源必须在后端允许列表中，否则 403，`code` 为 `FORBIDDEN`，`message` 为「来源不被允许」

本地默认允许的前端来源是 `http://localhost:5173`。开发服务器请用这个源，或让后端把实际源加进 `CORS_ALLOWED_ORIGINS`。

公开主页是 GET，不需要登录，也不要为了看主页先跳登录页。

## 二、统一响应

成功 HTTP 200：

```json
{
  "code": "OK",
  "message": "success",
  "data": {}
}
```

失败时 `data` 固定为 `null`。按 `code` 分支，把 `message` 直接展示给用户。

| HTTP | code | 何时出现 | message |
| --- | --- | --- | --- |
| 400 | INVALID_ARGUMENT | 字段不合法，或主页路径不是合法用户 ID | 见下文 |
| 401 | UNAUTHENTICATED | 未登录或会话失效 | 「请先登录」 |
| 403 | FORBIDDEN | 账号停用、创作者身份停用，或来源不允许 | 「账号已停用」「创作者身份已停用」或「来源不被允许」 |
| 404 | NOT_FOUND | 自己还不是创作者，或主页不可见 | 「还不是创作者」或「创作者不存在」 |
| 409 | CONFLICT | 重复申请、拒绝后直接修改、已经是创作者 | 见各接口 |
| 429 | RATE_LIMITED | 申请过于频繁 | 「尝试次数过多，请稍后再试」 |
| 500 | INTERNAL | 未预期的服务端错误 | 「内部错误」 |
| 503 | UNAVAILABLE | 限流或会话依赖不可用 | 「服务暂时不可用」 |

时间字段是 UTC 的 RFC3339 字符串。

自己的创作者资料 `data`：

```json
{
  "id": 1,
  "user_id": 42,
  "display_name": "工作室",
  "bio": "简介",
  "status": "pending",
  "reject_reason": "",
  "applied_at": "2026-10-28T01:00:00Z",
  "reviewed_at": null,
  "created_at": "2026-10-28T01:00:00Z",
  "updated_at": "2026-10-28T01:00:00Z"
}
```

- `id` 和 `user_id` 都是数字。公开链接使用 `user_id`，不要用 `id`
- `status` 只有 `pending`、`approved`、`rejected`、`disabled`
- `reviewed_at` 没有审核记录时为 `null`，字段仍在
- `bio` 和 `reject_reason` 没有内容时是空字符串，不是 `null`
- 这里没有昵称、头像、邮箱和手机号。昵称和头像仍用登录接口返回的用户资料

公开主页 `data`：

```json
{
  "user_id": 42,
  "display_name": "工作室",
  "bio": "简介",
  "nickname": "测试用户",
  "avatar_url": null,
  "status": "approved",
  "created_at": "2026-10-28T01:00:00Z"
}
```

主页上的 `nickname` 和 `avatar_url` 是账号当前值。`display_name` 和 `bio` 才是创作者资料。没有头像时 `avatar_url` 为 `null`。主页没有 `reject_reason` 和 `reviewed_at`。

## 三、字段规则

展示名：

- 去掉首尾空白后 1 到 64 个字符
- 不能含控制字符
- 不合规时 message 为「展示名长度需为 1 到 64 个字符」或「展示名不能包含控制字符」

简介：

- 可以留空
- 去掉首尾空白后不超过 500 个字符
- 不能含控制字符
- 不合规时 message 为「简介不能超过 500 个字符」或「简介不能包含控制字符」

同一用户每小时最多申请 10 次。参数错误也会计入次数。收到 429 时禁用提交并展示 message，不要立刻重试。

## 四、状态怎么展示

创作者状态和账号状态是两件事。账号停用时退出登录态。创作者身份停用时，这个人仍然是已登录买家，只是不能再申请或修改创作者资料。

| status | 页面 |
| --- | --- |
| 没有资料，`GET /creators/me` 为 404 | 申请表。message 为「还不是创作者」 |
| `pending` | 审核中。可以改展示名和简介，不能再次申请 |
| `approved` | 已通过。可以改展示名和简介。主页地址使用 `user_id` |
| `rejected` | 展示 `reject_reason`。不能直接改资料，只能重新申请 |
| `disabled` | 展示「创作者身份已停用」。不要提供申请或修改入口 |

`reviewed_at` 为 `null` 时不显示审核时间。

## 五、接口

### 1. 申请或重新申请

`POST /api/v1/creators/applications`

必须已登录。

```json
{
  "display_name": "工作室",
  "bio": "简介"
}
```

成功时 `data` 为创作者资料，`status` 为 `pending`。首次申请和被拒绝后的重新申请都用这个接口。重新申请成功后，原因被清空，`reviewed_at` 变为 `null`。

- 已经是 `pending`：409，「创作者申请正在审核」
- 已经是 `approved`：409，「已经是创作者」
- 已经是 `disabled`：403，「创作者身份已停用」

不要在请求里放 `status`。前端不能把自己改成已通过。

### 2. 我的创作者资料

`GET /api/v1/creators/me`

必须已登录。成功时 `data` 为创作者资料，包含 `status` 和 `reject_reason`。

没有资料时 404，「还不是创作者」。这表示用户已登录但还没申请，不要当成未登录，也不要清掉用户状态。

未登录仍是 401，「请先登录」。

### 3. 修改我的创作者资料

`PATCH /api/v1/creators/me`

必须已登录。只提交要改的字段。两个字段都省略时，接口返回当前资料，不报错。

```json
{ "display_name": "新展示名" }
```

```json
{ "bio": "新简介" }
```

不能提交 `id`、`user_id`、`status`、`reject_reason`、`applied_at`、`reviewed_at`、`created_at`、`updated_at`。

- `pending` 或 `approved`：修改成功，状态不变
- 没有资料：404，「还不是创作者」
- `rejected`：409，「申请已被拒绝，请重新申请」
- `disabled`：403，「创作者身份已停用」

### 4. 创作者主页

`GET /api/v1/creators/{user_id}`

不需要登录。`user_id` 是用户 ID，不是创作者资料的 `id`。

只有已通过审核且账号可用时返回 200，`status` 固定为 `approved`。

以下情况都是 404，「创作者不存在」，页面用同一种“创作者不存在”即可，不要根据猜测区分待审核、已拒绝或已停用：

- 路径不是正整数，或为 0：这是 400，「用户 ID 不正确」
- 没有创作者资料
- 状态不是 `approved`
- 账号已停用

主页只展示资料、昵称和头像。不要请求作品、商品或评价列表，后端没有这些数据。

## 六、页面与状态

至少完成这些流程：

1. 已登录且 `GET /api/v1/creators/me` 返回 404 时，进入申请页。提交成功后用响应 `data` 显示审核中。
2. `pending` 时展示审核中，并允许修改展示名和简介。修改成功后用响应 `data` 替换当前创作者资料。
3. `approved` 时展示已通过，允许修改资料，并给出公开主页链接 `/creators/{user_id}`。这里的 `user_id` 来自资料里的 `user_id`。
4. `rejected` 时展示 `reject_reason` 和重新申请表。重新申请走 `POST /api/v1/creators/applications`，不要走 PATCH。
5. `disabled` 时只展示「创作者身份已停用」。用户仍然保持登录。
6. 公开主页按路径中的用户 ID 请求 `GET /api/v1/creators/{user_id}`。200 时展示 `display_name`、`bio`、`nickname` 和 `avatar_url`。404 时展示「创作者不存在」。
7. 这些接口返回 401 时，沿用现有逻辑清空登录态并进入登录页。403 且 message 为「账号已停用」时同样退出登录态。403 且 message 为「创作者身份已停用」时不要退出登录。

表单在浏览器侧做同样的长度和字符校验。提交中禁用按钮，避免重复申请触发限流。

进入创作者中心时先确认登录态，再请求 `/api/v1/creators/me`。不要只用本地缓存判断是不是创作者。

## 七、不要做的事

- 不要调用 `POST /internal/v1/creators/{user_id}/review`。那是内部审核接口，不面向用户站点。
- 不要在前端保存或传递 `X-Internal-Token`。
- 不要做创作者注册、创作者密码或单独的创作者 Cookie。
- 不要用创作者资料的 `id` 打开主页。
- 不要在主页上区分“审核中”“已拒绝”“已停用”。对外都是不存在。
- 不要实现设计作品、社区作品、商品、订单或收益。后端还没有这些接口。
- 不要把未实际跑通的页面说成已经对接完成。

## 八、自测

后端需已启动，数据库迁移版本至少为 2，且 CORS 允许当前前端源。用一个已登录账号确认：

1. 未申请时打开创作者中心，看到申请表，而不是登录页。
2. 提交合法申请后状态为 `pending`，`reviewed_at` 为空。同一账号再申请，展示「创作者申请正在审核」。
3. 请求体夹带 `status` 或 `user_id` 时被拒绝，页面上的状态不变。
4. 审核通过后，用资料里的 `user_id` 打开主页能看到展示名、简介、昵称和头像。用资料 `id` 打开主页得到「创作者不存在」，除非它碰巧等于用户 ID。
5. 未登录可以直接打开一个已通过创作者的主页。
6. 待审核创作者的主页与一个不存在的用户 ID 显示同一句「创作者不存在」。
7. 退出登录后再访问 `/api/v1/creators/me` 为 401，申请页进入登录页。
8. 跨域环境下写请求带 Cookie，且没有 CORS 报错。
