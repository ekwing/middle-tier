const router = require('koa-router')()

router.get('/', (ctx, next) => {
  ctx.body = 'Hello Ekwing!'
})

module.exports = router