# INKTEE

AI 个性化 T 恤电商平台的 Web 前端。当前完成阶段 2：公共布局和页面路由。各页面仍是占位内容，尚未请求后端。

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

`VITE_API_BASE_URL` 是后续 Go API 的基础地址。当前页面不会发起请求。

## 路由

公共布局包含顶部导航、搜索、分类和页脚。未知地址进入 404。

- `/` 首页
- `/products` 商品列表
- `/products/:id` 商品详情
- `/designer` AI 设计器
- `/marketplace` 创作者市场
- `/creators/:id` 创作者主页
- `/cart` 购物车
- `/checkout` 订单确认
- `/orders` 我的订单
- `/orders/:id` 订单详情
- `/profile` 个人中心
- `/my-designs` 我的设计
- `/my-store` 我的店铺
- `/seller/products` 商家商品管理
- `/seller/orders` 商家订单管理
- `/login` 登录
- `/register` 注册

## 目录

- `src/api`：统一的 fetch 请求封装
- `src/components`：导航、页脚和页面占位
- `src/constants`：导航和商品分类
- `src/layouts`：公共页面布局
- `src/pages`：页面
- `src/router`：路由
