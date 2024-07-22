import { extractShortLink } from '../utils/general'
import { crawl } from '../utils/crawl'
import { createError } from '../utils/error'

export default class ContentService {
  async getNoteContent(text: string) {
    const shortLink = extractShortLink(text)

    /* 解析不出短链，返回空数据 */
    if (!shortLink) throw createError('解析短链失败')

    /* 爬取数据 */
    const data = await crawl(shortLink)

    /* 获取不到笔记，返回空数据 */
    if (!data) throw createError('获取笔记失败')

    return data
  }
}