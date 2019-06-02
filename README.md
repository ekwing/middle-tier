# middle-tier

前后端分离存在问题：
- 各层职责重叠
  - Client-side Model是Server-side Model的加工
  - Client-side View跟Server-side是不同层次的东西
  - Client-side的Controller跟Server-side的Controller互不相干
  - Client-side控制路由，Server-side可能没有
- 性能问题
  - 需要等待资源到齐才能渲染，会有白屏现象
- 逻辑复用问题
  - 模板无法重用，造成维护上的麻烦与不一致
  - 逻辑无法重用，前端校验后端仍须再做一次
  - 路由无法重用，前端的路由在后端未必存在
- 跨终端问题
  - 业务太靠前，导致不同段重复实现
  - 逻辑太靠前，造成维护上的不易

中间层的作用：
- 转发数据，串接服务
- 路由设计，逻辑控制
- 渲染页面，体验优化
- 日志、监控、路由、限流、缓存、代理

## NodeJS
NodeJS是基于Chrome浏览器的V8引擎构建的，其模型与浏览器类似，javascript运行在单个进程的单个线程上有这样的好处：
- 状态单一
- 没有锁
- 不需要线程间同步
- 减少系统上下文的切换
- 有效提高单核CPU的使用率

### 多进程架构
面对单进程单线程对多核使用率不高的问题，每个进程各使用一个CPU即可，以此实现多核CPU的利用。Node提供了`child_process`模块，并且也提供了`fork()`方法来实现进程的复制(只要是进程复制，都需要一定的资源和时间。
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

### 负载均衡
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

### 平滑重启
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

### 性能测试

`TPS(Transactions Per Second)`，每秒处理的事务数目。一个事务是指一个客户机向发送请求然后服务器做出反应的过程。客户机在发送请求时开始计时，收到服务器响应后结束计时，以此来计算使用的事件和完成的事务个数，最终利用这些信息做出的评估分。

`QPS(Queires Per Second)`，每秒能处理查询数目，每一台服务器每秒都能够响应的查询次数，是对一个特定的查询服务器在规定事件内所处理流量多少的衡量标准

`RPS(Requests Per Second)`，每秒能处理的请求数目，等效于`QPS`

`RT`（响应时间），指系统对请求做出响应的时间

`Throughput`（吞吐量），指系统在单位事件内处理请求的数量

#### 压力测试工具siege

部分参数说明
```bash
siege [options]

-c 100 指定并发数 100
-r 10 指定测试次数 10
-f urls.txt 指定url文件
-i internet系统，随机发送url
-b 请求无需等待 -d NUM 延迟多少秒
-t 5 持续测试5分钟 -t3600S, -t60M, -t1H
-v 输出详细信息
-l 记录压测日志信息到指定文件
```

结果说明
```bash
Transaction: 总测试次数
Availability: 成功次数百分比
Elapsed Time: 总共耗时多少秒
Data Transferred: 总共数据传输
Response Time: 平均响应耗时
Transaction Rate: 平均每秒处理请求数
Throughput: 吞吐率
Concurrency: 最高并发
Successful Transactions: 成功的请求数
Failed Transactions: 失败的请求数
```

## 问题

```
问：使用`cluster`模块后，`RPS`、`QPS`等参数没有明显变化？
答：启动多个进程只是为了充分将CPU资源利用起来，而不是为了解决并发问题。
```

```
问：业务形态没有足够多样化时，中间层的收益可能不大，后端职责减轻，前端职责变得复杂，最终人天可能增加？
答：中间层的目标并不是加快开发效率，而是增强前端的可控性，如服务端渲染、接口合并拆分、日志监控、限流等。
```

```
问：引入中间层后，工作流程的变化？
答：
后端：数据接口(可省略)                               -> 联调
前端：        -> 业务接口(中间层) -> 页面开发         -> 联调
```

```
问：中间层的核心部分和业务部分如何划分？
答：
- 核心部分，包含进程管理、负载均衡、日志监控等基础功能 - 公共部分
- 业务部分，为前端提供如接口合并拆分、服务端渲染等功能 - controller部分

- 不同业务线分配不同的中间层，通过`Nginx`转发，中间层核心部分实现要统一，实现一个基础框架
- 中间层业务部分，由负责对应端业务的人开发，代码按端业务模块进行组织
```

## 参考
- [NodeJS充分利用多核CPU以及它的稳定性](https://segmentfault.com/a/1190000007343993)
- [node.js cluster多进程、负载均衡和平滑重启](https://www.cnblogs.com/kenkofox/p/5431643.html)