/* express服务入口 */
import path from 'path'
import express from 'express'
import 'express-async-errors'
import bodyParser from 'body-parser'
import { expressjwt, Request as JWTRequest } from 'express-jwt'
import ContentController from './controller/content'
import AuthController from './controller/auth'
import GameController from './controller/game'
import logger from './logger'
import dotenv from 'dotenv'
import BizError from './error/BizError'

/* 配置环境变量 */
const envPath = process.env.NODE_ENV 
  ? path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) 
  : path.resolve(process.cwd(), '.env')
dotenv.config({ path: envPath, override: true })

/* express实例 */
const app = express()

/* 终端输出log */
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

/* jwt校验 */
app.use(expressjwt({
  secret: process.env.JWT_SECRET as string,
  algorithms: [process.env.JWT_ALGORITHM as any]
}).unless({
  path: ['/auth/login']
}), (req: JWTRequest, _res, next) => {
  (req as any).user = req.auth?.data
  next()
})

/* 处理静态资源 */
app.use('/static', express.static('public'))

/* 解析body */
app.use(bodyParser.json())

/* 处理api */
app.use('/content', ContentController)
app.use('/auth', AuthController)
app.use('/game', GameController)

/* 错误的统一处理 */
app.use((err: any, req: any, res: any, _next: any) => {
  /* 为error添加额外信息用于log */
  err.url = req.url
  err.method = req.method
  logger.error(err)

  if (err.name === 'UnauthorizedError') {
    // 鉴权错误
    err.message = 'Unauthorized'
    err.statusCode = 401
  } else if (!(err instanceof BizError)) {
    // 非业务错误
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