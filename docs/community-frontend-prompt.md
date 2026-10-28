# 任务：对接创作手记、评论和点赞

你是一名资深 React + TypeScript 前端工程师。请在当前前端项目中对接社区后端，实现保存手记草稿、修改正文、提交审核、撤回已发布手记、浏览公开手记、评论、点赞和取消点赞。先阅读现有路由、状态管理和 API 封装，沿用它们，不要另起一套请求库或状态库。

登录、注册、退出和会话恢复已经由用户认证对接完成。创作者申请和设计作品已经单独对接。本任务不要重做这些流程。手记草稿不要求用户已经通过创作者审核：任意已登录且账号可用的用户，都可以为自己拥有的设计保存草稿。提交审核时，后端才检查创作者身份和设计是否已经公开通过。

后端是 AI 定制服装商城，本地默认 `http://localhost:8080`。写操作依赖登录 Cookie。前端不能读写 `session_id`，也不能把会话 ID、审核令牌写入 `localStorage`、`sessionStorage`。

一篇手记绑定一件设计。正文是给别人看的创作说明，不是设计上的模型提示词。发布手记不会创建商品，也不会把设计改成公开。

## 一、请求约定

- 用户侧接口前缀：`/api/v1`
- `Content-Type: application/json`
- 跨域时每个请求都带 `credentials: "include"`（axios 为 `withCredentials: true`）
- 请求体只包含下面列出的字段。多一个字段会返回 400，`code` 为 `INVALID_ARGUMENT`，`message` 为「请求包含不支持的字段」
- 创建和修改手记的请求体上限约 32KB，评论约 8KB。格式不是合法 JSON、或 JSON 后面还有多余内容，返回 400，「请求格式不正确」
- 不要传 `author_user_id`、`user_id`、`status`、`reject_reason` 来表示当前用户或审核结果。当前用户只由 Cookie 里的会话决定。公开列表上的 `author_user_id` 只用来筛选作者
- 写接口如果浏览器带了 `Origin`，该来源必须在后端允许列表中，否则 403，`code` 为 `FORBIDDEN`，`message` 为「来源不被允许」。GET 不检查 `Origin`

本地默认允许的前端来源是 `http://localhost:5173`。开发服务器请用这个源，或让后端把实际源加进 `CORS_ALLOWED_ORIGINS`。

公开手记列表是 `GET /api/v1/community/posts`，单篇公开页是 `GET /api/v1/community/posts/{id}`。这两个请求在手记已公开时都不需要登录。列表可以按 `author_user_id` 筛选，不能搜索，也不能按设计或状态筛选。

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
| 400 | INVALID_ARGUMENT | 字段不合法，或路径里的 ID 不是正整数 | 见下文 |
| 401 | UNAUTHENTICATED | 未登录或会话失效 | 「请先登录」 |
| 403 | FORBIDDEN | 账号停用、创作者身份停用，或来源不允许 | 「账号已停用」「创作者身份已停用」或「来源不被允许」 |
| 404 | NOT_FOUND | 设计不可用，或手记不可见 | 「设计不存在」或「手记不存在」 |
| 409 | CONFLICT | 状态或公开条件不允许当前操作 | 见各接口 |
| 429 | RATE_LIMITED | 创建、评论或点赞过于频繁 | 「尝试次数过多，请稍后再试」 |
| 500 | INTERNAL | 未预期的服务端错误 | 「内部错误」 |
| 503 | UNAVAILABLE | 限流依赖不可用 | 「服务暂时不可用」 |

时间字段是 UTC 的 RFC3339 字符串。`id`、`design_id`、`author_user_id`、`user_id`、`like_count`、`comment_count` 都是数字。`liked` 是布尔值，不是 `0` 或 `1`。

自己的手记 `data`。响应里能看到 `reject_reason` 时，就是这一种完整资料：

```json
{
  "id": 1,
  "design_id": 10,
  "author_user_id": 42,
  "body": "这件衣服的蓝色来自瓷片",
  "status": "draft",
  "reject_reason": "",
  "like_count": 0,
  "liked": false,
  "comment_count": 0,
  "design": {
    "id": 10,
    "title": "夏季图案",
    "visibility": "private",
    "review_status": "draft",
    "result": null,
    "preview": null
  },
  "published_at": null,
  "reviewed_at": null,
  "created_at": "2026-10-28T01:00:00Z",
  "updated_at": "2026-10-28T01:00:00Z"
}
```

- `status` 只有 `draft`、`pending`、`published`、`rejected`、`hidden`
- `reject_reason` 没有内容时是空字符串，不是 `null`
- `published_at`、`reviewed_at` 没有值时为 `null`，字段仍在
- `like_count` 是点赞行数。`comment_count` 只数仍然可见的评论
- 设计卡片里的 `result` 没有图时为 `null`。有图时含 `object_key`、`url`、`content_type`、`bytes`、`width`、`height`
- `preview` 没有图时为 `null`。有图时只有 `object_key` 和 `url`
- 完整资料没有作者展示名。作者就是当前用户

公开手记 `data`。没有 `reject_reason`、`reviewed_at`、`updated_at`，设计卡片也没有 `visibility` 和 `review_status`：

```json
{
  "id": 1,
  "design_id": 10,
  "author_user_id": 42,
  "body": "这件衣服的蓝色来自瓷片",
  "status": "published",
  "like_count": 2,
  "liked": false,
  "comment_count": 1,
  "design": {
    "id": 10,
    "title": "夏季图案",
    "result": null,
    "preview": null
  },
  "author": {
    "user_id": 42,
    "display_name": "工作室",
    "nickname": "测试用户",
    "avatar_url": null
  },
  "published_at": "2026-10-28T02:00:00Z",
  "created_at": "2026-10-28T01:00:00Z"
}
```

用响应里有没有 `reject_reason` 区分完整资料和公开资料。公开页不要根据缺失字段去补拒绝原因或审核时间。`author.display_name` 是创作者展示名，`nickname` 和 `avatar_url` 是账号当前值。没有头像时 `avatar_url` 为 `null`。公开资料的 `status` 固定为 `published`。未登录时 `liked` 为 `false`。

页面上的设计图地址用 `result.url` 或 `preview.url`。没有成品图时展示设计标题，不要改写成别的图片。

评论 `data`：

```json
{
  "id": 5,
  "post_id": 1,
  "user_id": 7,
  "nickname": "买家",
  "avatar_url": null,
  "content": "好看",
  "created_at": "2026-10-28T03:00:00Z"
}
```

评论没有状态字段。昵称为空字符串时仍然展示这条评论，头像按没有头像处理。

列表 `data` 形如 `{ "items": [] }`。没有数据时 `items` 是空数组，不是 `null`。公开手记按 `published_at` 从新到旧。我的手记按 `created_at` 从新到旧。评论列表在响应里按 `created_at` 从早到晚，没有下一页游标。`limit` 只表示最多取最新的若干条，列表可以短于 `limit`。

## 三、字段规则

正文：

- 去掉首尾空白后 0 到 8000 个字符
- 允许换行、回车和制表符，其他控制字符不行
- 不合规时 message 为「正文不能超过 8000 个字符」或「正文不能包含控制字符」
- 提交审核时，空白正文的 message 为「正文不能为空」

评论：

- 去掉首尾空白后 1 到 500 个字符
- 允许换行、回车和制表符，其他控制字符不行
- 不合规时 message 为「评论长度需为 1 到 500 个字符」或「评论不能包含控制字符」

`design_id` 必须是正整数。不合规时 message 为「设计 ID 不正确」。

同一用户每小时最多创建 20 篇手记、发表 30 条评论。点赞和取消点赞共享每小时 60 次。字段不合法也会计入次数。修改正文、提交审核和撤回不单独限流。收到 429 时禁用对应按钮并展示 message，不要立刻重试。

## 四、状态怎么展示

手记状态和设计的审核状态是两件事。设计卡片上的 `visibility`、`review_status` 只说明这件设计现在能不能被手记公开引用。提交手记不会改变设计。

| status | 页面 |
| --- | --- |
| `draft` | 草稿。可以改正文，可以提交审核。不提供评论框和点赞 |
| `pending` | 审核中。不要提供修改、提交、撤回、评论和点赞。这些操作会返回 409，「手记正在审核」或「当前状态不允许该操作」 |
| `published` | 已发布。不要直接改正文。提供撤回。撤回前说明：撤回后手记离开公开列表，已有评论和点赞会保留。可以评论和点赞 |
| `rejected` | 展示 `reject_reason`。可以改正文，再用提交接口重新送审。不提供评论框和点赞 |
| `hidden` | 展示「手记已下架」。不要提供修改、提交、撤回、评论和点赞 |

`published_at` 或 `reviewed_at` 为 `null` 时不显示对应时间。

提交审核前，页面可以根据已有资料提前提示，但服务端 message 仍是最终结果：

- 创作者资料不存在，或创作者状态不是 `approved`：提交会得到 409，「公开手记需要已通过审核的创作者」。身份停用则是 403，「创作者身份已停用」，此时不要退出登录
- 设计不是 `public`，或设计 `review_status` 不是 `approved`：提交会得到 409，「公开手记的设计必须已公开并通过审核」
- 正文为空：400，「正文不能为空」

已发布之后，如果设计不再公开，作者打开自己的手记仍能看到完整资料，但评论和点赞会返回 409。展示该 message，不要把 `status` 在本地改成草稿。

## 五、接口

### 1. 创建手记

`POST /api/v1/community/posts`

必须已登录。

```json
{
  "design_id": 10,
  "body": "这件衣服的蓝色来自瓷片"
}
```

`body` 可以省略。成功时 `data` 为完整手记，`status` 为 `draft`。

设计不存在，或设计不属于当前用户时，message 为「设计不存在」。这件设计已经有手记时，message 为「这件设计已经有创作手记」。

创建页的设计列表用已有的 `GET /api/v1/designs`。我的手记里已经出现过的 `design_id` 不要再放进可选列表。用户仍提交时，展示服务端的 409。

### 2. 我的手记

`GET /api/v1/community/posts/mine?limit=20`

必须已登录。`limit` 省略时为 20，允许 1 到 50。其他值返回 400，「数量不正确」。

`data.items` 是当前用户自己的手记，包含草稿、审核中、已发布、已拒绝和已下架，每项都是完整资料。

### 3. 公开手记列表

`GET /api/v1/community/posts?limit=20`

不需要登录。`limit` 规则与上一接口相同。

`data.items` 只包含已发布、创作者已通过、设计已公开且审核通过、作者账号可用的手记。每项是公开资料。没有数据时 `items` 是空数组。

创作者主页要看这位作者的手记时，加上查询参数，例如 `GET /api/v1/community/posts?author_user_id=42`。这里的 `42` 是创作者资料里的 `user_id`，不是创作者资料的 `id`。空数组表示没有公开手记，主页资料接口若返回 200，不要把空列表当成「创作者不存在」。

不要传搜索词、`design_id` 或 `status`。后端会忽略这些查询参数。

### 4. 读取一篇手记

`GET /api/v1/community/posts/{id}`

路径不是正整数或为 0 时返回 400，「手记 ID 不正确」。

已登录且是作者：返回完整资料。未带会话，或调用方不是作者：只有公开条件全部成立时返回公开资料。

以下情况都是 404，「手记不存在」。页面用同一种“手记不存在”即可：

- 手记不存在
- 调用方不是作者，且手记未公开，或创作者未通过，或设计未公开、未通过，或作者账号已停用

会话 Cookie 无效时是 401，「请先登录」，服务端会清掉无效 Cookie。已登录但账号停用时是 403，「账号已停用」。这两种都沿用现有登录态处理，不要显示成“手记不存在”。

### 5. 修改正文

`PATCH /api/v1/community/posts/{id}`

必须已登录，且只能改自己的手记。只提交要改的字段。

```json
{ "body": "补充一句配色说明" }
```

不能提交 `design_id` 来换成另一件设计。

- `pending`：409，「手记正在审核」
- `published`：409，「已发布的手记不能修改正文」
- `hidden`：409，「手记已下架」
- 不是自己的手记，或手记不存在：404，「手记不存在」

### 6. 提交审核

`POST /api/v1/community/posts/{id}/submissions`

必须已登录。无请求体。

只有 `draft` 或 `rejected` 可以提交。成功后 `status` 为 `pending`，`reject_reason` 为空字符串，`reviewed_at` 为 `null`。用响应 `data` 替换当前手记。

`pending` 时 message 为「手记正在审核」。`published` 或 `hidden` 时 message 为「当前状态不允许该操作」。

### 7. 撤回已发布手记

`POST /api/v1/community/posts/{id}/withdrawals`

必须已登录。无请求体。只有 `published` 可以撤回。成功后 `status` 为 `draft`，公开列表不再出现这篇手记。

`pending` 时 message 为「手记正在审核」。`hidden` 时 message 为「手记已下架」。其他不允许的状态 message 为「当前状态不允许该操作」。

### 8. 发表评论

`POST /api/v1/community/posts/{id}/comments`

必须已登录。

```json
{ "content": "好看" }
```

成功时把返回的评论接到当前评论列表末尾，并把手记的 `comment_count` 加 1。不要再发一条带 `user_id` 或 `status` 的请求。

手记对作者以外的人不可见时，message 为「手记不存在」。作者对自己尚未公开的手记评论时，message 为「当前状态不允许评论」。

### 9. 评论列表

`GET /api/v1/community/posts/{id}/comments?limit=20`

手记已公开时不需要登录。`limit` 省略时为 20，允许 1 到 50。其他值返回 400，「数量不正确」。

`data.items` 只包含未被屏蔽的评论，按创建时间从早到晚。作者查看自己的手记时，手记未公开也可以拉这份列表。其他人在手记不可见时得到 404，「手记不存在」，评论区展示这句文案即可。

没有删除评论或恢复评论的接口。不要提供删除按钮。

### 10. 点赞

`POST /api/v1/community/posts/{id}/likes`

必须已登录。无请求体。成功时 `data` 是更新后的手记，`liked` 为 `true`。已经点过赞时再点一次，仍然是已赞，不要把它当成失败。

作者看到的响应带 `reject_reason`，其他人的响应不带。用有没有 `reject_reason` 决定替换后的页面仍是作者页还是公开页。

手记对作者以外的人不可见时，message 为「手记不存在」。作者对尚未公开的手记点赞时，message 为「当前状态不允许点赞」。

### 11. 取消点赞

`DELETE /api/v1/community/posts/{id}/likes`

必须已登录。无请求体。成功时 `data` 是更新后的手记，`liked` 为 `false`。本来就没有赞也按成功处理。可见性错误与点赞相同。

## 六、页面与状态

至少完成这些流程：

1. 公开手记流请求 `GET /api/v1/community/posts`。空数组展示空状态。每项展示正文、设计标题、成品图或预览图、作者展示名、点赞数和评论数。
2. 创作者公开主页继续用 `GET /api/v1/creators/{user_id}` 展示资料。资料返回 200 后，再请求 `GET /api/v1/community/posts?author_user_id={user_id}`。不要改创作者资料接口的解析，也不要在资料响应里找手记数组。
3. 我的手记请求 `GET /api/v1/community/posts/mine`。空数组展示空状态。每项展示正文摘要、设计标题、手记状态和拒绝原因。
4. 创建页从我的设计里选择一件还没有手记的设计，正文可空。提交成功后进入该手记的作者页，资料用响应 `data`。
5. 详情页先请求 `GET /api/v1/community/posts/{id}`。有 `reject_reason` 时按作者页渲染；没有时按公开页渲染。公开页展示作者、正文和设计卡片。404 时展示「手记不存在」。
6. `draft` 和 `rejected` 时可以保存正文。保存成功后用响应 `data` 替换当前手记。`rejected` 时展示 `reject_reason`。
7. `draft` 或 `rejected`，且作者确认要送审时，调用提交接口。成功后进入审核中，并收起编辑。
8. `published` 时展示撤回。成功后页面变为草稿，并重新拉取评论列表。
9. `hidden` 时只展示下架说明和现有正文、设计卡片。不提供编辑和互动按钮。
10. 手记 `status` 为 `published` 时展示评论列表、评论框、点赞和取消点赞。点赞按钮按 `liked` 切换 POST 和 DELETE。成功后用返回的手记替换当前页，并保持作者页或公开页的区分。
11. 未登录点击评论或点赞时，沿用现有逻辑进入登录页并记住来源。不要把未登录的 `liked: false` 显示成接口失败。
12. 这些接口返回 401 时，清空登录态并进入登录页。403 且 message 为「账号已停用」时同样退出登录态。403 且 message 为「创作者身份已停用」时不要退出登录。404 且 message 为「手记不存在」或「设计不存在」时保持登录态。

表单在浏览器侧做同样的长度和字符校验。提交中禁用按钮。创建、评论、点赞收到 429 时保持禁用，直到用户离开该次操作。

进入我的手记时先确认登录态，再请求列表。不要只用本地缓存判断有哪些手记。

## 七、不要做的事

- 不要调用 `POST /internal/v1/community/posts/{id}/review` 或 `POST /internal/v1/community/comments/{id}/hide`。那是内部接口。
- 不要在前端保存或传递 `X-Internal-Token`。
- 不要提供把 `status` 改成 `published` 的按钮。公开只来自审核通过后的响应。
- 不要提供删除评论、恢复评论、回复评论。评论是平铺列表。
- 不要因为发布手记去改设计的公开状态，也不要创建商品、SKU、购物车或订单。
- 不要把模型提示词填进手记正文，也不要在公开页展示设计提示词、原图、出售许可或拒绝原因。
- 不要根据 404 区分草稿、审核中、已拒绝、已下架、设计未公开或作者已停用。
- 不要给公开列表加搜索框，也不要按 `design_id` 或 `status` 筛选。
- 不要把 `liked` 写成数字 `0` 或 `1`。
- 不要把未实际跑通的页面说成已经对接完成。

## 八、自测

后端需已启动，数据库迁移版本至少为 4，且 CORS 允许当前前端源。用一个已登录、但不必先通过创作者审核的账号确认：

1. 选一件自己的设计创建手记后，状态为 `draft`，`published_at` 和 `reviewed_at` 为空。请求体夹带 `status` 时被拒绝。
2. 同一设计再创建，展示「这件设计已经有创作手记」。为别人的设计创建，与一个不存在的设计 ID 都显示「设计不存在」。
3. 空正文提交审核，展示「正文不能为空」。创作者未通过时展示「公开手记需要已通过审核的创作者」。设计未公开时展示「公开手记的设计必须已公开并通过审核」。
4. 条件满足并提交后，状态变为 `pending`，编辑和撤回被拒绝。
5. 审核通过后，未登录打开这篇手记，响应里没有 `reject_reason`。打开一篇草稿的 ID，与一个不存在的 ID 都显示「手记不存在」。公开列表能看到这篇，看不到仍是草稿的手记。
6. 已发布手记直接保存正文，展示「已发布的手记不能修改正文」。撤回后公开列表不再出现，作者页变为草稿。
7. 已发布手记可以评论和点赞。重复点赞后仍是已赞。取消后 `liked` 为 `false`。评论列表按时间从早到晚，没有删除按钮。
8. 创作者主页在资料之外能看到该作者的公开手记。作者没有公开手记时，主页仍在，手记区为空。
9. 退出登录后访问 `GET /api/v1/community/posts/mine` 为 401，我的手记进入登录页。公开列表仍可打开。
10. 跨域环境下写请求带 Cookie，且没有 CORS 报错。开发者工具的 Local Storage 中没有会话 ID 或审核令牌。
