import fs from 'fs'
export default class ContentService {
  getNoteContent(noteId: string) {
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