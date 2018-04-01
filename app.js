/**
 * @file 服务端运行环境
 * @author xuexb <fe.xiaowu@gmail.com>
 */

const Koa = require('koa');
const session = require('koa-session2');
const serve = require('koa-static');
const mount = require('koa-mount');
const KeyCache = require('key-cache');
const cache = new KeyCache();
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

// 注入使用本地文件缓存来记录赞数
app.use(async (ctx, next) => {
    const like = cache.get('like');

    if (!like && like !== 0) {
        cache.set('like', 0);
    }

    if (!cache.get('count')) {
        cache.set('count', 0);
    }

    await next();
});

// 注入异步接口添加跨域和不缓存
app.use(mount('/api', async (ctx, next) => {
    ctx.set('Content-Type', 'application/json; charset=utf-8');
    ctx.set('Cache-Control', 'no-cache,no-store');

    // 非 jsonp 配置 CORS
    if (!ctx.query.callback) {
        ctx.set('Access-Control-Allow-Credentials', true);
        ctx.set('Access-Control-Allow-Origin', ctx.header.origin || '*');
    }

    await next();
}));

// 获取文章阅读数
app.use(mount('/api/get.count.json', async ctx => {
    if (!ctx.query.id) {
        return ctx.jsonp({
            status: 1,
            msg: 'id 为空'
        });
    }

    // 点击数+1
    cache.set('count', cache.get('count') + 1);

    return ctx.jsonp({
        status: 0,
        data: {
            like: cache.get('count')
        }
    });
}));

// 获取是否喜欢接口
app.use(mount('/api/get.love.json', async ctx => {
    if (!ctx.query.id) {
        return ctx.jsonp({
            status: 1,
            msg: 'id 为空'
        });
    }

    return ctx.jsonp({
        status: 0,
        data: {
            isLogin: !!ctx.session.user,
            isLike: !!ctx.session.user && !!cache.get(`isLove@${ctx.session.user.username}`)
        }
    });
}));

// 设置喜欢接口
app.use(mount('/api/set.love.json', async ctx => {
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
    if (!cache.get(`isLove@${ctx.session.user.username}`)) {
        cache.set(`isLove@${ctx.session.user.username}`, 1);
    }

    ctx.jsonp({
        status: 0,
        data: {
        }
    });
}));


// 获取点赞接口
app.use(mount('/api/get.like.json', async ctx => {
    if (!ctx.query.id) {
        return ctx.jsonp({
            status: 1,
            msg: 'id 为空'
        });
    }

    return ctx.jsonp({
        status: 0,
        data: {
            like: cache.get('like'),
            isLogin: !!ctx.session.user,
            isLike: !!ctx.session.user && !!cache.get(`isLike@${ctx.session.user.username}`)
        }
    });
}));

// 点赞
app.use(mount('/api/set.like.json', async ctx => {
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
    let like = cache.get('like');
    if (!cache.get(`isLike@${ctx.session.user.username}`)) {
        like += 1;
        cache.set('like', like);
        cache.set(`isLike@${ctx.session.user.username}`, 1);
    }

    ctx.jsonp({
        status: 0,
        data: {
            like
        }
    });
}));

// 获取用户信息
app.use(mount('/api/userinfo.json', async ctx => {
    ctx.jsonp({
        status: 0,
        data: ctx.session.user
    });
}));

// 登录接口
app.use(mount('/api/login.json', async ctx => {
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
app.use(mount('/api/exit.json', async ctx => {
    ctx.session.user = null;

    ctx.jsonp({
        status: 0
    });
}));

// 静态代理
app.use(mount('/', serve(__dirname)));
app.listen(3000);
