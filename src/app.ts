/* express服务入口 */
import express from 'express'
import 'express-async-errors'
import bodyParser from 'body-parser'
import ContentController from './controller/content'
import logger from './logger'
import dotenv from 'dotenv'
import BizError from './error/BizError'

/* 配置环境变量 */
dotenv.config({ path: [`.env.${process.env.NODE_ENV}`, '.env'] })

/* express实例 */
const app = express()

/* 处理静态资源 */
app.use('/static', express.static('public'))

/* 解析body */
app.use(bodyParser.json())

/* 处理api */
app.use('/content', ContentController)

/* 终端输出log */
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

/* 错误的统一处理 */
app.use((err: any, req: any, res: any, _next: any) => {
  /* 为error添加额外信息用于log */
  err.url = req.url
  err.method = req.method
  logger.error(err)

  // 非业务错误
  if (!(err instanceof BizError)) {
    err.message = 'Internal Server Error'
  }

  /* 输出错误 */
  res.status(err.statusCode || 500).json({ status: 'error', message: err.message })
})

/* 404 */
app.use(function (_req, res, _next) {
  res.status(404).json({ status: 'error', message: 'Not found' })
})

app.listen(3000, () => {
  logger.info('server is running on http://localhost:3000')
})