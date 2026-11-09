# Proposal

## Why

登录、注册、账号和 404 现在是暖灰底上的说明式表单，和要借鉴的服装站点气质差得很远。页面已经能用，缺的是一套能覆盖现有页面的视觉系统，而不是再造一个没有商品内容的首页。

## What Changes

- 把共享顶栏、页脚，以及登录、注册、账号、404 换成白底、近黑文字、轻字重大标题和黑色胶囊主按钮。
- 登录和注册可以用圆角色块衬托标题，使用纯色或渐变，不使用对方站点的照片、标志或文案。
- 账号页仍是表单。输入框保持适度圆角，不改成胶囊。
- 页脚「前端脚手架」换成与当前页面相符的一句短文案。其余页面文案、路由、接口和校验不变。
- 中文继续使用苹方和微软雅黑。不引入对方的手写标志，也不新增落地页。

## Capabilities

### New Capabilities

- `shell-appearance`: 现有外壳和登录、注册、账号、404 的外观。

### Modified Capabilities

- 无。仓库里还没有规格。

## Impact

- `src/index.css`、`src/App.tsx` 的 Ant Design 主题、`src/layouts/MainLayout.tsx`。
- `src/pages/login/index.tsx`、`src/pages/register/index.tsx`、`src/pages/account/index.tsx`、`src/pages/not-found/index.tsx`。
- 不改路由、请求、登录态和环境变量。不新增字体文件或图片资源。
