const router = require('koa-router')()

router.get('/user', (ctx, next) => {
  ctx.body = 'user'
  next()
})

module.exports = router