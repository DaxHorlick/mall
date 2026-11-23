1. 注册

POST /api/v1/auth/register

请求参数：

{
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}

响应参数：

{
  "user_id": "int64",
  "username": "string"
}

2. 登录

POST /api/v1/auth/login

请求参数：

{
  "account": "string",
  "password": "string"
}

account 支持用户名、邮箱、手机号。

响应参数：

{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "expires_in": "int64",
  "user": {
    "user_id": "int64",
    "username": "string",
    "nickname": "string",
    "avatar": "string"
  }
}

3. 刷新 Token

POST /api/v1/auth/refresh

请求参数：

{
  "refresh_token": "string"
}

响应参数：

{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "expires_in": "int64"
}

4. 退出登录

POST /api/v1/auth/logout

请求 Header：

Authorization: Bearer <access_token>

请求参数：

{
  "refresh_token": "string"
}

响应参数：

{
  "success": true
}

5. 全部设备退出登录

POST /api/v1/auth/logout-all

请求 Header：

Authorization: Bearer <access_token>

请求参数：无

响应参数：

{
  "success": true
}

6. 修改密码

POST /api/v1/auth/change-password

请求 Header：

Authorization: Bearer <access_token>

请求参数：

{
  "old_password": "string",
  "new_password": "string"
}

响应参数：

{
  "success": true
}

7. 忘记密码

POST /api/v1/auth/forgot-password

请求参数：

{
  "account": "string"
}

account 支持邮箱或手机号。

响应参数：

{
  "success": true
}

8. 重置密码

POST /api/v1/auth/reset-password

请求参数：

{
  "token": "string",
  "new_password": "string"
}

响应参数：

{
  "success": true
}

9. 获取当前登录用户认证信息

GET /api/v1/auth/me

请求 Header：

Authorization: Bearer <access_token>

请求参数：无

响应参数：

{
  "user_id": "int64",
  "username": "string",
  "email": "string",
  "phone": "string",
  "nickname": "string",
  "avatar": "string",
  "status": "int",
  "created_at": "datetime"
}

统一响应格式

所有接口统一返回：

{
  "code": 0,
  "message": "success",
  "data": {}
}

错误响应：

{
  "code": 401,
  "message": "Unauthorized",
  "data": null
}