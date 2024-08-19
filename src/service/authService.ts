import axios from 'axios'

export default class ContentService {
  async wechatCode2Session(code: string) {
    const { data } = await axios.get(process.env.WECHAT_API_URL as string, {
      params: {
        appid: process.env.WECHAT_APPID as string,
        secret: process.env.WECHAT_APP_SECRET as string,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { errcode, openid } = data

    if (errcode !== 0) {
      throw new Error(`获取微信授权失败: ${errcode}`)
    }

    return openid
  }
}