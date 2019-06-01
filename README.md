# server

## cluster多进程
```javascript
const cluster = require('cluster')
const http = require('http')
const cpuCount = require('os').cpus().length

if (cluster.isMaster) {
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worder, code, signal) => {
    
  })
} else {
  http.createServer((req, res) => {
    res.writeHead(200)
    res.end('Hello World\n')
  }).listen(80)
}
```

## 负载均衡
多进程目的是尽可能利用多核CPU，提高单机的负载能力，但实际项目中受到业务逻辑的处理时间长短和系统CPU调度影响，导致所有进程的负载不是理想的彻底均衡，70%的请求最终落到2个worker身上，而2个worker占用更多的CPU资源。因此实际项目中，可以将worker绑定到CPU，利用linux命令tasket
```javascript
cp.exec(`tasket -cp ${cpu} ${process.pid}`, { timeout: 5000 }, (err, data, errData) => {
  if (err) {
    logger.error(err.stack)
  }

  if (data.length) {
    logger.info('\n' + data.toString('UTF-8'))
  }

  if (errData.length) {
    logger.error('\n' + errData.toString('UTF-8'))
  }
})
```

## 平滑重启
每次发布新版本，服务器必然重启。杀掉主进程，全部重启，必然有一段时间服务终端。

所以需要平滑重启，重启过程中，服务不中断：
1. worker进程轮流重启，间隔时间
2. worker进程并不是直接重启，而是先关闭新请求监听，等当前请求都返回了，再重启
```javascript
try {
  const killtimer = setTimeout(() => {
    process.exit(1)
  }, 30000)

  server.close()

  cluster.worker.disconnect()
} catch(err) {}
```

## 性能测试

`TPS(Transactions Per Second)`，每秒处理的事务数目。一个事务是指一个客户机向发送请求然后服务器做出反应的过程。客户机在发送请求时开始计时，收到服务器响应后结束计时，以此来计算使用的事件和完成的事务个数，最终利用这些信息做出的评估分。

`QPS(Queires Per Second)`，每秒能处理查询数目，每一台服务器每秒都能够响应的查询次数，是对一个特定的查询服务器在规定事件内所处理流量多少的衡量标准

`RPS(Requests Per Second)`，每秒能处理的请求数目，等效于`QPS`

`RT`（响应时间），指系统对请求做出响应的时间

`Throughput`（吞吐量），指系统在单位事件内处理请求的数量

## 参考
- [node.js cluster多进程、负载均衡和平滑重启](https://www.cnblogs.com/kenkofox/p/5431643.html)