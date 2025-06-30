import express from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient, User } from '@prisma/client'
import { createResponse, createError } from '../utils/response'
import AuthService from '../service/authService'

const prisma = new PrismaClient()

const router = express.Router()

const authService = new AuthService()

router.post('/login', async (req, res) => {
  const { code } = req.body

  let user: User | null = null

  if (!code) {
    throw createError('code is required')
  }

  const openid = await authService.wechatCode2Session(code as string)

  // 获取用户
  user = await prisma.user.findUnique({
    where: {
      openid: openid
    }
  })

  // 如果用户不存在，创建用户
  if (!user) {
    user = await prisma.user.create({
      data: {
        openid
      }
    })
  }

  res.json(createResponse({
    token: jwt.sign(user, process.env.JWT_SECRET as string, {
      /* 一个月有效期 */
      expiresIn: 60 * 60 * 30
    })
  }))
})

export default router