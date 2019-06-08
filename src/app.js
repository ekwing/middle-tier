const Koa = require('koa')
const setBodyParser = require('koa-bodyparser')
const setJsonPrinter = require('koa-json')
const setLogger = require('koa-logger')
const setViews = require('koa-views')
const router = require('./routes')

const app = new Koa()

app.use(setBodyParser({
  enableTypes: ['json', 'form', 'text']
}))

app.use(setJsonPrinter())

app.use(setLogger())

app.use(setViews(`${__dirname}/views`, {
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