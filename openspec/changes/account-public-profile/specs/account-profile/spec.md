# Spec Delta

## Purpose

规定已登录账号页按公开主页的数据范围展示，缺数据时保持空状态，并保留原有账号操作。

## ADDED Requirements

### Requirement: Account page opens as a public profile
已登录账号页顶部 MUST 按公开主页展示名字、用户名、头像、横幅、简介、社交链接、粉丝数和作品。页面 MUST NOT 使用 Dezajn 的照片、标志或英文文案。

#### Scenario: Signed-in visitor opens the account page
- **WHEN** 已登录访问者打开账号页
- **THEN** 页面顶部展示名字、用户名、头像区域、横幅区域、简介、社交链接、粉丝数和作品，且没有 Dezajn 的照片、标志或英文文案

### Requirement: Profile uses the current user fields
名字 MUST 使用当前用户的 nickname。用户名 MUST 使用 username，为空时显示「未设置」。头像 MUST 使用 avatar_url，为空时不显示图片。加入时间 MUST 使用 created_at。

#### Scenario: User has a nickname, username and avatar
- **WHEN** 当前用户有昵称、用户名和头像地址
- **THEN** 主页名字是该昵称，用户名是该用户名，头像使用该地址，并显示由 created_at 得到的加入时间

#### Scenario: Username or avatar is missing
- **WHEN** 当前用户没有用户名或没有头像地址
- **THEN** 用户名显示「未设置」，头像区域不出现图片

### Requirement: Missing profile data stays empty
横幅、简介、社交链接、粉丝数和作品 MUST 显示空状态。页面 MUST NOT 编造这些数据，也 MUST NOT 为它们请求新接口。

#### Scenario: Opening the profile with only the current user
- **WHEN** 已登录访问者打开账号页，且只有当前用户接口返回的数据
- **THEN** 横幅没有图片，简介、社交链接、粉丝数和作品都是空状态

### Requirement: Profile does not add storefront actions
账号页 MUST NOT 提供关注、分享、店内搜索或作品筛选。

#### Scenario: Reading the profile actions
- **WHEN** 已登录访问者查看账号页主页
- **THEN** 页面上没有关注、分享、店内搜索和作品筛选

### Requirement: Account operations remain below the profile
资料、密码、登录设备、第三方身份和退出 MUST 仍按原顺序留在主页下面。这些操作的请求、校验和完成后的去向 MUST 保持不变。手机、邮箱、状态、角色和用户 ID MUST 留在主页下方，MUST NOT 出现在主页头部。

#### Scenario: Using an existing account operation
- **WHEN** 已登录访问者在账号页修改资料、修改密码、查看设备或绑定、解绑身份
- **THEN** 操作仍在该页完成，成功后仍留在账号页

#### Scenario: Signing out from the account page
- **WHEN** 已登录访问者退出当前登录、退出全部设备或撤销当前设备
- **THEN** 访问者回到登录页

### Requirement: Signed-out visitors still leave the account page
未登录打开账号页 MUST 进入登录页，不得看到公开主页。

#### Scenario: Signed-out visitor opens the account page
- **WHEN** 未登录访问者打开账号页
- **THEN** 访问者进入登录页
