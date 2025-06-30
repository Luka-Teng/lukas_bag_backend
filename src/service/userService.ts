import { PrismaClient } from '@prisma/client'
import { createError } from '../utils/response'

export class UserService {
  private prisma = new PrismaClient()

  async updateUserInfo(params: {
    userId: string
    name?: string
    avatar?: string
  }) {
    const { userId, name, avatar } = params

    const existing = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!existing) {
      throw createError('用户不存在')
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        name,
        avatar
      }
    })

    return user
  }
}