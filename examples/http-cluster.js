// http://blog.fens.me/nodejs-core-cluster/

const cluster = require('cluster')
const http = require('http')
const cpuCount = require('os').cpus().length

if (cluster.isMaster) {
  console.log('[master] start master...')

  for (let i = 0; i < cpuCount; i++) {
    cluster.fork()
  }

  cluster.on('listening', (worker, address) => {
    console.log(`[master] listening: worker-${worker.id}, pid:${worker.process.pid}, Address:${address.address || '0.0.0.0'}:${address.port}`)
  })
} else if (cluster.isWorker) {
  console.log(`[workder] start worker ... ${cluster.worker.id}`)

  http.createServer((req, res) => {
    res.end('Hello World!')
  }).listen(3000)
}