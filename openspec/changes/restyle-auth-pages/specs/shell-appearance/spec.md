# Spec Delta

## Purpose

规定现有外壳以及登录、注册、账号和 404 的外观，让这些页面使用同一套白底、近黑文字和胶囊主按钮，同时保持原有文案、路由和操作。

## ADDED Requirements

### Requirement: Shared pages use a white ground
登录、注册、账号和 404 的页面底 MUST 是白色，正文 MUST 是近黑色。中文 MUST 使用苹方或微软雅黑。页面不得使用暖灰纸底作为主背景。

#### Scenario: Opening any of the four pages
- **WHEN** 访问者打开登录、注册、账号或 404
- **THEN** 页面主背景为白色，正文为近黑色，中文使用苹方或微软雅黑

### Requirement: Header is a white bar with one pill action
顶栏 MUST 是不透明的白色。左侧 MUST 是文字标志 INKTEE，不得使用手写或图片标志。右侧在未登录时 MUST 是进入登录的文字，已登录时 MUST 是昵称和一颗黑色胶囊「退出」按钮。

#### Scenario: Visitor is signed out
- **WHEN** 未登录的访问者看到顶栏
- **THEN** 顶栏为白色，左侧是文字 INKTEE，右侧是进入登录的文字

#### Scenario: Visitor is signed in
- **WHEN** 已登录的访问者看到顶栏
- **THEN** 顶栏右侧显示昵称和一颗黑色胶囊「退出」按钮

### Requirement: Login and register use a color panel
登录页和注册页的标题 MUST 大、字重轻。标题区域 MUST 用圆角的纯色或渐变色块衬托，不得使用外部站点的照片、标志或文案。

#### Scenario: Opening login or register
- **WHEN** 访问者打开登录页或注册页
- **THEN** 标题字号明显大于正文且字重轻，标题旁有圆角色块，页面上没有外部站点的照片或标志

### Requirement: Primary actions are black pills
登录、注册、保存资料、修改密码和 404 的主要按钮 MUST 是黑色胶囊，白字。次要按钮不得使用同样的黑色胶囊。

#### Scenario: A primary action is visible
- **WHEN** 页面上出现登录、注册、保存资料、修改密码或 404 的主要按钮
- **THEN** 该按钮是黑色胶囊，文字为白色

### Requirement: Account inputs stay moderately rounded
账号页 MUST 仍是表单，字段和分区保持原有顺序。输入框圆角 MUST 明显小于胶囊，不得做成全圆胶囊。

#### Scenario: Editing the account form
- **WHEN** 已登录访问者打开账号页
- **THEN** 资料、密码、设备和第三方身份仍按原顺序展示，输入框不是胶囊形

### Requirement: Footer no longer calls the product a scaffold
页脚 MUST 保留 INKTEE 和版权行。原来的「前端脚手架」MUST 换成一句不声称本产品只是脚手架的短文案。其余页面句子、字段标签和错误提示 MUST 保持不变。

#### Scenario: Reading the footer
- **WHEN** 访问者看到任一页面的页脚
- **THEN** 页脚有 INKTEE 和版权行，且不出现「前端脚手架」

### Requirement: Appearance change does not move people
外观改动 MUST NOT 改变现有跳转、接口或校验。未登录打开账号仍进入登录页。登录和注册成功仍进入账号页。404 在未登录时仍提供去登录，已登录时仍提供回到账号。

#### Scenario: Signed-out visitor opens the account page
- **WHEN** 未登录访问者打开账号页
- **THEN** 访问者进入登录页，页面使用新的外观

#### Scenario: Signed-in visitor opens a missing address
- **WHEN** 已登录访问者打开一个没有对应页面的地址
- **THEN** 页面显示 404，并提供回到账号的主要按钮
