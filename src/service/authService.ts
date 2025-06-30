import axios from 'axios'
import { createError } from '../utils/response'

export default class ContentService {
  async wechatCode2Session(code: string) {
    try {
      const { data } = await axios.get(
        process.env.WECHAT_API_URL as string + '/sns/jscode2session', {
        params: {
          appid: process.env.WECHAT_APPID as string,
          secret: process.env.WECHAT_SECRET as string,
          js_code: code,
          grant_type: 'authorization_code'
        }
      })
  
      const { errcode, openid } = data

      if (errcode) {
        throw createError(`获取微信授权失败: ${errcode}`)
      }
  
      return openid 
    } catch (e: any) {
      if (e.name === 'BizError') throw e
      throw createError(`获取微信授权失败: ${e.message}`)
    }
  }
}