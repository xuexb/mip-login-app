/**
 * @file 服务端运行环境
 * @author xuexb <fe.xiaowu@gmail.com>
 */

const Koa = require('koa');
const Router = require('koa-router');
const session = require('koa-session2');
const serve = require('koa-static');
const mount = require('koa-mount');
const app = new Koa();

// 注入 session
app.use(session({
    expires: new Date('2020-01-01')
}));

// 注入 JSONP 方法
app.use(async (ctx, next) => {
    ctx.json = data => {
        ctx.body = JSON.stringify(data);
    };

    ctx.jsonp = data => {
        if (ctx.query.callback) {
            const cb = ctx.query.callback;
            const body = JSON.stringify(data);

            ctx.set('Content-Type', 'text/javascript; charset=utf-8');
            ctx.body = `typeof ${cb} === 'function' && ${cb}(${body})`;
        }
        else {
            ctx.json(data);
        }
    };

    await next();
});

// 注入使用 cookie 来记录赞数
app.use(async (ctx, next) => {
    const like = ctx.cookies.get('like');

    if (!like) {
        ctx.cookies.set('like', '0', {
            expires: new Date('2020-01-01')
        });
    }

    await next();
});

// 注入异步接口添加跨域和不缓存
app.use(mount('/mip-login-app/api', async (ctx, next) => {
    ctx.set('Content-Type', 'application/json; charset=utf-8');
    ctx.set('Cache-Control', 'no-cache,no-store');
    ctx.set('Access-Control-Allow-Credentials', true);
    ctx.set('Access-Control-Allow-Origin', ctx.header.origin || '*');
    await next();
}));

// 获取点赞接口
app.use(mount('/mip-login-app/api/get.like.json', async ctx => {
    if (!ctx.query.id) {
        return ctx.jsonp({
            status: 1,
            msg: 'id 为空'
        });
    }

    console.log(ctx.header);

    return ctx.jsonp({
        status: 0,
        data: {
            like: parseInt(ctx.cookies.get('like'), 10),
            isLogin: !!ctx.session.user,
            isLike: !!ctx.session.user && !!ctx.cookies.get(`isLike@${ctx.session.user.username}`)
        }
    });
}));

// 点赞
app.use(mount('/mip-login-app/api/set.like.json', async ctx => {
    if (!ctx.query.id) {
        return ctx.jsonp({
            status: 1,
            msg: 'id 为空'
        });
    }
    else if (!ctx.session.user) {
        return ctx.jsonp({
            status: 3,
            msg: '未登录'
        });
    }

    // 点赞+1
    let like = ctx.cookies.get('like') - 0;
    if (!ctx.cookies.get(`isLike@${ctx.session.user.username}`)) {
        like += 1;
        ctx.cookies.set('like', like, {
            expires: new Date('2020-01-01')
        });
        ctx.cookies.set(`isLike@${ctx.session.user.username}`, '1');
    }

    ctx.jsonp({
        status: 0,
        data: {
            like
        }
    });
}));

// 获取用户信息
app.use(mount('/mip-login-app/api/userinfo.json', async ctx => {
    ctx.jsonp({
        status: 0,
        data: ctx.session.user
    });
}));

// 登录接口
app.use(mount('/mip-login-app/api/login.json', async ctx => {
    const {username, password} = ctx.query;

    if (!username || !password) {
        return ctx.jsonp({
            status: 2,
            msg: '用户名或密码为空'
        });
    }
    else if (username !== password) {
        return ctx.jsonp({
            status: 3,
            msg: '用户名或密码错误'
        });
    }

    // 记录 session
    ctx.session.user = {
        username,
        uid: 1
    };

    ctx.jsonp({
        status: 0,
        data: ctx.session.user
    });
}));

// 退出
app.use(mount('/mip-login-app/api/exit.json', async ctx => {
    ctx.session.user = null;

    ctx.jsonp({
        status: 0
    });
}));

// 静态代理
app.use(mount('/mip-login-app/', serve(__dirname)));
app.listen(3000);
