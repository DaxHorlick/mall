# INKTEE

AI 个性化 T 恤电商平台的 Web 前端。当前完成阶段 1–12。数据默认走本地 Mock；通过环境变量可切换为请求真实 API（后端多数接口尚未实现）。

## 命令

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

开发服务器默认地址是 `http://localhost:5173`。

## 环境变量

见 `.env.example` / `.env.development`：

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | Go API 基础地址 |
| `VITE_USE_MOCK` | `true`（默认）本地 Mock；`false` 走真实请求 |

切换 Mock：把 `VITE_USE_MOCK=false` 后重启 dev server。未实现的后端接口已在 `src/api/*` 用 `TODO(backend)` 标注。

## 数据层（阶段 12）

- 统一请求：`src/api/client.ts`（`request` / `ApiError` / `uploadImage`）
- Mock 开关：`src/api/config.ts` 的 `isMockMode()`
- 业务 API：`products` / `creators` / `designs`（含 AI 任务）/ `orders` / `users` / `upload`
- Query 缓存：`src/api/queryKeys.ts` + `src/api/queryClient.ts`
- 页面不直接 `fetch`，也不直接引用 `src/mocks`；购物车等纯客户端状态仍用 Zustand

## 路由摘要

`/` 首页 · `/products` 列表 · `/products/:id` 详情 · `/cart` · `/checkout` · `/orders` · `/designer` · `/marketplace` · `/creators/:id` · `/profile` · `/my-designs` · `/my-store` · `/seller/*` · `/login` `/register`（占位）

## 目录

- `src/api`：请求封装与业务 API
- `src/mocks`：仅供 API 层在 Mock 模式下使用
- `src/stores`：购物车、收藏、本地订单/设计/商家商品
- `src/pages`：页面
- `src/types`：共享类型
