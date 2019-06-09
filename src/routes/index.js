const router = require('koa-router')()
const api = require('./api')

router.get('/', (ctx, next) => {
  ctx.body = 'Hello Ekwing!'
})

router.use('/api', api.routes(), api.allowedMethods())

module.exports = router