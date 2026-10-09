# INKTEE

AI 个性化 T 恤电商平台的 Web 前端。当前完成阶段 1：项目初始化。页面是占位内容，尚未请求后端。

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

开发模式读取 `.env.development`。字段说明见 `.env.example`。

`VITE_API_BASE_URL` 是后续 Go API 的基础地址。当前页面只展示该地址，不会发起请求。

## 目录

- `src/api`：统一的 fetch 请求封装
- `src/pages`：页面
- `src/router`：路由
- `src/components`：可复用组件
- `src/layouts`：页面布局
- `src/stores`：Zustand 状态
- `src/hooks`：自定义 Hooks
- `src/types`：类型
- `src/mocks`：Mock 数据
- `src/utils`：工具函数
