/* express服务入口 */
import express from 'express'
import bodyParser from 'body-parser'
import ContentController from './controller/content'
import logger from './logger'
import dotenv from 'dotenv'

/* 配置环境变量 */
dotenv.config({ path: [`.env.${process.env.NODE_ENV}`, '.env'] })

/* express实例 */
const app = express()

/* 处理静态资源 */
app.use('/static', express.static('public'))

/* 解析body */
app.use(bodyParser.json())

/* 处理api */
app.use('/api/content', ContentController)

/* 终端输出log */
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

/* 错误的统一处理 */
app.use((err: any, req: any, res: any, _next: any) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  /* 为error添加额外信息用于log */
  err.url = req.url
  err.method = req.method
  logger.error(err)

  /* 输出错误 */
  res.status(statusCode).json({ status: 'error', message })
})

/* 404 */
app.use(function (_req, res, _next) {
  res.status(404).send("Sorry can't find that!")
})

app.listen(3000, () => {
  logger.info('server is running on http://localhost:3000')
})