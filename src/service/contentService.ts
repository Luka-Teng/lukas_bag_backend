import fs from 'fs'
import { extractShortLink } from '../utils/general'
import { crawl } from '../utils/crawl'
import { createError } from '../utils/error'

export default class ContentService {
  async getNoteContent(text: string) {
    const shortLink = extractShortLink(text)

    /* 解析不出短链，返回空数据 */
    if (!shortLink) throw createError('解析短链失败')

    /* 爬取数据 */
    const noteId = await crawl(shortLink)

    /* 获取不到笔记，返回空数据 */
    if (!noteId) throw createError('获取笔记失败')

    /* 查询public/media/{noteId}下的所有目录 */
    const mediaPath = `./public/media/${noteId}`
    let mediaList: string[] = []

    try {
      mediaList = fs.readdirSync(mediaPath)
    } catch (e) {
      // do nothing
    }

    return mediaList.map(mediaType => {
      /* 查询public/media/{noteId}/{mediaType}下的所有文件 */
      const mediaTypePath = `${mediaPath}/${mediaType}`
      let mediaList: string[] = []

      try {
        mediaList = fs.readdirSync(mediaTypePath)
      } catch (e) {
        // do nothing
      }

      return {
        mediaType,
        mediaList: mediaList.map(media => `/public/media/${noteId}/${media}`)
      }
    }).reduce((acc, cur) => {
      acc[cur.mediaType] = cur.mediaList
      return acc
    }, {} as Record<string, string[]>)
  }
}