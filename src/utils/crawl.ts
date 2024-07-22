import axios from 'axios'
import config from './crawlConfig'
import { getQueryParams, getRemoteVideoSize, joinUrl } from './general'

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
    try {
      let stateString = match[1].replace(/undefined/g, '""')

      stateString = decodeURIComponent(stateString)

      return JSON.parse(stateString)
    } catch (error) {
      return null
    }
  }
  return null
}

// 从initialState中获取笔记信息
const getNoteDetail = (initialState: Record<string, any>, noteId: string) => {
  const noteDetail = {
    noteId,
    title: '',
    desc: '',
    images: [] as string[],
    video: {
      url: '',
      format: ''
    }
  }

  const noteInfo = initialState?.note?.noteDetailMap && initialState?.note?.noteDetailMap[noteId]
  if (noteInfo) {
    noteDetail.title = noteInfo.note.title
    noteDetail.desc = noteInfo.note.desc
    noteDetail.images = noteInfo.note.imageList
    .map((image: any) => image.infoList.filter((item: any) => item.imageScene === 'WB_DFT')
    .map((item: any) => item.url))
    .flat()
    .map((url: string) => url.replace('http://', 'https://'))
    
    const originVideoKey = noteInfo.note?.video?.consumer?.originVideoKey
    if (originVideoKey) {
      noteDetail.video.url = joinUrl(process.env.redBookVideoHost || '', originVideoKey)
      const stream = noteInfo.note?.video?.media?.stream || {}
      const streamInfo = Object.keys(stream)
        .map((key: string) => {
          const items = stream[key]
          return items[0]
        })
        .filter(item => item)[0]
      noteDetail.video.format = streamInfo?.format || ''
    }
  }

  return noteDetail
}

// 主函数
export const crawl = async (shortUrl: string) => {
  const longUrl = await getLongUrl(shortUrl)
  console.log(`Long URL: ${longUrl}`)

  if (!longUrl) {
    console.log('Failed to get the long URL.')
    return null
  }

  // 获取笔记id, 格式为/explore/{noteId}或/discovery/item/{noteId}, 使用正则进行匹配
  const noteId = longUrl.match(/\/(explore|discovery\/item)\/([\d\w]+)/)?.[2]

  if (!noteId) {
    console.log('Failed to get the noteId.')
    return null
  }

  const htmlContent = await getHtmlContent(longUrl)

  if (!htmlContent) {
    console.log('Failed to get HTML content.')
    return null
  }

  const initialState = getInitialState(htmlContent)

  if (!initialState) {
    console.log('Failed to get initialState.')
    return null
  }

  const {
    title,
    desc,
    images,
    video
  } = getNoteDetail(initialState, noteId)

  const result: any = {
    title,
    desc,
    images
  }

  if (video.url) {
    const size = await getRemoteVideoSize(video.url)
    result.video = {
      url: video.url,
      format: video.format,
      size: `${size}`,
      sizeUnit: 'bytes'
    }
  }

  return result
}