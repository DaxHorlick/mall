# INKTEE

AI 定制服装商城的用户站前端。当前对齐到用户、创作者、设计三个模块。社区、商品、购物车和订单只保留路由，不请求接口，也不使用本地数据。

## 命令

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

开发服务器默认地址是 `http://localhost:5173`。后端默认 `http://localhost:8080`，并且需要允许这个前端来源。

## 环境变量

见 `.env.example` / `.env.development`：

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | API 基础地址，开发默认 `http://localhost:8080/api` |

## 已对接

- 用户：注册、登录、退出、刷新后恢复登录态、修改昵称和头像
- 创作者：申请、审核状态、修改资料、重新申请、公开主页
- 设计：公开列表、公开页、我的设计、创建 AI 设计、创建上传设计、编辑、生成轮询、失败重试、采用历史结果、提交审核

登录态只以 `GET /api/v1/auth/me` 为准。会话 ID 在 HttpOnly Cookie 里，前端不写入本地存储。
