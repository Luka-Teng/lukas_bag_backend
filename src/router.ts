/* express router */
import express from 'express'

const router = express.Router()

router.get('/user', (req, res) => {
  res.send('user')
})

export default router