/* express服务入口 */
import express from 'express'
import bodyParser from 'body-parser'
import router from './router'
import logger from './logger'

const app = express()

app.use(bodyParser.json())

app.use('/api', router)

app.listen(3000, () => {
  logger.error('server is running on http://localhost:3000')
})