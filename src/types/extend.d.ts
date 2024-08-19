/* 用于扩展express相关属性 */
import { type User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}