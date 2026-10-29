# 任务：公开设计时改为选择已有图片

你是一名资深 React + TypeScript 前端工程师。请在当前前端项目里改设计作品的「设为公开」。先阅读现有路由、状态管理和 API 封装，沿用它们。不要重做注册登录、创作者申请、设计创建、生成任务轮询、采用结果或提交审核。

后端是 AI 定制服装商城，本地默认 `http://localhost:8080`。写操作依赖登录 Cookie。前端不能读写 `session_id`，也不能把会话 ID 或审核令牌写入 `localStorage`、`sessionStorage`。

完整设计对接仍以 `docs/design-frontend-prompt.md` 为准。本任务只替换其中「设为公开时提交预览图对象键和地址」的做法。

## 一、要改掉的交互

设为公开时，页面上不要再出现对象键、地址、`object_key`、`url` 输入框。用户只选择一张已经存在的图片。

对象键和地址由后端从选中的图片复制到预览图。请求体里不要带这两个字段，也不要提交 `preview` 对象。

设计必须已经是 `review_status = approved` 才提供公开操作。`draft`、`pending`、`rejected` 不要展示选图公开。

## 二、请求

`PATCH /api/v1/designs/{id}`

必须已登录，只能改自己的设计。跨域请求带 `credentials: "include"`。请求体只包含下面列出的字段。多一个字段会返回 400，「请求包含不支持的字段」。

AI 作品：生成历史里只列出 `status` 为 `succeeded` 且 `result` 不为 `null` 的任务。用 `result.url` 显示图片。用户点中一张后提交该任务的 `id`：

```json
{ "preview_task_id": 3, "visibility": "public" }
```

`preview_task_id` 是数字。失败、排队中、执行中的任务不可选。没有成功图时，不提供公开按钮，说明需要先生成成功。

上传作品没有生成任务。只提供设计上已经有的图：

- 有 `result` 时，选项是成品图，提交 `"preview_from": "result"`
- 有 `original` 时，选项是原图，提交 `"preview_from": "original"`

```json
{ "preview_from": "result", "visibility": "public" }
```

`preview_from` 只能是这两个字符串。两张都有时让用户选一张，一次只提交一个值。两张都没有时不提供公开。

不要在同一次请求里同时提交 `preview_task_id`、`preview_from` 和 `preview`。

成功时 `data` 是更新后的完整设计。`visibility` 为 `public`，`preview` 里会有后端写入的 `object_key` 和 `url`。页面展示预览图时只用 `preview.url`，不要把这两个值再放进输入框。

## 三、错误

按 `code` 分支，把 `message` 直接展示给用户。

| 情况 | HTTP | message |
| --- | --- | --- |
| 选了还没生成成功的任务 | 400 | 请选择已生成的图片 |
| `preview_from` 不是 `result` 或 `original` | 400 | 图片只支持 result 或 original |
| 选了成品图或原图，但这张图不存在 | 400 | 请选择已有图片 |
| 同一次提交了多种选图方式 | 400 | 请只选择一张已有图片 |
| 还没审核通过，或没有选中图片就设为公开 | 409 | 公开设计必须已通过审核并有预览图 |
| 任务不存在或不属于这件设计 | 404 | 任务不存在 |
| 设计不存在或不是自己的 | 404 | 设计不存在 |
| 正在审核 | 409 | 设计正在审核 |

409 时不要自动改状态再重试。选图状态保留，让用户重新选择或先完成审核。

## 四、页面

1. `approved` 的设计上，公开入口打开一个选图步骤，不打开表单。
2. AI 作品的图片来自 `GET /api/v1/designs/{id}/tasks`。只渲染成功且有 `result.url` 的项。当前已公开且 `preview.object_key` 与某张图相同时，标出当前预览图。
3. 上传作品的图片来自设计详情里的 `result` 和 `original`。没有的那张不要显示成空白选项。
4. 未选择图片时，公开按钮不可提交。
5. 提交成功后用响应 `data` 替换当前设计，并显示已公开。
6. 已经公开的作品如果允许更换预览图，仍然用同一种选择，不要退回手填地址。

出售许可 `allow_sale`、重新生成、提交审核都保持原有行为。本任务不要改创建页，也不要新增上传文件接口。

## 五、不要做的事

- 不要在公开流程里收集或提交 `object_key`、`url`、`preview`。
- 不要调用 `/internal/v1/`，不要发送 `X-Internal-Token`。
- 不要因为选了另一张生成图就调用采用接口。采用会改变当前成品图，公开选图只设置预览图。
- 不要在未审核通过时本地把作品标成已公开。

## 六、自测

后端已启动，这件 AI 设计至少有一次 `succeeded` 的生成，并且审核状态为 `approved`。

1. 公开界面没有对象键和地址输入框。
2. 不选图片就提交，展示「公开设计必须已通过审核并有预览图」。
3. 选中一张成功的生成图后，请求体只有 `preview_task_id` 和 `visibility`。成功后 `visibility` 为 `public`，预览图使用返回的 `preview.url`。
4. 选中一条失败任务时不能提交。若请求仍然发出，展示「请选择已生成的图片」。
5. 上传作品改为在成品图和原图之间选择，请求体是 `preview_from`，不是对象键。
