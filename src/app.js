const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const views = require('koa-views')
const router = require('./routes')

const app = new Koa()

app.use(bodyParser({
  enableTypes: ['json', 'form', 'text']
}))

app.use(logger())

app.use(views(`${__dirname}/views`, {
  extension: 'pug'
}))

app.use(router.routes())

// global error handler
app.use((ctx, next) => {
  if (ctx.status == 404) {
    return ctx.render('error/404')
  }
})

module.exports = app