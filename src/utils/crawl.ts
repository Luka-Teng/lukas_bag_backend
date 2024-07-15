import axios from 'axios'
import { rmSync, existsSync } from 'fs-extra'
import config from './crawlConfig'
import { downloadMedia, getQueryParams } from './general'



// 请求短链获取重定向后的长链接
const getLongUrl = async (shortUrl: string): Promise<string> => {
  let url = ''
  try {
    const res = await axios.head(shortUrl, { maxRedirects: 10 })
    url = res.request.res.responseUrl
  } catch (error: any) {
    if (error.request?.res?.responseUrl) {
      url = error.request.res.responseUrl
    } else {
      throw new Error('获取长链接失败，请检查失败原因。')
    }
  }

  /**
   * 部分情况下小红书需要验证, 需要如下几步判断
   * 1. 判断url时候存在redirectPath参数
   * 2. 提取redirectPath参数值
   * 3. 解析的时候注意redirectPath不一定是唯一参数
   */
  const params = getQueryParams(url)
  if (params.redirectPath) {
    url = decodeURIComponent(params.redirectPath)
  }

  return url
}

// 请求长链接并获取HTML内容
const getHtmlContent = async (longUrl: string): Promise<string | null> => {
  try {
    const response = await axios.get(longUrl, {
      headers: {
        ...config.commonHeaders,
        cookie: config.cookies.join('; ')
      }
    })
    return response.data
  } catch (error) {
    console.error('Error getting HTML content:', error)
    return null
  }
}

// 解析HTML内容获取window.__INITIAL_STATE__
const getInitialState = (htmlContent: string): Record<string, any> | null => {
  const match = htmlContent.match(/window\.__INITIAL_STATE__\s*=\s*(.*?)\<\/script\>/)
  if (match) {
    let stateString = match[1].replace(/undefined/g, '""')

    /* 对于\u002F字符，替换为/ */
    stateString = stateString.replace(/\\u002F/g, '/')

    return JSON.parse(stateString)
  }
  return null
}

// 下载图片
const downloadImages = async (imageList: string[], path: string, format?: string): Promise<void> => {
  for (let i = 0; i < imageList.length; i++) {
    await downloadMedia(imageList[i], path, format)
  }
}

// 下载视频
const downloadVideo = async (videoUrl: string, path: string, format?: string): Promise<void> => {
  await downloadMedia(videoUrl, path, format)
}

// 主函数
export const crawl = async (shortUrl: string) => {
  const longUrl = await getLongUrl(shortUrl)
  console.log(`Long URL: ${longUrl}`)

  if (longUrl) {
    // 获取笔记id, 格式为/explore/{noteId}或/discovery/item/{noteId}, 使用正则进行匹配
    const noteId = longUrl.match(/\/(explore|discovery\/item)\/([\d\w]+)/)?.[2]

    const htmlContent = await getHtmlContent(longUrl)
    if (htmlContent && noteId) {
      const initialState = getInitialState(htmlContent)
      const noteDetail = initialState?.note?.noteDetailMap[noteId]
      if (noteDetail) {
        const imageList = noteDetail.note.imageList.map((image: any) => image.infoList.filter((item: any) => item.imageScene === 'WB_DFT').map((item: any) => item.url)).flat()
        
        const stream = noteDetail.note?.video?.media?.stream || {}
        const video = Object.keys(stream)
          .map((key: string) => {
            const items = stream[key]
            return items[0]
          })
          .filter(item => item)[0]

        const path = `${process.env.publicPath}/note/${noteId}`
        if (existsSync(path)) {
          rmSync(path, { recursive: true })
        }
        if (video) {
          await downloadVideo(video.masterUrl, path, video.format)
        } else {
          await downloadImages(imageList, path)
        }
        console.log('All resources downloaded successfully.')
      } else {
        console.log('Failed to retrieve resources')
      }
      return {
        noteId,
        title: noteDetail.note.title,
        desc: noteDetail.note.desc,
      }
    } else {
      console.log('Invalid HTML content.')
    }
  } else {
    console.log('Failed to get the long URL.')
  }

  return null
}