const Koa = require('koa')
const path = require('path')
const app = new Koa()
const Pug = require('koa-pug')
const pug = new Pug({
  viewPath: path.join(process.cwd(), '/source/template/pages'),
  baseDir: path.join(process.cwd(), '/source/template'),
  pretty: true,
  noCache: true,
  app: app
})

const static = require('koa-static')
app.use(static(path.join(process.cwd(), '/public')))

const koaBody = require('koa-body')
app.use(koaBody({
  formidable: {
    uploadDir: path.join(process.cwd(), '/public/assets/img/products')
  },
  multipart: true
}))

app.keys = ['12f23rfwf2']
const session = require('koa-session')
app.use(session({
  key: 'koa:sess',
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
}, app))

const flash = require('koa-flash-simple')
app.use(flash())

const router = require('./routes')
app.use(router.routes())
app.use(router.allowedMethods())

app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.render('error', { status: ctx.status, error: ctx.message })
    }
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.render('error', { status: ctx.status, error: ctx.message })
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
