import express from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient, User } from '@prisma/client'
import { createResponse, createError } from '../utils/response'
import AuthService from '../service/authService'
import { validatePassword } from '../utils/encrypt'

const prisma = new PrismaClient()

const router = express.Router()

const authService = new AuthService()

router.get('/login', async (req, res) => {
  const { email, password, loginType , code } = req.query

  let user: User | null = null

  if (loginType === 'password') {
    if (!email || !password) {
      throw createError('email and password are required')
    }

    /* 获取用户 */
    user = await prisma.user.findUnique({
      where: {
        email: email as string
      }
    })

    /* 验证密码 */
    if (user && user.password && await validatePassword(password as string, user.password)) {
      throw createError('email or password is wrong')
    }
  }

  if (loginType === 'wechat') {
    if (!code) {
      throw createError('code is required')
    }

    const openid = await authService.wechatCode2Session(code as string)

    /* 获取用户 */
    user = await prisma.user.findUnique({
      where: {
        openId: openid
      }
    })
  }

  if (!user) {
    throw createError('user not found')
  }

  res.json(createResponse({
    token: jwt.sign(user, process.env.JWT_SECRET as string, {
      /* 一个月有效期 */
      expiresIn: 60 * 60 * 30
    })
  }))
})

export default router