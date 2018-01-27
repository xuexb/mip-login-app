# mip-login-app

MIP 登录示例，包括登录表单、点赞、喜欢、访问量、验证码等交互功能，示例地址： <https://static.xuexb.com/mip-login-app/> 。

![node version required](https://img.shields.io/badge/node-%3E=7.8.0-red.svg)
[![MIP徽章](https://img.shields.io/badge/Powered%20by-MIP-brightgreen.svg)](https://www.mipengine.org)

## 本地运行

```bash
# 克隆
$ git clone https://github.com/xuexb/mip-login-app.git

# 安装依赖
$ cd mip-login-app && npm install

# 运行示例
$ npm start
```

## API 接口

- [登录](#login)
- [退出](#like)
- [获取用户信息](#userinfo)
- [获取文章赞数](#getlike)
- [文章点赞](#setlike)
- [获取是否喜欢](#getlove)
- [设置喜欢](#setlove)
- [查看阅读数](#getcount)

### 说明

- 所有接口支持 `JSONP` 和 `CORS` 跨域
- 接口通用返回结构：
```js
// 成功
{
    "status": 0,
    "data": {
    }
}

// 失败
{
    "status": x,
    "msg": "错误信息"
}
```

<a id="login"></a>
### 1. 登录

#### 接口地址

<https://static.xuexb.com/mip-login-app/api/login.json>

#### 请求参数

参数名 | 说明
--- | ---
username | 用户名
password | 密码，密码同用户名一致时登录成功

#### 返回值

登录成功：
```json
{
    "status": 0,
    "data": {
        "uid": 1,
        "username": "mip2"
    }
}
```

用户名或密码为空：
```json
{
    "status": 1,
    "msg": "用户名或密码为空"
}
```

用户名或密码错误：
```json
{
    "status": 2,
    "msg": "用户名或密码错误"
}
```

<a id="exit"></a>
### 2. 退出

#### 接口地址

<https://static.xuexb.com/mip-login-app/api/exit.json>

#### 返回值

```json
{
    "status": 0
}
```

<a id="userinfo"></a>
### 3. 获取用户信息

#### 接口地址

<https://static.xuexb.com/mip-login-app/api/userinfo.json>

#### 返回值

已登录：
```json
{
    "status": 0,
    "data": {
        "username": "用户名",
        "uid": 1
    }
}
```

未登录：
```json
{
    "status": 3,
    "msg": "未登录"
}
```

<a id="getlike"></a>
### 4. 获取文章赞数

#### 接口地址

<https://static.xuexb.com/mip-login-app/api/get.like.json>

#### 请求参数

参数名 | 说明
--- | ---
id | 模拟文章ID，非空即可

#### 返回值

未登录：
```json
{
    "status": 0,
    "data": {
        "like": 1,
        "isLogin": false,
        "isLike": false
    }
}
```

已登录未赞：
```json
{
    "status": 0,
    "data": {
        "like": 1,
        "isLogin": true,
        "isLike": false
    }
}
```

已登录已赞：
```json
{
    "status": 0,
    "data": {
        "like": 1,
        "isLogin": true,
        "isLike": true
    }
}
```

<a id="setlike"></a>
### 5. 文章点赞

#### 接口地址

<https://static.xuexb.com/mip-login-app/api/set.like.json>

#### 请求参数

参数名 | 说明
--- | ---
id | 模拟文章ID，非空即可

#### 返回值

未登录：
```json
{
    "status": 3,
    "msg": "未登录"
}
```

已登录（已点赞和未点赞返回一致）：
```json
{
    "status": 0,
    "data": {
        "like": 1
    }
}
```

<a id="getlove"></a>
### 6. 获取是否喜欢

#### 接口地址

<https://static.xuexb.com/mip-login-app/api/get.love.json>

#### 请求参数

参数名 | 说明
--- | ---
id | 模拟文章ID，非空即可

#### 返回值

未登录：
```json
{
    "status": 0,
    "data": {
        "isLogin": false,
        "isLike": false
    }
}
```

已登录未喜欢：
```json
{
    "status": 0,
    "data": {
        "isLogin": true,
        "isLike": false
    }
}
```

已登录已喜欢：
```json
{
    "status": 0,
    "data": {
        "isLogin": true,
        "isLike": true
    }
}
```

<a id="setlove"></a>
### 7. 设置喜欢

#### 接口地址

<https://static.xuexb.com/mip-login-app/api/set.love.json>

#### 请求参数

参数名 | 说明
--- | ---
id | 模拟文章ID，非空即可

#### 返回值

未登录：
```json
{
    "status": 3,
    "msg": "未登录"
}
```

已登录（已点赞和未点赞返回一致）：
```json
{
    "status": 0,
    "data": {
    }
}
```

<a id="getcount"></a>
### 8. 查看阅读数

#### 接口地址

<https://static.xuexb.com/mip-login-app/api/get.count.json>

#### 请求参数

参数名 | 说明
--- | ---
id | 模拟文章ID，非空即可

#### 返回值

```json
{
    "status": 0,
    "data": {
        "like": 1
    }
}
```

## License

MIT