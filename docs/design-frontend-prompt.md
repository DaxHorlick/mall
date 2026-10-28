# 任务：对接 AI 设计与生成任务

你是一名资深 React + TypeScript 前端工程师。请在当前前端项目中对接已完成的设计后端，实现创建 AI 设计、创建上传设计、查看和修改自己的设计、发起与查看生成任务、重试失败任务、采用历史结果、提交审核，以及公开设计页。先阅读现有路由、状态管理和 API 封装，沿用它们，不要另起一套请求库或状态库。

登录、注册、退出和会话恢复已经由用户认证对接完成。创作者申请已经单独对接。本任务不要重做这些流程。设计不要求用户已经通过创作者审核：任意已登录且账号可用的用户都可以拥有设计。

后端是 AI 定制服装商城，本地默认 `http://localhost:8080`。写操作依赖登录 Cookie。前端不能读写 `session_id`，也不能把会话 ID、审核令牌或回调令牌写入 `localStorage`、`sessionStorage`。

生成不会在创建接口里同步完成。创建任务后状态是 `pending`，要等独立的 worker 进程处理。本地联调时 API 和 worker 都要启动。`DESIGN_PROVIDER=mock` 时，worker 会写入一张图片引用；`external` 时任务会停在 `running`，直到内部回调写入结果。浏览器不要调用回调。

## 一、请求约定

- 用户侧接口前缀：`/api/v1`
- `Content-Type: application/json`
- 跨域时每个请求都带 `credentials: "include"`（axios 为 `withCredentials: true`）
- 请求体只包含下面列出的字段。多一个字段会返回 400，`code` 为 `INVALID_ARGUMENT`，`message` 为「请求包含不支持的字段」
- 请求体上限约 32KB。格式不是合法 JSON、或 JSON 后面还有多余内容，返回 400，「请求格式不正确」
- 不要传 `user_id`、`owner_user_id`、`review_status`、`reject_reason`。当前用户只由 Cookie 里的会话决定，审核状态只由服务端改变
- 写接口如果浏览器带了 `Origin`，该来源必须在后端允许列表中，否则 403，`code` 为 `FORBIDDEN`，`message` 为「来源不被允许」。GET 不检查 `Origin`

本地默认允许的前端来源是 `http://localhost:5173`。开发服务器请用这个源，或让后端把实际源加进 `CORS_ALLOWED_ORIGINS`。

图片文件不进这些接口。上传设计只提交已经放在对象存储里的对象键和稳定地址。没有对象存储时，先做 AI 设计流程；不要在前端假装有上传接口。

公开设计列表是 `GET /api/v1/designs/public`，单件公开页是 `GET /api/v1/designs/{id}`。这两个请求都不需要登录。列表不能按用户筛选，也不能搜索。

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
| 403 | FORBIDDEN | 账号停用，或来源不允许 | 「账号已停用」或「来源不被允许」 |
| 404 | NOT_FOUND | 设计不可见，或任务不存在 | 「设计不存在」或「任务不存在」 |
| 409 | CONFLICT | 状态不允许当前操作 | 见各接口 |
| 429 | RATE_LIMITED | 创建或生成过于频繁 | 「尝试次数过多，请稍后再试」 |
| 500 | INTERNAL | 未预期的服务端错误 | 「内部错误」 |
| 503 | UNAVAILABLE | 限流或会话依赖不可用 | 「服务暂时不可用」 |

时间字段是 UTC 的 RFC3339 字符串。`id`、`owner_user_id`、`design_id`、`user_id`、`attempt_no`、`bytes`、`allow_sale` 都是数字。

自己的设计 `data`。响应里能看到 `allow_sale` 时，就是这一种完整资料：

```json
{
  "id": 1,
  "owner_user_id": 42,
  "title": "夏季图案",
  "origin": "ai",
  "prompt": "白底蓝花衬衫图案",
  "visibility": "private",
  "review_status": "draft",
  "allow_sale": 0,
  "reject_reason": "",
  "original": null,
  "result": null,
  "preview": null,
  "created_at": "2026-10-28T01:00:00Z",
  "updated_at": "2026-10-28T01:00:00Z"
}
```

- `origin` 只有 `ai`、`upload`
- `visibility` 只有 `private`、`public`
- `review_status` 只有 `draft`、`pending`、`approved`、`rejected`
- `allow_sale` 只有数字 `0` 或 `1`，不是布尔值
- 上传作品的 `prompt` 为 `null`。字段仍在
- `reject_reason` 没有内容时是空字符串，不是 `null`
- `original`、`result`、`preview` 没有图片时为 `null`
- 原图的 `width` 和 `height` 固定为 `null`。成品图在生成或上传时提供了尺寸才会是数字

公开设计 `data`。没有 `allow_sale`、`prompt`、`reject_reason`、`original`、`updated_at`：

```json
{
  "id": 1,
  "owner_user_id": 42,
  "title": "夏季图案",
  "origin": "ai",
  "visibility": "public",
  "review_status": "approved",
  "result": {
    "object_key": "designs/1/tasks/3.png",
    "url": "https://cdn.example.com/designs/1/tasks/3.png",
    "content_type": "image/png",
    "bytes": 128,
    "width": 1024,
    "height": 1024
  },
  "preview": {
    "object_key": "preview/p.png",
    "url": "https://cdn.example.com/preview/p.png"
  },
  "created_at": "2026-10-28T01:00:00Z"
}
```

用响应里有没有 `allow_sale` 区分完整资料和公开资料。公开页不要根据缺失字段去补提示词或拒绝原因。

图片引用：

```json
{
  "object_key": "designs/1/tasks/3.png",
  "url": "https://cdn.example.com/designs/1/tasks/3.png",
  "content_type": "image/png",
  "bytes": 128,
  "width": 1024,
  "height": 1024
}
```

页面上的图片地址用 `url`。`object_key` 只在再次提交引用时使用。mock 供应商的地址位于 `https://cdn.example.com/`，本地可能没有真实文件，仍然绑定这个 `url`，不要改写成别的图片。

生成任务 `data`：

```json
{
  "id": 3,
  "design_id": 1,
  "user_id": 42,
  "retry_of_task_id": null,
  "attempt_no": 1,
  "status": "pending",
  "prompt": "白底蓝花衬衫图案",
  "provider": "mock",
  "provider_task_id": null,
  "error_message": "",
  "result": null,
  "started_at": null,
  "finished_at": null,
  "created_at": "2026-10-28T01:00:00Z",
  "updated_at": "2026-10-28T01:00:00Z"
}
```

- `status` 只有 `pending`、`running`、`succeeded`、`failed`
- `provider` 目前是 `mock` 或 `external`
- `provider_task_id` 在 worker 领取前为 `null`
- `retry_of_task_id` 第一次尝试为 `null`，重试时指向失败的那条任务
- `error_message` 没有内容时是空字符串
- `started_at`、`finished_at` 尚未发生时为 `null`
- `result` 只在成功后出现

列表 `data` 形如 `{ "items": [] }`。没有数据时 `items` 是空数组，不是 `null`。设计列表按创建时间从新到旧，没有 offset 或下一页游标，`limit` 只表示最新的若干条。生成历史按 `attempt_no` 从早到晚。

## 三、字段规则

标题：

- 去掉首尾空白后 1 到 128 个字符
- 不能含控制字符，包括换行
- 不合规时 message 为「标题长度需为 1 到 128 个字符」或「标题不能包含控制字符」

提示词：

- 去掉首尾空白后 1 到 4000 个字符
- 允许换行、回车和制表符，其他控制字符不行
- 不合规时 message 为「提示词长度需为 1 到 4000 个字符」或「提示词不能包含控制字符」

来源只支持 `ai` 或 `upload`。其他值的 message 为「来源只支持 ai 或 upload」。

可见性只支持 `private` 或 `public`。其他值的 message 为「可见性只支持 private 或 public」。

`allow_sale` 必须是数字 `0` 或 `1`。布尔值会导致「请求格式不正确」。其他数字的 message 为「allow_sale 只支持 0 或 1」。

图片引用 `original` 和 `result`：

- `object_key`：去掉首尾空白后 1 到 255 个字符。不能以 `/` 开头，不能含 `\`、`..`、`://`、空格、`?`、`#` 或控制字符。不合规时 message 为「图片对象键不正确」
- `url`：带主机名的 `http` 或 `https`，最长 512，不能带 URL 用户信息。不合规时 message 为「图片地址不正确」
- 地址的查询参数不能是临时签名。这些参数名不区分大小写：`X-Amz-Signature`、`X-Amz-Credential`、`X-Amz-Security-Token`、`X-Amz-Algorithm`、`Signature`、`Expires`、`OSSAccessKeyId`、`q-signature`、`token`。命中时 message 为「图片地址不能包含临时签名」
- `content_type` 只支持 `image/jpeg`、`image/png`、`image/webp`。可以带 `;` 后的参数，服务端会去掉。其他类型的 message 为「图片类型只支持 jpeg、png 或 webp」
- `bytes` 必须出现，范围是 0 到 20971520。省略、负数或超出时 message 为「图片大小不正确」
- `width` 和 `height` 可以省略。出现时为 0 到 20000 的整数，否则 message 为「图片尺寸不正确」

预览图 `preview` 只有 `object_key` 和 `url`，规则与上面相同，文案分别是「预览图对象键不正确」「预览图地址不正确」「预览图地址不能包含临时签名」。

同一用户每小时最多创建 30 件设计。生成和重试共享每小时 20 次。参数错误也会计入次数。收到 429 时禁用提交并展示 message，不要立刻重试。

## 四、状态怎么展示

审核状态和任务状态是两件事。任务成功或采用另一张成品图，可能把审核状态打回草稿。

| review_status | 页面 |
| --- | --- |
| `draft` | 草稿。可以改标题；AI 作品可以改提示词；上传作品可以换原图和成品图。可以提交审核，但必须已经有成品图 |
| `pending` | 审核中。不要提供修改、生成、重试、采用或再次提交。相关操作返回 409，「设计正在审核」 |
| `approved` | 已通过。可以改标题、预览图、可见性和出售许可。不能改提示词、原图和成品图。再次生成并成功后，作品会回到草稿 |
| `rejected` | 展示 `reject_reason`。可以修改后重新提交。重新提交走提交接口，提交成功后原因被清空，状态变为 `pending` |

`visibility` 默认 `private`。只有 `approved` 且有预览图时才能改为 `public`。预览图可以和 `visibility: "public"` 放在同一次 PATCH 里。

`allow_sale` 默认 `0`。只有 `approved` 且已有成品图时才能改为 `1`。这只是一个标志，后端不会因此创建商品。

| 任务 status | 页面 |
| --- | --- |
| `pending` | 排队中。继续轮询 |
| `running` | 生成中。继续轮询。`external` 会停在这里等待回调 |
| `succeeded` | 展示 `result.url`。刷新这件设计，因为成功结果已经写进当前成品图 |
| `failed` | 展示 `error_message`，并提供重试。上一张成品图保持不变 |

同一设计同时只能有一条 `pending` 或 `running` 任务。存在这样的任务时，禁用新建和重试。

生成成功时，服务端把该次任务的提示词和成品图复制到设计上。设计当时若不是 `draft`，会变成 `draft`、`private`、`allow_sale` 为 `0`，并清空拒绝原因。失败只更新任务。

采用某次历史结果时，对象键和地址都与当前成品图相同，则审核状态不变。换成另一张图时，规则与生成成功相同，非草稿会回到草稿。

## 五、接口

### 1. 创建设计

`POST /api/v1/designs`

必须已登录。

AI 设计只提交来源、标题和提示词。不要带 `original`、`result`、`preview`：

```json
{
  "origin": "ai",
  "title": "夏季图案",
  "prompt": "白底蓝花衬衫图案"
}
```

成功时 `data` 为完整设计。`visibility` 为 `private`，`review_status` 为 `draft`，`allow_sale` 为 `0`，三张图都是 `null`。

带了任意图片时 message 为「AI 作品创建时不能提交图片」。没传 `prompt` 时 message 为「提示词长度需为 1 到 4000 个字符」。

上传设计必须带原图和成品图，预览图可选。不要带非空提示词：

```json
{
  "origin": "upload",
  "title": "手绘",
  "original": {
    "object_key": "uploads/orig.png",
    "url": "https://cdn.example.com/uploads/orig.png",
    "content_type": "image/png",
    "bytes": 1024,
    "width": 800,
    "height": 800
  },
  "result": {
    "object_key": "uploads/result.png",
    "url": "https://cdn.example.com/uploads/result.png",
    "content_type": "image/png",
    "bytes": 2048,
    "width": 800,
    "height": 800
  }
}
```

缺少原图或成品图时 message 为「上传作品必须提供原图和成品图」。提示词去掉空白后仍有内容时 message 为「上传作品不能填写提示词」。

### 2. 我的设计

`GET /api/v1/designs?limit=20`

必须已登录。`limit` 省略时为 20，允许 1 到 50。其他值返回 400，「数量不正确」。

`data.items` 是当前用户自己的设计，包含草稿和未公开作品，每项都是完整资料。

### 公开设计列表

`GET /api/v1/designs/public?limit=20`

不需要登录。`limit` 省略时为 20，允许 1 到 50。其他值返回 400，「数量不正确」。

`data.items` 只包含 `visibility` 为 `public`、`review_status` 为 `approved`、且所有者账号可用的设计，按创建时间从新到旧。每项是公开资料，没有 `prompt`、`allow_sale`、`original`、`reject_reason`、`updated_at`。没有数据时 `items` 是空数组。

草稿、审核中、已拒绝、私有，以及所有者已停用的作品都不会出现。所有者停用后，列表可能比 `limit` 短。这里没有下一页游标，也没有按创作者筛选。

点进某一件仍请求 `GET /api/v1/designs/{id}`。

### 3. 读取一件设计

`GET /api/v1/designs/{id}`

路径不是正整数或为 0 时返回 400，「设计 ID 不正确」。

已登录且是所有者：返回完整资料，包括草稿和私有作品。

未带会话：仅当作品 `visibility` 为 `public`、`review_status` 为 `approved`、且所有者账号可用时返回公开资料。

以下情况都是 404，「设计不存在」。页面用同一种“设计不存在”即可：

- 设计不存在
- 调用方不是所有者，且作品未公开或未通过审核
- 所有者账号已停用，且调用方不是本人

会话 Cookie 无效时是 401，「请先登录」，服务端会清掉无效 Cookie。已登录但账号停用时是 403，「账号已停用」。这两种都沿用现有登录态处理，不要显示成“设计不存在”。

### 4. 修改设计

`PATCH /api/v1/designs/{id}`

必须已登录，且只能改自己的设计。只提交要改的字段。全部省略时返回当前设计，不报错。传 `null` 等于省略，不能用来清空图片。

```json
{ "title": "新标题" }
```

```json
{ "prompt": "新的提示词" }
```

```json
{ "preview": { "object_key": "preview/p.png", "url": "https://cdn.example.com/preview/p.png" }, "visibility": "public" }
```

```json
{ "allow_sale": 1 }
```

不能提交 `id`、`owner_user_id`、`origin`、`review_status`、`reject_reason`、`created_at`、`updated_at`。

- `pending`：409，「设计正在审核」
- 已通过后修改 `prompt`、`original` 或 `result`：409，「已通过审核的设计不能修改提示词或图片」
- AI 作品修改 `original` 或 `result`：400，「AI 作品的成品图只能来自生成任务」
- 上传作品提交非空 `prompt`：400，「上传作品不能填写提示词」
- 尚未通过或没有预览图就设为 `public`：409，「公开设计必须已通过审核并有预览图」
- 尚未通过或没有成品图就设 `allow_sale` 为 `1`：409，「允许出售前必须已通过审核并有成品图」
- 不是自己的设计，或设计不存在：404，「设计不存在」

别人的设计也返回「设计不存在」，不要据此判断作品是否存在。

### 5. 提交审核

`POST /api/v1/designs/{id}/submissions`

必须已登录。无请求体。

只有 `draft` 或 `rejected`，并且已经有成品图时可以提交。成功后 `review_status` 为 `pending`，`reject_reason` 为空字符串。

- 还没有成品图：409，「请先采用生成结果」。若仍有 `pending` 或 `running` 任务，继续轮询，不要再提交
- `pending` 或 `approved`：409，「当前状态不允许该操作」

AI 作品的第一张成品图来自生成成功，不需要先点“采用”。采用只用于改选更早的成功结果。

### 6. 创建生成任务

`POST /api/v1/designs/{id}/tasks`

必须已登录，且只能用于 `origin` 为 `ai` 的设计。请求体至少是 `{}`。

省略 `prompt` 或传 `null` 时，使用设计上现有的提示词：

```json
{}
```

本次改用新提示词：

```json
{ "prompt": "另一版蓝色花卉" }
```

成功时 `data` 为新任务，`status` 为 `pending`，`attempt_no` 从 1 开始。接口返回后开始轮询，不要把这次响应当成已经生成完。

- 上传作品：409，「上传作品不能生成」
- 审核中：409，「设计正在审核」
- 已有 `pending` 或 `running` 任务：409，「已有进行中的生成任务」
- 设计不存在或不是自己的：404，「设计不存在」

已通过的设计允许再次生成。成功后设计会回到草稿并变为私有，出售许可变为 `0`。发起前要向用户说明这一点。

### 7. 生成历史

`GET /api/v1/designs/{id}/tasks`

必须已登录。`data.items` 是这件设计的全部尝试，包含失败记录，按 `attempt_no` 从早到晚。失败记录不要从列表里删掉。

### 8. 读取一条任务

`GET /api/v1/designs/{id}/tasks/{task_id}`

必须已登录。用这个接口轮询。

`pending` 或 `running` 时每 2 秒请求一次。`succeeded` 或 `failed` 后停止。变成 `succeeded` 后立刻重新请求 `GET /api/v1/designs/{id}`，用新的设计资料替换页面。不要在浏览器里把长时间停留的 `pending` 改成失败；一直是 `pending` 说明 worker 没有在跑。

任务 ID 不合法时 400，「任务 ID 不正确」。任务不存在或不属于这件设计时 404，「任务不存在」。

### 9. 重试失败任务

`POST /api/v1/designs/{id}/tasks/{task_id}/retries`

必须已登录。请求体规则与创建任务相同。省略 `prompt` 时沿用被重试那条任务的提示词。

成功时返回一条新任务。`retry_of_task_id` 指向原任务，`attempt_no` 为原任务加 1，`status` 为 `pending`。原来的失败记录保持 `failed`。

- 目标不是 `failed`：409，「只能重试失败的任务」
- 已有进行中的任务：409，「已有进行中的生成任务」
- 审核中：409，「设计正在审核」
- 上传作品：409，「上传作品不能生成」

重试和新建生成共享每小时 20 次限制。

### 10. 采用生成结果

`POST /api/v1/designs/{id}/tasks/{task_id}/adoption`

必须已登录。无请求体。只能采用 `succeeded` 且带有成品图的任务。

成功时 `data` 为更新后的完整设计。若选中的图和当前成品图的对象键、地址都相同，审核状态不变。若换成另一张图，且当时不是草稿，则回到 `draft`、`private`，`allow_sale` 为 `0`，拒绝原因被清空。

- 任务未成功或没有结果图：409，「只能采用成功的生成结果」
- 审核中：409，「设计正在审核」

## 六、页面与状态

至少完成这些流程：

1. 我的设计请求 `GET /api/v1/designs`。空数组展示空状态。每项展示标题、来源、审核状态、可见性和成品图；没有 `result` 时展示“尚未生成”。公开广场请求 `GET /api/v1/designs/public`，只展示公开资料里的标题、成品图和预览图。空数组展示空状态。
2. AI 创建页只收集标题和提示词。提交成功后进入该设计的编辑页，资料用响应 `data`。
3. 上传创建页收集标题、原图引用、成品图引用，预览图可选。不要提供文件二进制上传，除非项目里已有单独的对象存储上传，并且最终提交的是稳定地址。
4. 编辑页先请求 `GET /api/v1/designs/{id}`。有 `allow_sale` 时按所有者页面渲染；没有时按公开页面渲染。
5. AI 作品在 `draft` 或 `rejected` 时可以修改提示词，并可以创建任务。创建后轮询任务。成功后用设计详情接口的结果替换当前设计，并刷新历史列表。
6. 历史里保留失败项。失败项可以重试。进行中时禁用新建和重试，并展示「已有进行中的生成任务」若用户仍触发了接口。
7. 有成品图且状态为 `draft` 或 `rejected` 时展示提交审核。成功后进入审核中，并收起编辑、生成和采用。
8. `approved` 时允许修改标题和预览图，允许在有预览图后设为公开，允许在有成品图后打开出售许可。修改提示词的入口换成“重新生成”，并提示重新生成会使审核失效。
9. `rejected` 时展示 `reject_reason`。修改后用提交接口重新送审。
10. 公开页按路径中的设计 ID 请求 `GET /api/v1/designs/{id}`。200 且没有 `allow_sale` 时展示标题、成品图和预览图。404 时展示「设计不存在」。
11. 这些接口返回 401 时，沿用现有逻辑清空登录态并进入登录页。403 且 message 为「账号已停用」时同样退出登录态。404 且 message 为「设计不存在」时保持登录态。

表单在浏览器侧做同样的长度和字符校验。提交中禁用按钮。轮询页面离开时取消定时器。

进入我的设计时先确认登录态，再请求列表。不要只用本地缓存判断有哪些作品。

## 七、不要做的事

- 不要调用 `POST /internal/v1/designs/{id}/review` 或 `POST /internal/v1/design-tasks/callbacks`。那是内部接口。
- 不要在前端保存或传递 `X-Internal-Token`。
- 不要把设计作品发布成社区帖子，也不要创建商品、SKU、购物车或订单。`allow_sale` 只展示为开关。
- 不要按创作者筛选或搜索公开列表。后端没有这些参数。
- 不要在公开页展示提示词、原图、拒绝原因或出售许可。
- 不要根据 404 区分草稿、审核中、已拒绝、私有或所有者已停用。
- 不要在请求里提交 `review_status` 把自己改成已通过。
- 不要把图片二进制、Base64 或带签名的临时地址提交给设计接口。
- 不要把未实际跑通的页面说成已经对接完成。

## 八、自测

后端需已启动，数据库迁移版本至少为 3，worker 已运行，且 CORS 允许当前前端源。用一个已登录、但不必是创作者的账号确认：

1. 创建 AI 设计后状态为 `draft`、`private`，没有成品图。请求体夹带 `review_status` 时被拒绝。
2. 创建任务返回 `pending`。worker 运行后轮询到 `succeeded`，设计详情里出现 `result.url`，提示词与该次任务一致。
3. 没有成品图时提交审核，展示「请先采用生成结果」。有成品图后提交，状态变为 `pending`，编辑和再次生成被拒绝。
4. 同一设计在已有进行中的任务时再次创建，展示「已有进行中的生成任务」。失败后重试会出现新的 `attempt_no`，旧的失败记录还在。
5. 审核通过后，没有预览图就设为公开，展示「公开设计必须已通过审核并有预览图」。同一次提交预览图和 `public` 可以成功。
6. 未登录打开这条公开设计，响应里没有 `prompt`、`allow_sale`、`original`。打开一条草稿的 ID，与一个不存在的 ID 都显示「设计不存在」。`GET /api/v1/designs/public` 能看到这件已公开作品，看不到仍是草稿的作品。
7. 已通过的设计再次生成并成功后，页面变为草稿、私有，出售许可为 0。
8. 上传作品不出现生成按钮。若仍调用生成接口，展示「上传作品不能生成」。
9. 退出登录后访问 `GET /api/v1/designs` 为 401，我的设计进入登录页。
10. 跨域环境下写请求带 Cookie，且没有 CORS 报错。开发者工具的 Local Storage 中没有会话 ID 或内部令牌。
