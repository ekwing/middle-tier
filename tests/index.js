const siege = require('siege')

siege()
  .on(3000)
  .for(200000).times
  .get('/')
  .attack()